import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, switchMap, startWith, map, catchError, of } from 'rxjs';
import { CryptoTransactionService } from '../crypto-transaction.service';
import { ConfigurationService } from '../configuration.service';

export interface SellPricingItem {
    name: string;
    abv: string;
    usdValue: string;
    xafValue: string;
    sellFee: string;
    sellXafFee: string;
    minCryptoSellingValue: string;
    minSellingValue: string;
    minSellingXafValue: string;
    networkFee: string;
    networkXafFee: string;
    icon: string;
}

@Injectable({
    providedIn: 'root'
})
export class CryptoSellPricingService {
    private sellPricingItemsSubject = new BehaviorSubject<SellPricingItem[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private errorSubject = new BehaviorSubject<string | null>(null);
    
    public sellPricingItems$ = this.sellPricingItemsSubject.asObservable();
    public loading$ = this.loadingSubject.asObservable();
    public error$ = this.errorSubject.asObservable();
    
    private readonly REFRESH_INTERVAL = 300000; // 5 minutes
    private readonly TIMEOUT_DURATION = 10000; // 10 secondes
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
        private cryptoService: CryptoTransactionService, // CryptoTransactionService
        private configurationService: ConfigurationService // ConfigurationService
    ) {
        this.initializeAutoRefresh();
    }

    public refreshPricing(): void {
        this.loadingSubject.next(true);
        this.updateSellPricingData().subscribe({
            next: () => this.handleUpdateSuccess(),
            error: (error) => this.handleUpdateError(error)
        });
    }

    private initializeAutoRefresh(): void {
        interval(this.REFRESH_INTERVAL).pipe(
            startWith(0),
            switchMap(() => {
                this.loadingSubject.next(true);
                return this.updateSellPricingData();
            })
        ).subscribe({
            next: () => this.handleUpdateSuccess(),
            error: (error) => this.handleUpdateError(error)
        });
    }

    private updateSellPricingData(): Observable<void> {
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
        const currentItems = this.sellPricingItemsSubject.getValue();
        if (currentItems.length === 0) {
            this.sellPricingItemsSubject.next(this.getDefaultSellPricingItems());
        }
    }

    private getDefaultSellPricingItems(): SellPricingItem[] {
        return this.supportedCryptos.map(crypto => ({
            name: crypto.name,
            abv: crypto.symbol === 'USDT' ? 'USDT-TRC20' : crypto.symbol,
            usdValue: 'Loading...',
            xafValue: 'Loading...',
            sellFee: 'Loading...',
            sellXafFee: 'Loading...',
            minCryptoSellingValue: 'Loading...',
            minSellingValue: 'Loading...',
            minSellingXafValue: 'Loading...',
            networkFee: 'Loading...',
            networkXafFee: 'Loading...',
            icon: crypto.icon
        }));
    }

    private processCryptoItems(): Observable<void> {
        let completedCount = 0;
        const totalCryptos = this.supportedCryptos.length;

        return new Observable<void>(observer => {
            this.supportedCryptos.forEach(crypto => {
                this.buildSellPricingItem(crypto).subscribe({
                    next: (pricingItem) => {
                        this.replaceSellPricingItem(pricingItem);
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

    private buildSellPricingItem(crypto: any): Observable<SellPricingItem> {
        const referenceAmount = this.getReferenceAmount(crypto.symbol);

        // Récupérer les frais de transaction pour la vente
        const transactionFeesObs = this.cryptoService.transactionFees({
            amount: 1,
            currency: crypto.symbol,
            type: 'SELL_CRYPTO'
        });

        // Convertir vers fiat pour avoir les taux
        const conversionObs = this.cryptoService.convertToFiat({
            amount: referenceAmount,
            crypto_currency: crypto.symbol.toLowerCase()
        });

        // Récupérer les minimums depuis la config
        const minXafAmount = this.configurationService.getConfigByKey('MIN_XAF_AMOUNT');
        const minCryptoObs = this.cryptoService.convertToCrypto({
            amount: minXafAmount
        });

        // Combiner toutes les données
        return conversionObs.pipe(
            switchMap(conversionResponse => {
                return transactionFeesObs.pipe(
                    switchMap(feesResponse => {
                        return minCryptoObs.pipe(
                            map(minResponse => this.createSellPricingItemFromResponses(
                                crypto, 
                                conversionResponse.data, 
                                feesResponse.data,
                                minResponse.data,
                                referenceAmount, 
                                minXafAmount
                            ))
                        );
                    })
                );
            }),
            catchError(() => this.createDefaultSellPricingItem(crypto))
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

    private createSellPricingItemFromResponses(
        crypto: any, 
        conversionData: any, 
        feesData: any,
        minData: any,
        referenceAmount: number, 
        minXafAmount: number
    ): SellPricingItem {
        const sellFeePercentage = this.configurationService.getConfigByKey('CRYPTO_SELL_SERVICE_FEES_PERCENTAGE');
        
        return this.createSellPricingItem(
            crypto, 
            conversionData, 
            feesData,
            minData,
            sellFeePercentage, 
            minXafAmount, 
            referenceAmount
        );
    }

    private createSellPricingItem(
        crypto: any,
        conversionData: any,
        feesData: any,
        minData: any,
        sellFeePercentage: number,
        minXafAmount: number,
        referenceAmount: number
    ): SellPricingItem {
        const rates = this.calculateRates(conversionData, referenceAmount);
        const fees = this.calculateSellFees(rates, sellFeePercentage);
        const minimums = this.calculateMinimums(crypto.symbol, minData, minXafAmount);
        const networkFees = this.calculateNetworkFees(feesData, rates);

        return {
            name: crypto.name,
            abv: crypto.symbol === 'USDT' ? 'USDT-TRC20' : crypto.symbol,
            usdValue: this.formatCurrency(rates.usd, 'USD'),
            xafValue: this.formatCurrency(rates.xaf, 'XAF'),
            sellFee: `${this.formatCurrency(fees.usd, 'USD')} (${sellFeePercentage}%)`,
            sellXafFee: this.formatCurrency(fees.xaf, 'XAF'),
            minCryptoSellingValue: `${this.formatCrypto(minimums.minCrypto)} ${crypto.symbol}`,
            minSellingValue: this.formatCurrency(minimums.minUsd, 'USD'),
            minSellingXafValue: this.formatCurrency(minXafAmount, 'XAF'),
            networkFee: this.formatCurrency(networkFees.usd, 'USD'),
            networkXafFee: this.formatCurrency(networkFees.xaf, 'XAF'),
            icon: crypto.icon
        };
    }

    private calculateRates(conversionData: any, referenceAmount: number) {
        return {
            usd: conversionData.usd_amount / referenceAmount,
            xaf: conversionData.xaf_amount / referenceAmount
        };
    }

    private calculateSellFees(rates: any, sellFeePercentage: number) {
        return {
            usd: (rates.usd * sellFeePercentage) / 100,
            xaf: (rates.xaf * sellFeePercentage) / 100
        };
    }

    private calculateNetworkFees(feesData: any, rates: any) {
        return {
            usd: feesData.usd_network_fees || 0,
            xaf: (feesData.usd_network_fees || 0) * (rates.xaf / rates.usd)
        };
    }

    private calculateMinimums(cryptoSymbol: string, minData: any, minXafAmount: number) {
        const cryptoKey = `${cryptoSymbol.toLowerCase()}_amount`;
        const minCrypto = minData[cryptoKey] || 0;
        const minUsd = minData.usd_amount || 0;

        return {
            minCrypto,
            minUsd,
            minXaf: minXafAmount
        };
    }

    private createDefaultSellPricingItem(crypto: any): Observable<SellPricingItem> {
        return new Observable(observer => {
            observer.next({
                name: crypto.name,
                abv: crypto.symbol === 'USDT' ? 'USDT-TRC20' : crypto.symbol,
                usdValue: 'Loading...',
                xafValue: 'Loading...',
                sellFee: 'Loading...',
                sellXafFee: 'Loading...',
                minCryptoSellingValue: 'Loading...',
                minSellingValue: 'Loading...',
                minSellingXafValue: 'Loading...',
                networkFee: 'Loading...',
                networkXafFee: 'Loading...',
                icon: crypto.icon
            });
            observer.complete();
        });
    }

    private replaceSellPricingItem(newItem: SellPricingItem): void {
        const currentItems = [...this.sellPricingItemsSubject.getValue()];
        const index = currentItems.findIndex(item =>
            item.abv === newItem.abv || item.abv.startsWith(newItem.abv.split('-')[0])
        );

        if (index !== -1) {
            currentItems[index] = newItem;
        } else {
            currentItems.push(newItem);
        }

        this.sellPricingItemsSubject.next(currentItems);
    }

    private ensureDefaultItem(crypto: any): void {
        const currentItems = this.sellPricingItemsSubject.getValue();
        const existingIndex = currentItems.findIndex(item =>
            item.abv === crypto.symbol || item.abv.startsWith(crypto.symbol)
        );

        if (existingIndex === -1) {
            this.createDefaultSellPricingItem(crypto).subscribe(defaultItem => {
                this.replaceSellPricingItem(defaultItem);
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
        this.sellPricingItemsSubject.next(this.getDefaultSellPricingItems());
    }

    private handleError(error: any): void {
        const errorMessage = error.error?.message || error.message || 'Une erreur est survenue lors du chargement des données de vente';
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
