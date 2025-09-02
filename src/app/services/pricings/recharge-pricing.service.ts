import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, switchMap, startWith, map, catchError, of } from 'rxjs';
import { CryptoTransactionService } from '../crypto-transaction.service';
import { ConfigurationService } from '../configuration.service';

export interface RechargePricingItem {
    name: string;
    abv: string;
    usdValue: string;
    xafValue: string;
    rechargeFee: string;
    rechargeXafFee: string;
    minCryptoRechargeValue: string;
    minRechargeValue: string;
    minRechargeXafValue: string;
    networkFee: string;
    networkXafFee: string;
    icon: string;
}

@Injectable({
    providedIn: 'root'
})
export class CryptoRechargePricingService {
    private rechargePricingItemsSubject = new BehaviorSubject<RechargePricingItem[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private errorSubject = new BehaviorSubject<string | null>(null);
    
    public rechargePricingItems$ = this.rechargePricingItemsSubject.asObservable();
    public loading$ = this.loadingSubject.asObservable();
    public error$ = this.errorSubject.asObservable();
    
    private readonly REFRESH_INTERVAL = 30000; // 30 seconds
    private readonly TIMEOUT_DURATION = 10000; // 10 seconds
    private readonly supportedCryptos = [
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
        this.updateRechargePricingData().subscribe({
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
                return this.updateRechargePricingData();
            })
        ).subscribe({
            next: () => this.handleUpdateSuccess(),
            error: (error) => this.handleUpdateError(error)
        });
    }

    private updateRechargePricingData(): Observable<void> {
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
        const currentItems = this.rechargePricingItemsSubject.getValue();
        if (currentItems.length === 0) {
            this.rechargePricingItemsSubject.next(this.getDefaultRechargePricingItems());
        }
    }

    private getDefaultRechargePricingItems(): RechargePricingItem[] {
        return this.supportedCryptos.map(crypto => ({
            name: crypto.name,
            abv: crypto.symbol,
            usdValue: 'Loading...',
            xafValue: 'Loading...',
            rechargeFee: 'Loading...',
            rechargeXafFee: 'Loading...',
            minCryptoRechargeValue: 'Loading...',
            minRechargeValue: 'Loading...',
            minRechargeXafValue: 'Loading...',
            networkFee: 'Loading...', // Assuming network fee is also applicable for recharge
            networkXafFee: 'Loading...', // Assuming network fee is also applicable for recharge
            icon: crypto.icon
        }));
    }

    private processCryptoItems(): Observable<void> {
        let completedCount = 0;
        const totalCryptos = this.supportedCryptos.length;

        return new Observable<void>(observer => {
            this.supportedCryptos.forEach(crypto => {
                this.buildRechargePricingItem(crypto).subscribe({
                    next: (pricingItem) => {
                        this.replaceRechargePricingItem(pricingItem);
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

    private buildRechargePricingItem(crypto: any): Observable<RechargePricingItem> {
        const referenceAmount = this.getReferenceAmount(crypto.symbol);

        const conversionObs = this.cryptoService.convertToFiat({
            amount: referenceAmount,
            crypto_currency: crypto.symbol
        });

        const minXafAmount = this.configurationService.getConfigByKey('MIN_XAF_AMOUNT');
        const minCryptoObs = this.cryptoService.convertToCrypto({
            amount: minXafAmount ?? 500
        });

        return conversionObs.pipe(
            switchMap(conversionResponse => {
                return minCryptoObs.pipe(
                    map(minResponse => this.createRechargePricingItemFromResponses(
                        crypto,
                        conversionResponse.data,
                        null, // No transaction fees for recharge, assuming direct conversion
                        minResponse.data,
                        referenceAmount,
                        minXafAmount
                    ))
                );
            }),
            catchError(() => {
                const currentItems = this.rechargePricingItemsSubject.getValue();
                const existingItem = currentItems.find(item => item.abv === crypto.symbol);
                if (existingItem) {
                    return of(existingItem);
                } else {
                    return this.createDefaultRechargePricingItem(crypto);
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

    private createRechargePricingItemFromResponses(
        crypto: any,
        conversionData: any,
        feesData: any, // Can be null for recharge
        minData: any,
        referenceAmount: number,
        minXafAmount: number
    ): RechargePricingItem {
        const rechargeFeePercentage = this.configurationService.getConfigByKey('CRYPTO_RECHARGE_SERVICE_FEES_PERCENTAGE');
        
        return this.createRechargePricingItem(
            crypto,
            conversionData,
            feesData,
            minData,
            rechargeFeePercentage,
            minXafAmount,
            referenceAmount
        );
    }

    private createRechargePricingItem(
        crypto: any,
        conversionData: any,
        feesData: any,
        minData: any,
        rechargeFeePercentage: number,
        minXafAmount: number,
        referenceAmount: number
    ): RechargePricingItem {
        const rates = this.calculateRates(conversionData);
        const fees = this.calculateRechargeFees(rates, rechargeFeePercentage);
        const minimums = this.calculateMinimums(crypto.symbol, minData, minXafAmount, conversionData);
        const networkFees = this.calculateNetworkFees(feesData, rates); // feesData might be null

        return {
            name: crypto.name,
            abv: crypto.symbol,
            usdValue: this.formatCurrency(rates.usd, 'USD'),
            xafValue: this.formatCurrency(rates.xaf, 'XAF'),
            rechargeFee: `${this.formatCurrency(fees.usd, 'USD')} (${rechargeFeePercentage}%)`,
            rechargeXafFee: this.formatCurrency(fees.xaf, 'XAF'),
            minCryptoRechargeValue: `${this.formatCrypto(minimums.minCrypto)} ${crypto.symbol}`,
            minRechargeValue: this.formatCurrency(minimums.minUsd, 'USD'),
            minRechargeXafValue: this.formatCurrency(minXafAmount, 'XAF'),
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

    private calculateRechargeFees(rates: any, rechargeFeePercentage: number) {
        return {
            usd: (rates.usd * rechargeFeePercentage) / 100,
            xaf: (rates.xaf * rechargeFeePercentage) / 100
        };
    }

    private calculateNetworkFees(feesData: any, rates: any) {
        // For recharge, network fees might not be directly from transactionFees API
        // If feesData is null, assume 0 for now or derive from another config if available
        return {
            usd: feesData?.usd_network_fees || 0,
            xaf: (feesData?.usd_network_fees || 0) * (rates.xaf / rates.usd)
        };
    }

    private calculateMinimums(cryptoSymbol: string, minData: any, minXafAmount: number, conversionData: any) {
        const minCrypto = minXafAmount / (conversionData.xaf_amount / conversionData.crypto_amount);
        const minUsd = minXafAmount / (conversionData.xaf_amount / conversionData.usd_amount);

        return {
            minCrypto,
            minUsd,
            minXaf: minXafAmount
        };
    }

    private createDefaultRechargePricingItem(crypto: any): Observable<RechargePricingItem> {
        return new Observable(observer => {
            observer.next({
                name: crypto.name,
                abv: crypto.symbol,
                usdValue: 'Loading...', 
                xafValue: 'Loading...', 
                rechargeFee: 'Loading...', 
                rechargeXafFee: 'Loading...', 
                minCryptoRechargeValue: 'Loading...', 
                minRechargeValue: 'Loading...', 
                minRechargeXafValue: 'Loading...', 
                networkFee: 'Loading...', 
                networkXafFee: 'Loading...', 
                icon: crypto.icon
            });
            observer.complete();
        });
    }

    private replaceRechargePricingItem(newItem: RechargePricingItem): void {
        const currentItems = [...this.rechargePricingItemsSubject.getValue()];
        const index = currentItems.findIndex(item =>
            item.abv === newItem.abv || item.abv.startsWith(newItem.abv.split('-')[0])
        );

        if (index !== -1) {
            currentItems[index] = newItem;
        } else {
            currentItems.push(newItem);
        }

        this.rechargePricingItemsSubject.next(currentItems);
    }

    private ensureDefaultItem(crypto: any): void {
        const currentItems = this.rechargePricingItemsSubject.getValue();
        const existingItem = currentItems.find(item =>
            item.abv === crypto.symbol || item.abv.startsWith(crypto.symbol)
        );

        if (!existingItem) {
            this.createDefaultRechargePricingItem(crypto).subscribe(defaultItem => {
                this.replaceRechargePricingItem(defaultItem);
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
        const errorMessage = error.error?.message || error.message || 'Une erreur est survenue lors du chargement des données de recharge';
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
