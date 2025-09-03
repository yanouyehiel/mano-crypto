import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, switchMap, startWith, map, catchError, of } from 'rxjs';
import { CryptoTransactionService } from '../crypto-transaction.service';
import { ConfigurationService } from '../configuration.service';
import { CryptoCurrency } from 'src/app/models/pricings-elements';
import { ResponseParent, ResponseCryptoFee } from 'src/app/models/Transaction';

export interface TransferPricingItem {
    name: string;
    abv: string;
    usdValue: string;
    xafValue: string;
    transferFee: string;
    transferXafFee: string;
    minCryptoTransferValue: string;
    minTransferValue: string;
    minTransferXafValue: string;
    networkFee: string;
    networkXafFee: string;
    icon: string;
}

@Injectable({
    providedIn: 'root'
})
export class CryptoTransferPricingService {
    private transferPricingItemsSubject = new BehaviorSubject<TransferPricingItem[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private errorSubject = new BehaviorSubject<string | null>(null);

    public transferPricingItems$ = this.transferPricingItemsSubject.asObservable();
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
        this.updateTransferPricingData().subscribe({
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
                return this.updateTransferPricingData();
            })
        ).subscribe({
            next: () => this.handleUpdateSuccess(),
            error: (error) => this.handleUpdateError(error)
        });
    }

    private updateTransferPricingData(): Observable<void> {
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
        const currentItems = this.transferPricingItemsSubject.getValue();
        if (currentItems.length === 0) {
            this.transferPricingItemsSubject.next(this.getDefaultTransferPricingItems());
        }
    }

    private getDefaultTransferPricingItems(): TransferPricingItem[] {
        return this.supportedCryptos.map(crypto => ({
            name: crypto.name,
            abv: crypto.symbol,
            usdValue: 'Loading...', // Valeur USD du crypto
            xafValue: 'Loading...', // Valeur XAF du crypto
            transferFee: 'Loading...', // Frais de transfert en USD
            transferXafFee: 'Loading...', // Frais de transfert en XAF
            minCryptoTransferValue: 'Loading...', // Minimum transférable en crypto
            minTransferValue: 'Loading...', // Minimum transférable en USD
            minTransferXafValue: 'Loading...', // Minimum transférable en XAF
            networkFee: 'Loading...', // Frais réseau en USD
            networkXafFee: 'Loading...', // Frais réseau en XAF
            icon: crypto.icon
        }));
    }

    private processCryptoItems(): Observable<void> {
        let completedCount = 0;
        const totalCryptos = this.supportedCryptos.length;

        return new Observable<void>(observer => {
            this.supportedCryptos.forEach(crypto => {
                this.buildTransferPricingItem(crypto).subscribe({
                    next: (pricingItem) => {
                        this.replaceTransferPricingItem(pricingItem);
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

    private buildTransferPricingItem(crypto: CryptoCurrency): Observable<TransferPricingItem> {
        const referenceAmount = this.getReferenceAmount(crypto.symbol);

        const conversionObs = this.cryptoService.convertToFiat({
            amount: referenceAmount,
            crypto_currency: crypto.symbol
        });

        const networkFeesObs = this.cryptoService.transactionFees({
            crypto_currency: crypto.symbol,
            transaction_type: 'WITHDRAW_CRYPTO'
        });

        const minXafAmount = this.configurationService.getConfigByKey('MIN_XAF_AMOUNT');
        const minCryptoObs = this.cryptoService.convertToCrypto({
            amount: minXafAmount ?? 500
        });

        return conversionObs.pipe(
            switchMap(conversionResponse => {
                return networkFeesObs.pipe(
                    switchMap((feesResponse: ResponseParent) => {
                        if (!feesResponse.data) {
                            throw new Error('Network fees data is missing');
                        }
                        return minCryptoObs.pipe(
                            map(minResponse => this.createTransferPricingItemFromResponses(
                                crypto,
                                conversionResponse.data,
                                feesResponse.data,
                                minResponse.data,
                                referenceAmount,
                                minXafAmount
                            ))
                        );
                    }),
                    catchError(() => {
                        return minCryptoObs.pipe(
                            map(minResponse => this.createTransferPricingItemFromResponses(
                                crypto,
                                conversionResponse.data,
                                null, // Network fees might fail, so pass null
                                minResponse.data,
                                referenceAmount,
                                minXafAmount
                            ))
                        );
                    })
                );
            }),
            catchError(() => {
                const currentItems = this.transferPricingItemsSubject.getValue();
                const existingItem = currentItems.find(item => item.abv === crypto.symbol);
                if (existingItem) {
                    return of(existingItem);
                } else {
                    return this.createDefaultTransferPricingItem(crypto);
                }
            })
        );
    }

    private getReferenceAmount(symbol: string): number {
        switch (symbol) {
            case 'USDT': return 1;
            case 'BTC': return 0.001;
            case 'ETH': return 0.01;
            default: return 0.01;
        }
    }

    private createTransferPricingItemFromResponses(
        crypto: CryptoCurrency,
        conversionData: any,
        feesData: any,
        minData: any,
        referenceAmount: number,
        minXafAmount: number
    ): TransferPricingItem {
        let transferFeePercentage = 0;
        switch (crypto.symbol) {
            case 'ETH':
                transferFeePercentage = this.configurationService.getConfigByKey('ETH_OTHER_WALLET_TRANSFER_FEES');
                break;
            case 'BTC':
                transferFeePercentage = this.configurationService.getConfigByKey('BTC_OTHER_WALLET_TRANSFER_FEES');
                break;
            case 'USDT':
                transferFeePercentage = this.configurationService.getConfigByKey('USDT_OTHER_WALLET_TRANSFER_FEES');
                break;
            default:
                transferFeePercentage = 0; // Default or error case
        }

        return this.createTransferPricingItem(
            crypto,
            conversionData,
            feesData,
            minData,
            transferFeePercentage,
            minXafAmount,
            referenceAmount
        );
    }

    private createTransferPricingItem(
        crypto: CryptoCurrency,
        conversionData: any,
        feesData: any,
        minData: any,
        transferFeePercentage: number,
        minXafAmount: number,
        referenceAmount: number
    ): TransferPricingItem {
        const rates = this.calculateRates(conversionData);
        const fees = this.calculateTransferFees(rates, transferFeePercentage);
        const minimums = this.calculateMinimums(minXafAmount, rates, conversionData);
        const networkFees = this.calculateNetworkFees(feesData, rates);

        return {
            name: crypto.name,
            abv: crypto.symbol,
            usdValue: this.formatCurrency(rates.usd, 'USD'),
            xafValue: this.formatCurrency(rates.xaf, 'XAF'),
            transferFee: `${this.formatCurrency(fees.usd, 'USD')} (${transferFeePercentage}%)`,
            transferXafFee: this.formatCurrency(fees.xaf, 'XAF'),
            minCryptoTransferValue: `${this.formatCrypto(minimums.minCrypto)} ${crypto.symbol}`,
            minTransferValue: this.formatCurrency(minimums.minUsd, 'USD'),
            minTransferXafValue: this.formatCurrency(minXafAmount, 'XAF'),
            networkFee: this.formatCurrency(networkFees.usd, 'USD'),
            networkXafFee: this.formatCurrency(networkFees.xaf, 'XAF'),
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

    private calculateNetworkFees(feesData: any, rates: any) {
        return {
            usd: feesData?.usd_network_fees || 0,
            xaf: (feesData?.usd_network_fees || 0) * (rates.xaf / rates.usd)
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

    private createDefaultTransferPricingItem(crypto: CryptoCurrency): Observable<TransferPricingItem> {
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
                networkFee: 'Loading...', 
                networkXafFee: 'Loading...', 
                icon: crypto.icon
            });
            observer.complete();
        });
    }

    private replaceTransferPricingItem(newItem: TransferPricingItem): void {
        const currentItems = [...this.transferPricingItemsSubject.getValue()];
        const index = currentItems.findIndex(item =>
            item.abv === newItem.abv || item.abv.startsWith(newItem.abv.split('-')[0])
        );

        if (index !== -1) {
            currentItems[index] = newItem;
        } else {
            currentItems.push(newItem);
        }

        this.transferPricingItemsSubject.next(currentItems);
    }

    private ensureDefaultItem(crypto: CryptoCurrency): void {
        const currentItems = this.transferPricingItemsSubject.getValue();
        const existingItem = currentItems.find(item =>
            item.abv === crypto.symbol || item.abv.startsWith(crypto.symbol)
        );

        if (!existingItem) {
            this.createDefaultTransferPricingItem(crypto).subscribe(defaultItem => {
                this.replaceTransferPricingItem(defaultItem);
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
        const errorMessage = error.error?.message || error.message || 'Une erreur est survenue lors du chargement des données de transfert';
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
