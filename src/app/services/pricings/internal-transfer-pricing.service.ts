import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, switchMap, startWith, map, catchError, of } from 'rxjs';
import { CryptoTransactionService } from '../crypto-transaction.service';
import { ConfigurationService } from '../configuration.service';
import { CryptoCurrency } from 'src/app/models/pricings-elements';
import { ResponseParent } from 'src/app/models/Transaction';

export interface InternalTransferPricingItem {
    name: string;
    abv: string;
    usdValue: string;
    xafValue: string;
    transferFee: string;
    transferXafFee: string;
    minCryptoTransferValue: string;
    minTransferValue: string;
    minTransferXafValue: string;
    icon: string;
}

@Injectable({
    providedIn: 'root'
})
export class InternalTransferPricingService {
    private internalTransferPricingItemsSubject = new BehaviorSubject<InternalTransferPricingItem[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private errorSubject = new BehaviorSubject<string | null>(null);

    public internalTransferPricingItems$ = this.internalTransferPricingItemsSubject.asObservable();
    public loading$ = this.loadingSubject.asObservable();
    public error$ = this.errorSubject.asObservable();

    private readonly REFRESH_INTERVAL = 30000; // 30 seconds
    private readonly TIMEOUT_DURATION = 10000; // 10 seconds
    private readonly supportedCryptos: CryptoCurrency[] = [
        {
            symbol: 'USDT',
            name: 'Tether',
            icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/825.png'
        },
        {
            symbol: 'BTC',
            name: 'Bitcoin',
            icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1.png'
        },
        {
            symbol: 'ETH',
            name: 'Ethereum',
            icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1027.png'
        },
        {
            symbol: 'XAF',
            name: 'Franc CFA',
            icon: '../../../../assets/images/XAF.png' // No specific icon for XAF
        }
    ];

    constructor(
        private cryptoService: CryptoTransactionService,
        private configurationService: ConfigurationService
    ) {
        this.initializeAutoRefresh();
    }

    public refreshPricing(): void {
        this.loadingSubject.next(true);
        this.updateInternalTransferPricingData().subscribe({
            next: () => this.handleUpdateSuccess(),
            error: (error) => this.handleUpdateError(error)
        });
    }

    private initializeAutoRefresh(): void {
        this.configurationService.updateConfigurations();
        interval(this.REFRESH_INTERVAL).pipe(
            startWith(0),
            switchMap(() => {
                this.loadingSubject.next(true);
                return this.updateInternalTransferPricingData();
            })
        ).subscribe({
            next: () => this.handleUpdateSuccess(),
            error: (error) => this.handleUpdateError(error)
        });
    }

    private updateInternalTransferPricingData(): Observable<void> {
        return this.configurationService.configuration$.pipe(
            switchMap(() => {
                this.initializeItemsIfEmpty();
                return this.processCryptoItems();
            }),
            catchError(error => {
                this.handleError(error);
                return of(void 0);
            })
        );
    }

    private initializeItemsIfEmpty(): void {
        const currentItems = this.internalTransferPricingItemsSubject.getValue();
        if (currentItems.length === 0) {
            this.internalTransferPricingItemsSubject.next(this.getDefaultInternalTransferPricingItems());
        }
    }

    private getDefaultInternalTransferPricingItems(): InternalTransferPricingItem[] {
        return this.supportedCryptos.map(crypto => ({
            name: crypto.name,
            abv: crypto.symbol,
            usdValue: 'Loading...', 
            xafValue: 'Loading...', 
            transferFee: 'Loading...', 
            transferXafFee: 'Loading...', 
            minCryptoTransferValue: 'Loading...', 
            minTransferValue: 'Loading...', 
            minTransferXafValue: 'Loading...', 
            icon: crypto.icon
        }));
    }

    private processCryptoItems(): Observable<void> {
        let completedCount = 0;
        const totalCryptos = this.supportedCryptos.length;

        return new Observable<void>(observer => {
            this.supportedCryptos.forEach(crypto => {
                this.buildInternalTransferPricingItem(crypto).subscribe({
                    next: (pricingItem) => {
                        this.replaceInternalTransferPricingItem(pricingItem);
                        this.checkCompletion(++completedCount, totalCryptos, observer);
                    },
                    error: () => {
                        this.ensureDefaultItem(crypto);
                        this.checkCompletion(++completedCount, totalCryptos, observer);
                    }
                });
            });

            this.setTimeoutSafety(completedCount, totalCryptos, observer);
        });
    }

    private buildInternalTransferPricingItem(crypto: CryptoCurrency): Observable<InternalTransferPricingItem> {
        const minXafAmount = this.configurationService.getConfigByKey('MIN_XAF_AMOUNT');

        if (crypto.symbol === 'XAF') {
            return this.createXafInternalTransferPricingItem(minXafAmount);
        }

        const referenceAmount = this.getReferenceAmount(crypto.symbol);

        const conversionObs = this.cryptoService.convertToFiat({
            amount: referenceAmount,
            crypto_currency: crypto.symbol
        });

        const minCryptoObs = this.cryptoService.convertToCrypto({
            amount: minXafAmount ?? 500
        });

        return conversionObs.pipe(
            switchMap(conversionResponse => {
                return minCryptoObs.pipe(
                    map(minResponse => this.createInternalTransferPricingItemFromResponses(
                        crypto,
                        conversionResponse.data,
                        minResponse.data,
                        referenceAmount,
                        minXafAmount
                    ))
                );
            }),
            catchError(() => {
                const currentItems = this.internalTransferPricingItemsSubject.getValue();
                const existingItem = currentItems.find(item => item.abv === crypto.symbol);
                if (existingItem) {
                    return of(existingItem);
                } else {
                    return this.createDefaultInternalTransferPricingItem(crypto);
                }
            })
        );
    }

    private createXafInternalTransferPricingItem(minXafAmount: number): Observable<InternalTransferPricingItem> {
        const transferFeePercentage = this.configurationService.getConfigByKey('XAF_OTHER_WALLET_TRANSFER_FEES');
        const xafAmount = 1000;
        const feeXaf = (xafAmount * transferFeePercentage) / 100;

        return of({
            name: 'XAF',
            abv: 'XAF',
            usdValue: this.formatCurrency(xafAmount, 'XAF'),
            xafValue: this.formatCurrency(xafAmount, 'XAF'),
            transferFee: `${this.formatCurrency(feeXaf, 'XAF')} (${transferFeePercentage}%)`,
            transferXafFee: `${this.formatCurrency(feeXaf, 'XAF')} (${transferFeePercentage}%)`,
            minCryptoTransferValue: this.formatCurrency(minXafAmount, 'XAF'),
            minTransferValue: this.formatCurrency(minXafAmount, 'XAF'),
            minTransferXafValue: this.formatCurrency(minXafAmount, 'XAF'),
            icon: ''
        });
    }

    private getReferenceAmount(symbol: string): number {
        switch (symbol) {
            case 'USDT': return 1;
            case 'BTC': return 0.001;
            case 'ETH': return 0.01;
            default: return 0.01;
        }
    }

    private createInternalTransferPricingItemFromResponses(
        crypto: CryptoCurrency,
        conversionData: any,
        minData: any,
        referenceAmount: number,
        minXafAmount: number
    ): InternalTransferPricingItem {
        const networkFeePercentage = this.configurationService.getConfigByKey('CRYPTO_SEND_TO_FRIEND_NETWORK_FEES_PERCENTAGE');
        const transferFeePercentage = this.configurationService.getConfigByKey('CRYPTO_SEND_TO_FRIEND_FEES_PERCENTAGE');

        return this.createInternalTransferPricingItem(
            crypto,
            conversionData,
            minData,
            networkFeePercentage,
            transferFeePercentage,
            minXafAmount,
            referenceAmount
        );
    }

    private createInternalTransferPricingItem(
        crypto: CryptoCurrency,
        conversionData: any,
        minData: any,
        networkFeePercentage: number,
        transferFeePercentage: number,
        minXafAmount: number,
        referenceAmount: number
    ): InternalTransferPricingItem {
        const rates = this.calculateRates(conversionData);
        const transferFees = this.calculateTransferFees(rates, transferFeePercentage);
        const networkFees = this.calculateNetworkFees(rates, networkFeePercentage);
        const minimums = this.calculateMinimums(minXafAmount, rates, conversionData);

        return {
            name: crypto.name,
            abv: crypto.symbol,
            usdValue: this.formatCurrency(rates.usd, 'USD'),
            xafValue: this.formatCurrency(rates.xaf, 'XAF'),
            transferFee: `${this.formatCurrency(transferFees.usd, 'USD')} (${transferFeePercentage}%)`,
            transferXafFee: this.formatCurrency(transferFees.xaf, 'XAF'),
            minCryptoTransferValue: `${this.formatCrypto(minimums.minCrypto)} ${crypto.symbol}`,
            minTransferValue: this.formatCurrency(minimums.minUsd, 'USD'),
            minTransferXafValue: this.formatCurrency(minXafAmount, 'XAF'),
            icon: crypto.icon
        };
    }

    private calculateRates(conversionData: any) {
        return {
            usd: conversionData.usd_amount / conversionData.crypto_amount,
            xaf: conversionData.xaf_amount / conversionData.crypto_amount
        };
    }

    private calculateTransferFees(rates: any, transferFeePercentage: number) {
        return {
            usd: (rates.usd * transferFeePercentage) / 100,
            xaf: (rates.xaf * transferFeePercentage) / 100
        };
    }

    private calculateNetworkFees(rates: any, networkFeePercentage: number) {
        // For internal transfers, network fees might be a percentage of the amount
        return {
            usd: (rates.usd * networkFeePercentage) / 100,
            xaf: (rates.xaf * networkFeePercentage) / 100
        };
    }

    private calculateMinimums(minXafAmount: number, rates: any, conversionData: any) {
        const minCrypto = minXafAmount / rates.xaf;
        const minUsd = minXafAmount / (conversionData.xaf_amount / conversionData.usd_amount);
        return {
            minCrypto,
            minUsd,
            minXaf: minXafAmount
        };
    }

    private createDefaultInternalTransferPricingItem(crypto: CryptoCurrency): Observable<InternalTransferPricingItem> {
        return new Observable(observer => {
            observer.next({
                name: crypto.name,
                abv: crypto.symbol,
                usdValue: 'Loading...', 
                xafValue: 'Loading...', 
                transferFee: 'Loading...', 
                transferXafFee: 'Loading...', 
                minCryptoTransferValue: 'Loading...', 
                minTransferValue: 'Loading...', 
                minTransferXafValue: 'Loading...', 
                icon: crypto.icon
            });
            observer.complete();
        });
    }

    private replaceInternalTransferPricingItem(newItem: InternalTransferPricingItem): void {
        const currentItems = [...this.internalTransferPricingItemsSubject.getValue()];
        const index = currentItems.findIndex(item =>
            item.abv === newItem.abv || item.abv.startsWith(newItem.abv.split('-')[0])
        );

        if (index !== -1) {
            currentItems[index] = newItem;
        } else {
            currentItems.push(newItem);
        }

        this.internalTransferPricingItemsSubject.next(currentItems);
    }

    private ensureDefaultItem(crypto: CryptoCurrency): void {
        const currentItems = this.internalTransferPricingItemsSubject.getValue();
        const existingItem = currentItems.find(item =>
            item.abv === crypto.symbol || item.abv.startsWith(crypto.symbol)
        );

        if (!existingItem) {
            this.createDefaultInternalTransferPricingItem(crypto).subscribe(defaultItem => {
                this.replaceInternalTransferPricingItem(defaultItem);
            });
        }
    }

    private checkCompletion(completed: number, total: number, observer: any): void {
        if (completed === total) {
            observer.next();
            observer.complete();
        }
    }

    private setTimeoutSafety(completedCount: number, total: number, observer: any): void {
        setTimeout(() => {
            if (completedCount < total) {
                observer.next();
                observer.complete();
            }
        }, this.TIMEOUT_DURATION);
    }

    private handleUpdateSuccess(): void {
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
    }

    private handleUpdateError(error: any): void {
        this.loadingSubject.next(false);
        this.handleError(error);
    }

    private handleError(error: any): void {
        const errorMessage = error.error?.message || error.message || 'Une erreur est survenue lors du chargement des données de transfert interne';
        this.errorSubject.next(errorMessage);
    }

    private formatCurrency(amount: number, currency: 'USD' | 'XAF'): string {
        const symbol = currency === 'USD' ? '$' : '';
        const suffix = currency === 'XAF' ? ' XAF' : '';

        if (amount < 1 && currency === 'USD') {
            return `${symbol}${amount.toFixed(4)}${suffix}`;
        }

        return `${symbol}${amount.toLocaleString('fr-FR', {
            minimumFractionDigits: currency === 'XAF' ? 0 : 2,
            maximumFractionDigits: currency === 'XAF' ? 0 : 2
        })}${suffix}`;
    }

    private formatCrypto(amount: number): string {
        return amount < 1 ? amount.toFixed(6) : amount.toFixed(2);
    }
}
