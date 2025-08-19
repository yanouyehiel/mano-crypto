// services/pricing.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, interval, of } from 'rxjs';
import { switchMap, map, catchError, startWith } from 'rxjs/operators';
import { CryptoTransactionService } from '../crypto-transaction.service';
import { Configuration, CryptoCurrency, PricingItem } from '../../models/pricings-elements';
import { ConfigurationService } from '../configuration.service';

@Injectable({
    providedIn: 'root'
})
export class PricingService {

    // Subjects privés
    private pricingItemsSubject = new BehaviorSubject<PricingItem[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private errorSubject = new BehaviorSubject<string | null>(null);

    // Observables publics
    public pricingItems$ = this.pricingItemsSubject.asObservable();
    public loading$ = this.loadingSubject.asObservable();
    public error$ = this.errorSubject.asObservable();
    // Configuration des cryptomonnaies supportées
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

    // Configuration
    private readonly REFRESH_INTERVAL = 60000; // 15 secondes
    private readonly TIMEOUT_DURATION = 5000; // 10 secondes

    constructor(
        private cryptoService: CryptoTransactionService,
        private configurationService: ConfigurationService
    ) {
        this.initializeAutoRefresh();
    }

    // Méthode publique pour forcer la mise à jour
    public refreshPricing(): void {
        this.loadingSubject.next(true);
        this.updatePricingData().subscribe({
            next: () => this.handleUpdateSuccess(),
            error: (error) => this.handleUpdateError(error)
        });
    }

    // Initialisation du rafraîchissement automatique
    private initializeAutoRefresh(): void {
        interval(this.REFRESH_INTERVAL).pipe(
            startWith(0),
            switchMap(() => {
                this.loadingSubject.next(true);
                return this.updatePricingData();
            })
        ).subscribe({
            next: () => this.handleUpdateSuccess(),
            error: (error) => this.handleUpdateError(error)
        });
    }

    // Mise à jour des données de pricing
    private updatePricingData(): Observable<void> {
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

    // Initialiser avec des données par défaut si nécessaire
    private initializeItemsIfEmpty(): void {
        const currentItems = this.pricingItemsSubject.getValue();
        if (currentItems.length === 0) {
            this.pricingItemsSubject.next(this.getDefaultPricingItems());
        }
    }

    // Traitement des cryptomonnaies
    private processCryptoItems(): Observable<void> {
        let completedCount = 0;
        const totalCryptos = this.supportedCryptos.length;

        return new Observable<void>(observer => {
            this.supportedCryptos.forEach(crypto => {
                this.buildPricingItem(crypto).subscribe({
                    next: (pricingItem) => {
                        this.replacePricingItem(pricingItem);
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

    // Vérification de la completion
    private checkCompletion(completed: number, total: number, observer: any): void {
        if (completed === total) {
            observer.next();
            observer.complete();
        }
    }

    // Timeout de sécurité
    private setTimeoutSafety(completedCount: number, total: number, observer: any): void {
        setTimeout(() => {
            if (completedCount < total) {
                observer.next();
                observer.complete();
            }
        }, this.TIMEOUT_DURATION);
    }

    // Construction d'un item de pricing
    private buildPricingItem(crypto: CryptoCurrency): Observable<PricingItem> {
        const referenceAmount = this.getReferenceAmount(crypto.symbol);

        return this.cryptoService.convertToFiat({
            amount: referenceAmount,
            crypto_currency: crypto.symbol
        }).pipe(
            map(response => this.createPricingItemFromResponse(crypto, response.data, referenceAmount)),
            catchError(() => this.createDefaultPricingItem(crypto))
        );
    }

    // Obtenir le montant de référence selon la crypto
    private getReferenceAmount(symbol: string): number {
        switch (symbol) {
            case 'USDT': return 1;
            case 'BTC': return 0.001;
            default: return 0.01;
        }
    }

    // Création d'un item de pricing depuis la réponse API
    private createPricingItemFromResponse(crypto: CryptoCurrency, data: any, referenceAmount: number): PricingItem {
        const buyFeePercentage = this.configurationService.getConfigByKey('CRYPTO_BUY_SERVICE_FEES_PERCENTAGE');
        const minXafAmount = this.configurationService.getConfigByKey('MIN_XAF_AMOUNT');

        return this.createPricingItem(crypto, data, buyFeePercentage, minXafAmount, referenceAmount);
    }

    // Création d'un item de pricing complet
    private createPricingItem(
        crypto: CryptoCurrency,
        conversionData: any,
        buyFeePercentage: number,
        minXafAmount: number,
        referenceAmount: number
    ): PricingItem {
        const rates = this.calculateRates(conversionData);
        const fees = this.calculateFees(rates, buyFeePercentage);
        const minimums = this.calculateMinimums(rates, minXafAmount, conversionData);

        return {
            name: crypto.name,
            abv: crypto.symbol,
            usdValue: this.formatCurrency(rates.usd, 'USD'),
            xafValue: this.formatCurrency(rates.xaf, 'XAF'),
            manenFee: `${this.formatCurrency(fees.usd, 'USD')} (${buyFeePercentage}%)`,
            manenXafFee: this.formatCurrency(fees.xaf, 'XAF'),
            minCryptoByingValue: `${this.formatCrypto(minimums.minCryptoFromXaf)} ${crypto.symbol}`,
            minByingValue: this.formatCurrency(minimums.minUsdFromXaf, 'USD'),
            minByingXafValue: this.formatCurrency(minXafAmount, 'XAF'),
            minCryptoTransferableValue: `${this.formatCrypto(minimums.minTransferCrypto)} ${crypto.symbol}`,
            minTransferableValue: this.formatCurrency(minimums.minTransferUsd, 'USD'),
            minTransferableXafValue: this.formatCurrency(minimums.minTransferXaf, 'XAF'),
            icon: crypto.icon
        };
    }

    // Calcul des taux de change
    private calculateRates(conversionData: any) {
        return {
            usd: conversionData.usd_amount / conversionData.crypto_amount,
            xaf: conversionData.xaf_amount / conversionData.crypto_amount
        };
    }

    // Calcul des frais
    private calculateFees(rates: any, buyFeePercentage: number) {
        return {
            usd: (rates.usd * buyFeePercentage) / 100,
            xaf: (rates.xaf * buyFeePercentage) / 100
        };
    }

    // Calcul des montants minimums
    private calculateMinimums(rates: any, minXafAmount: number, conversionData: any) {
        const minCryptoFromXaf = minXafAmount / rates.xaf;
        const minUsdFromXaf = minXafAmount / (conversionData.xaf_amount / conversionData.usd_amount);

        return {
            minCryptoFromXaf,
            minUsdFromXaf,
            minTransferCrypto: minCryptoFromXaf * 5,
            minTransferUsd: minUsdFromXaf * 5,
            minTransferXaf: minXafAmount * 5
        };
    }

    // Création d'un item par défaut
    private createDefaultPricingItem(crypto: CryptoCurrency): Observable<PricingItem> {
        return new Observable(observer => {
            observer.next({
                name: crypto.name,
                abv: crypto.symbol,
                usdValue: 'Loading...',
                xafValue: 'Loading...',
                manenFee: 'Loading...',
                manenXafFee: 'Loading...',
                minCryptoByingValue: 'Loading...',
                minByingValue: 'Loading...',
                minByingXafValue: 'Loading...',
                minCryptoTransferableValue: 'Loading...',
                minTransferableValue: 'Loading...',
                minTransferableXafValue: 'Loading...',
                icon: crypto.icon
            });
            observer.complete();
        });
    }

    // Remplacement d'un item spécifique
    private replacePricingItem(newItem: PricingItem): void {
        const currentItems = [...this.pricingItemsSubject.getValue()];
        const index = currentItems.findIndex(item =>
            item.abv === newItem.abv || item.abv.startsWith(newItem.abv.split('-')[0])
        );

        if (index !== -1) {
            currentItems[index] = newItem;
        } else {
            currentItems.push(newItem);
        }

        this.pricingItemsSubject.next(currentItems);
    }

    // S'assurer qu'un item par défaut existe
    private ensureDefaultItem(crypto: CryptoCurrency): void {
        const currentItems = this.pricingItemsSubject.getValue();
        const existingIndex = currentItems.findIndex(item =>
            item.abv === crypto.symbol || item.abv.startsWith(crypto.symbol)
        );

        if (existingIndex === -1) {
            this.createDefaultPricingItem(crypto).subscribe(defaultItem => {
                this.replacePricingItem(defaultItem);
            });
        }
    }

    // Gestion du succès de mise à jour
    private handleUpdateSuccess(): void {
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
    }

    // Gestion des erreurs de mise à jour
    private handleUpdateError(error: any): void {
        this.loadingSubject.next(false);
        this.handleError(error);
        this.pricingItemsSubject.next([]);
    }

    // Gestion générale des erreurs
    private handleError(error: any): void {
        const errorMessage = error.error?.message || error.message || 'Une erreur est survenue';
        this.errorSubject.next(errorMessage);
    }

    // Formatage des devises
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

    // Formatage des cryptomonnaies
    private formatCrypto(amount: number): string {
        return amount < 1 ? amount.toFixed(6) : amount.toFixed(2);
    }

    // Données par défaut
    private getDefaultPricingItems(): PricingItem[] {
        return [
            {
                name: 'Tether',
                abv: 'USDT',
                usdValue: '$0.99',
                xafValue: '604 XAF',
                manenFee: '$0,03 (3%)',
                manenXafFee: '19 XAF',
                minCryptoByingValue: '1 USDT',
                minByingValue: '$5.03',
                minByingXafValue: '3 000 XAF',
                minCryptoTransferableValue: '0.25 USDT',
                minTransferableValue: '$16.83',
                minTransferableXafValue: '10 000 XAF',
                icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/825.png'
            },
            {
                name: 'Bitcoin',
                abv: 'BTC',
                usdValue: '$83,373.12',
                xafValue: '50 023 996 XAF',
                manenFee: '$4,168.66 (5%)',
                manenXafFee: '2 501 199 XAF',
                minCryptoByingValue: '0.0026 BTC',
                minByingValue: '$25.33',
                minByingXafValue: '10 000 XAF',
                minCryptoTransferableValue: '0.0013 BTC',
                minTransferableValue: '$83.33',
                minTransferableXafValue: '50 000 XAF',
                icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1.png'
            },
            {
                name: 'Ethereum',
                abv: 'ETH',
                usdValue: '$3,212.41',
                xafValue: '1 927 446 XAF',
                manenFee: '$128.50 (4%)',
                manenXafFee: '77 098 XAF',
                minCryptoByingValue: '0.0026 ETH',
                minByingValue: '$25.33',
                minByingXafValue: '10 000 XAF',
                minCryptoTransferableValue: '0.0013 ETH',
                minTransferableValue: '$83.33',
                minTransferableXafValue: '50 000 XAF',
                icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1027.png'
            }
        ];
    }
}
