// services/pricing.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, interval, of, forkJoin } from 'rxjs';
import { switchMap, map, catchError, startWith } from 'rxjs/operators';
import { CryptoTransactionService } from './crypto-transaction.service';
import { Configuration, CryptoCurrency, PricingItem } from '../models/pricings-elements';
import { ConfigurationService } from './configuration.service';

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
    private readonly REFRESH_INTERVAL = 15000;
    private readonly TIMEOUT_DURATION = 10000;
    private readonly DEBUG = true;

    constructor(
        private cryptoService: CryptoTransactionService,
        private configurationService: ConfigurationService
    ) {
        this.initializeAutoRefresh();
    }

    private log(message: string, data?: any): void {
        if (this.DEBUG) {
            console.log(`🏷️ [PricingService] ${message}`, data || '');
        }
    }

    // =========================== MÉTHODES PUBLIQUES ===========================

    public refreshPricing(): void {
        this.loadingSubject.next(true);
        this.updatePricingData().subscribe({
            next: () => this.handleUpdateSuccess(),
            error: (error) => this.handleUpdateError(error)
        });
    }

    public getPricingItemBySymbol(symbol: string): Observable<PricingItem | undefined> {
        return this.pricingItems$.pipe(
            map(items => items.find(item => item.abv === symbol || item.abv.startsWith(symbol)))
        );
    }

    // =========================== INITIALISATION ET REFRESH ===========================

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

    private updatePricingData(): Observable<void> {
        return this.configurationService.configuration$.pipe(
            switchMap(() => {
                this.initializeItemsIfEmpty();
                return this.processCryptoItems();
            }),
            catchError(error => {
                this.log('❌ Erreur lors de la mise à jour:', error);
                this.handleError(error);
                return of(void 0);
            })
        );
    }

    private initializeItemsIfEmpty(): void {
        const currentItems = this.pricingItemsSubject.getValue();
        if (currentItems.length === 0) {
            this.pricingItemsSubject.next(this.getDefaultPricingItems());
        }
    }

    private processCryptoItems(): Observable<void> {
        let completedCount = 0;
        const totalCryptos = this.supportedCryptos.length;

        return new Observable<void>(observer => {
            this.supportedCryptos.forEach(crypto => {
                this.buildPricingItem(crypto).subscribe({
                    next: (pricingItem) => {
                        this.log(`✅ Item créé pour ${crypto.symbol}:`, pricingItem);
                        this.replacePricingItem(pricingItem);
                        this.checkCompletion(++completedCount, totalCryptos, observer);
                    },
                    error: (error) => {
                        this.log(`❌ Erreur pour ${crypto.symbol}:`, error);
                        this.ensureDefaultItem(crypto);
                        this.checkCompletion(++completedCount, totalCryptos, observer);
                    }
                });
            });

            this.setTimeoutSafety(completedCount, totalCryptos, observer);
        });
    }

    // =========================== CONSTRUCTION DES ITEMS AVEC NOUVELLE API ===========================


    private getAllCryptoFees(crypto: CryptoCurrency): Observable<any> {
        const feeTypes = ['RECHARGE_CRYPTO', 'BUY_CRYPTO', 'SELL_CRYPTO', 'SEND_TO_FRIEND'];

        const feeRequests = feeTypes.map(type =>
            this.cryptoService.transactionFees({  // ← Nom correct ?
                amount: 1,
                currency: crypto.symbol,
                type: type
            }).pipe(
                map(response => {
                    this.log(`✅ Frais ${type} pour ${crypto.symbol}:`, response);
                    return { [type]: response.data };
                }),
                catchError(error => {
                    this.log(`❌ ERREUR ${type} pour ${crypto.symbol}:`, error);
                    // Retourner null mais continuer
                    return of({ [type]: null });
                })
            )
        );

        // Configuration externe
        const externalTransferFeeKey = `${crypto.symbol}_OTHER_WALLET_TRANSFER_FEES`;
        const externalTransferFee = this.configurationService.getConfigByKey(externalTransferFeeKey);
        const minXafAmount = this.configurationService.getConfigByKey('MIN_XAF_AMOUNT') || 500;

        this.log(`⚙️ Config externe pour ${crypto.symbol}:`, {
            externalTransferFeeKey,
            externalTransferFee,
            minXafAmount
        });

        return forkJoin(feeRequests).pipe(
            map(results => {
                const combinedFees = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
                this.log(`🔗 Frais combinés pour ${crypto.symbol}:`, combinedFees);

                return {
                    ...combinedFees,
                    externalTransferFee,
                    minXafAmount
                };
            }),
            catchError(error => {
                this.log(`❌ ERREUR forkJoin pour ${crypto.symbol}:`, error);
                throw error; // ← Important
            })
        );
    }


    private createPricingItemFromMarketAndFees(
        crypto: CryptoCurrency,
        marketData: any,
        feesData: any
    ): PricingItem {
        this.log(`🏗️ Création item pour ${crypto.symbol}:`, { marketData, feesData });

        // Prix de marché pour 1 unité de crypto (USDC = USDT)
        const marketRates = {
            usdPerUnit: marketData.usd_amount,
            xafPerUnit: marketData.xaf_amount,
            usdcPerUnit: marketData.usdc_amount || marketData.usd_amount
        };

        const item: PricingItem = {
            name: crypto.name,
            abv: crypto.symbol === 'USDT' ? 'USDT-TRC20' : crypto.symbol,
            icon: crypto.icon,
            usdValue: this.formatCurrency(marketRates.usdPerUnit, 'USD'),
            xafValue: this.formatCurrency(marketRates.xafPerUnit, 'XAF'),
            recharge: this.calculateRechargePricingFromAPI(crypto, marketRates, feesData),
            buy: this.calculateBuyPricingFromAPI(crypto, marketRates, feesData),
            sell: this.calculateSellPricingFromAPI(crypto, marketRates, feesData),
            internalTransfer: this.calculateInternalTransferPricingFromAPI(crypto, marketRates, feesData),
            externalTransfer: this.calculateExternalTransferPricingFromAPI(crypto, marketRates, feesData)
        };

        this.log(`✅ Item final créé pour ${crypto.symbol}:`, item);
        return item;
    }

    // =========================== CALCULS AVEC L'API DE FRAIS ===========================

    private calculateRechargePricingFromAPI(crypto: CryptoCurrency, marketRates: any, feesData: any) {
        const rechargeData = feesData.RECHARGE_CRYPTO;

        if (!rechargeData) {
            return this.createDefaultSectionPricing('recharge', crypto);
        }

        // L'API retourne déjà tout calculé pour 1 unité
        const cryptoFee = rechargeData.total - 1; // Frais en crypto (total - montant original)
        const usdFee = rechargeData.usd_fees;     // Frais en USD
        const xafFee = usdFee * (marketRates.xafPerUnit / marketRates.usdPerUnit); // Conversion USD -> XAF

        // Calcul du pourcentage de frais
        const feePercentage = (cryptoFee / 1) * 100;

        this.log(`💳 Recharge ${crypto.symbol}:`, { cryptoFee, usdFee, xafFee, feePercentage });

        return {
            feePercentage: Math.round(feePercentage * 100) / 100,
            cryptoFee: `${this.formatCrypto(cryptoFee)} ${crypto.symbol}`,
            usdFee: this.formatCurrency(usdFee, 'USD'),
            xafFee: this.formatCurrency(xafFee, 'XAF')
        };
    }

    private calculateBuyPricingFromAPI(crypto: CryptoCurrency, marketRates: any, feesData: any) {
        const buyData = feesData.BUY_CRYPTO;

        if (!buyData) {
            return this.createDefaultSectionPricing('buy', crypto);
        }

        const cryptoFee = buyData.total - 1;
        const usdFee = buyData.usd_fees;
        const xafFee = usdFee * (marketRates.xafPerUnit / marketRates.usdPerUnit);
        const feePercentage = (cryptoFee / 1) * 100;

        // Calcul des montants minimums basés sur MIN_XAF_AMOUNT
        const minXafAmount = feesData.minXafAmount;
        const minCryptoAmount = minXafAmount / marketRates.xafPerUnit;
        const minUsdAmount = minXafAmount / (marketRates.xafPerUnit / marketRates.usdPerUnit);

        this.log(`💰 Achat ${crypto.symbol}:`, { cryptoFee, usdFee, xafFee, feePercentage, minCryptoAmount });

        return {
            feePercentage: Math.round(feePercentage * 100) / 100,
            cryptoFee: `${this.formatCrypto(cryptoFee)} ${crypto.symbol}`,
            usdFee: this.formatCurrency(usdFee, 'USD'),
            xafFee: this.formatCurrency(xafFee, 'XAF'),
            minCryptoBuyingValue: `${this.formatCrypto(minCryptoAmount)} ${crypto.symbol}`,
            minBuyingValue: this.formatCurrency(minUsdAmount, 'USD'),
            minBuyingXafValue: this.formatCurrency(minXafAmount, 'XAF')
        };
    }

    private calculateSellPricingFromAPI(crypto: CryptoCurrency, marketRates: any, feesData: any) {
        const sellData = feesData.SELL_CRYPTO;

        if (!sellData) {
            return this.createDefaultSectionPricing('sell', crypto);
        }

        const cryptoFee = sellData.total - 1;
        const usdFee = sellData.usd_fees;
        const xafFee = usdFee * (marketRates.xafPerUnit / marketRates.usdPerUnit);
        const feePercentage = (cryptoFee / 1) * 100;

        const minXafAmount = feesData.minXafAmount;
        const minCryptoAmount = minXafAmount / marketRates.xafPerUnit;
        const minUsdAmount = minXafAmount / (marketRates.xafPerUnit / marketRates.usdPerUnit);

        this.log(`💸 Vente ${crypto.symbol}:`, { cryptoFee, usdFee, xafFee, feePercentage, minCryptoAmount });

        return {
            feePercentage: Math.round(feePercentage * 100) / 100,
            cryptoFee: `${this.formatCrypto(cryptoFee)} ${crypto.symbol}`,
            usdFee: this.formatCurrency(usdFee, 'USD'),
            xafFee: this.formatCurrency(xafFee, 'XAF'),
            minCryptoSellingValue: `${this.formatCrypto(minCryptoAmount)} ${crypto.symbol}`,
            minSellingValue: this.formatCurrency(minUsdAmount, 'USD'),
            minSellingXafValue: this.formatCurrency(minXafAmount, 'XAF')
        };
    }

    private calculateInternalTransferPricingFromAPI(crypto: CryptoCurrency, marketRates: any, feesData: any) {
        const transferData = feesData.SEND_TO_FRIEND;

        if (!transferData) {
            return this.createDefaultSectionPricing('internalTransfer', crypto);
        }

        const cryptoFee = transferData.total - 1;
        const usdFee = transferData.usd_fees;
        const xafFee = usdFee * (marketRates.xafPerUnit / marketRates.usdPerUnit);
        const feePercentage = (cryptoFee / 1) * 100;

        // Pour les transferts internes, minimum plus élevé (10x)
        const minXafAmount = feesData.minXafAmount * 10;
        const minCryptoAmount = minXafAmount / marketRates.xafPerUnit;
        const minUsdAmount = minXafAmount / (marketRates.xafPerUnit / marketRates.usdPerUnit);

        this.log(`🤝 Transfert interne ${crypto.symbol}:`, { cryptoFee, usdFee, xafFee, feePercentage, minCryptoAmount });

        return {
            feePercentage: Math.round(feePercentage * 100) / 100,
            cryptoFee: `${this.formatCrypto(cryptoFee)} ${crypto.symbol}`,
            usdFee: this.formatCurrency(usdFee, 'USD'),
            xafFee: this.formatCurrency(xafFee, 'XAF'),
            minCryptoTransferValue: `${this.formatCrypto(minCryptoAmount)} ${crypto.symbol}`,
            minTransferValue: this.formatCurrency(minUsdAmount, 'USD'),
            minTransferXafValue: this.formatCurrency(minXafAmount, 'XAF')
        };
    }

    private calculateExternalTransferPricingFromAPI(crypto: CryptoCurrency, marketRates: any, feesData: any) {
        const fixedCryptoFee = feesData.externalTransferFee;

        if (!fixedCryptoFee || fixedCryptoFee === 0) {
            return {
                fixedCryptoFee: 'Non configuré',
                fixedUsdFee: 'Non configuré',
                fixedXafFee: 'Non configuré',
                minCryptoTransferValue: 'Non configuré',
                minTransferValue: 'Non configuré',
                minTransferXafValue: 'Non configuré'
            };
        }

        // Conversion des frais fixes en USD et XAF
        const fixedUsdFee = fixedCryptoFee * marketRates.usdPerUnit;
        const fixedXafFee = fixedCryptoFee * marketRates.xafPerUnit;

        // Pour les transferts externes, minimum moyen (2x)
        const minXafAmount = feesData.minXafAmount * 2;
        const minCryptoAmount = minXafAmount / marketRates.xafPerUnit;
        const minUsdAmount = minXafAmount / (marketRates.xafPerUnit / marketRates.usdPerUnit);

        this.log(`🌐 Transfert externe ${crypto.symbol}:`, { fixedCryptoFee, fixedUsdFee, fixedXafFee, minCryptoAmount });

        return {
            fixedCryptoFee: `${this.formatCrypto(fixedCryptoFee)} ${crypto.symbol}`,
            fixedUsdFee: this.formatCurrency(fixedUsdFee, 'USD'),
            fixedXafFee: this.formatCurrency(fixedXafFee, 'XAF'),
            minCryptoTransferValue: `${this.formatCrypto(minCryptoAmount)} ${crypto.symbol}`,
            minTransferValue: this.formatCurrency(minUsdAmount, 'USD'),
            minTransferXafValue: this.formatCurrency(minXafAmount, 'XAF')
        };
    }

    // =========================== UTILITAIRES POUR LES ERREURS ===========================

    private createDefaultSectionPricing(sectionType: string, crypto: CryptoCurrency): any {
        const baseDefault = {
            feePercentage: 0,
            cryptoFee: `0.000000 ${crypto.symbol}`,
            usdFee: '$0.00',
            xafFee: '0 XAF'
        };

        switch (sectionType) {
            case 'buy':
                return {
                    ...baseDefault,
                    minCryptoBuyingValue: `0.000000 ${crypto.symbol}`,
                    minBuyingValue: '$0.00',
                    minBuyingXafValue: '0 XAF'
                };
            case 'sell':
                return {
                    ...baseDefault,
                    minCryptoSellingValue: `0.000000 ${crypto.symbol}`,
                    minSellingValue: '$0.00',
                    minSellingXafValue: '0 XAF'
                };
            case 'internalTransfer':
                return {
                    ...baseDefault,
                    minCryptoTransferValue: `0.000000 ${crypto.symbol}`,
                    minTransferValue: '$0.00',
                    minTransferXafValue: '0 XAF'
                };
            default:
                return baseDefault;
        }
    }

    // =========================== UTILITAIRES (INCHANGÉ) ===========================

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

    private createDefaultPricingItem(crypto: CryptoCurrency): Observable<PricingItem> {
        const defaultItems = this.getDefaultPricingItems();
        const defaultItem = defaultItems.find(item =>
            item.abv === crypto.symbol ||
            item.abv.startsWith(crypto.symbol) ||
            item.name === crypto.name
        );

        return of(defaultItem || {
            name: crypto.name,
            abv: crypto.symbol,
            icon: crypto.icon,
            usdValue: 'Loading...',
            xafValue: 'Loading...',
            recharge: {
                feePercentage: 0,
                cryptoFee: 'Loading...',
                usdFee: 'Loading...',
                xafFee: 'Loading...'
            },
            buy: {
                feePercentage: 0,
                cryptoFee: 'Loading...',
                usdFee: 'Loading...',
                xafFee: 'Loading...',
                minCryptoBuyingValue: 'Loading...',
                minBuyingValue: 'Loading...',
                minBuyingXafValue: 'Loading...'
            },
            sell: {
                feePercentage: 0,
                cryptoFee: 'Loading...',
                usdFee: 'Loading...',
                xafFee: 'Loading...',
                minCryptoSellingValue: 'Loading...',
                minSellingValue: 'Loading...',
                minSellingXafValue: 'Loading...'
            },
            internalTransfer: {
                feePercentage: 0,
                cryptoFee: 'Loading...',
                usdFee: 'Loading...',
                xafFee: 'Loading...',
                minCryptoTransferValue: 'Loading...',
                minTransferValue: 'Loading...',
                minTransferXafValue: 'Loading...'
            },
            externalTransfer: {
                fixedCryptoFee: 'Loading...',
                fixedUsdFee: 'Loading...',
                fixedXafFee: 'Loading...',
                minCryptoTransferValue: 'Loading...',
                minTransferValue: 'Loading...',
                minTransferXafValue: 'Loading...'
            }
        });
    }


    private replacePricingItem(newItem: PricingItem): void {
        const currentItems = [...this.pricingItemsSubject.getValue()];
        this.log(`🔄 Remplacement item. Avant:`, currentItems.map(i => i.abv));

        const index = currentItems.findIndex(item =>
            item.abv === newItem.abv ||
            item.abv.startsWith(newItem.abv.split('-')[0]) ||
            item.name === newItem.name
        );

        if (index !== -1) {
            this.log(`🔄 Remplacement item à l'index ${index}: ${newItem.abv}`);
            currentItems[index] = newItem;
        } else {
            this.log(`➕ Ajout nouvel item: ${newItem.abv}`);
            currentItems.push(newItem);
        }

        this.log(`✅ Liste après mise à jour:`, currentItems.map(i => i.abv));
        this.pricingItemsSubject.next(currentItems);

        // Vérifier que la mise à jour a bien eu lieu
        setTimeout(() => {
            const updatedItems = this.pricingItemsSubject.getValue();
            this.log(`🎯 Vérification BehaviorSubject:`, updatedItems.map(i => i.abv));
        }, 100);
    }


    private ensureDefaultItem(crypto: CryptoCurrency): void {
        const currentItems = this.pricingItemsSubject.getValue();
        const existingIndex = currentItems.findIndex(item =>
            item.abv === crypto.symbol ||
            item.abv.startsWith(crypto.symbol) ||
            item.name === crypto.name
        );

        if (existingIndex === -1) {
            this.createDefaultPricingItem(crypto).subscribe(defaultItem => {
                this.replacePricingItem(defaultItem!);
            });
        }
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
        const errorMessage = error.error?.message || error.message || 'Une erreur est survenue';
        this.errorSubject.next(errorMessage);
    }


    // =========================== DONNÉES PAR DÉFAUT (INCHANGÉ) ===========================

    private getDefaultPricingItems(): PricingItem[] {
    return [
        {
            name: 'Tether',
            abv: 'USDT',
            icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/825.png',
            usdValue: 'En cours...',
            xafValue: 'En cours...',
            recharge: {
                feePercentage: 0,
                cryptoFee: 'En cours...',
                usdFee: 'En cours...',
                xafFee: 'En cours...'
            },
            buy: {
                feePercentage: 0,
                cryptoFee: 'En cours...',
                usdFee: 'En cours...',
                xafFee: 'En cours...',
                minCryptoBuyingValue: 'En cours...',
                minBuyingValue: 'En cours...',
                minBuyingXafValue: 'En cours...'
            },
            sell: {
                feePercentage: 0,
                cryptoFee: 'En cours...',
                usdFee: 'En cours...',
                xafFee: 'En cours...',
                minCryptoSellingValue: 'En cours...',
                minSellingValue: 'En cours...',
                minSellingXafValue: 'En cours...'
            },
            internalTransfer: {
                feePercentage: 0,
                cryptoFee: 'En cours...',
                usdFee: 'En cours...',
                xafFee: 'En cours...',
                minCryptoTransferValue: 'En cours...',
                minTransferValue: 'En cours...',
                minTransferXafValue: 'En cours...'
            },
            externalTransfer: {
                fixedCryptoFee: 'En cours...',
                fixedUsdFee: 'En cours...',
                fixedXafFee: 'En cours...',
                minCryptoTransferValue: 'En cours...',
                minTransferValue: 'En cours...',
                minTransferXafValue: 'En cours...'
            }
        },
        {
            name: 'Bitcoin',
            abv: 'BTC',
            icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1.png',
            usdValue: 'En cours...',
            xafValue: 'En cours...',
            recharge: {
                feePercentage: 0,
                cryptoFee: 'En cours...',
                usdFee: 'En cours...',
                xafFee: 'En cours...'
            },
            buy: {
                feePercentage: 0,
                cryptoFee: 'En cours...',
                usdFee: 'En cours...',
                xafFee: 'En cours...',
                minCryptoBuyingValue: 'En cours...',
                minBuyingValue: 'En cours...',
                minBuyingXafValue: 'En cours...'
            },
            sell: {
                feePercentage: 0,
                cryptoFee: 'En cours...',
                usdFee: 'En cours...',
                xafFee: 'En cours...',
                minCryptoSellingValue: 'En cours...',
                minSellingValue: 'En cours...',
                minSellingXafValue: 'En cours...'
            },
            internalTransfer: {
                feePercentage: 0,
                cryptoFee: 'En cours...',
                usdFee: 'En cours...',
                xafFee: 'En cours...',
                minCryptoTransferValue: 'En cours...',
                minTransferValue: 'En cours...',
                minTransferXafValue: 'En cours...'
            },
            externalTransfer: {
                fixedCryptoFee: 'En cours...',
                fixedUsdFee: 'En cours...',
                fixedXafFee: 'En cours...',
                minCryptoTransferValue: 'En cours...',
                minTransferValue: 'En cours...',
                minTransferXafValue: 'En cours...'
            }
        },
        {
            name: 'Ethereum',
            abv: 'ETH',
            icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1027.png',
            usdValue: 'En cours...',
            xafValue: 'En cours...',
            recharge: {
                feePercentage: 0,
                cryptoFee: 'En cours...',
                usdFee: 'En cours...',
                xafFee: 'En cours...'
            },
            buy: {
                feePercentage: 0,
                cryptoFee: 'En cours...',
                usdFee: 'En cours...',
                xafFee: 'En cours...',
                minCryptoBuyingValue: 'En cours...',
                minBuyingValue: 'En cours...',
                minBuyingXafValue: 'En cours...'
            },
            sell: {
                feePercentage: 0,
                cryptoFee: 'En cours...',
                usdFee: 'En cours...',
                xafFee: 'En cours...',
                minCryptoSellingValue: 'En cours...',
                minSellingValue: 'En cours...',
                minSellingXafValue: 'En cours...'
            },
            internalTransfer: {
                feePercentage: 0,
                cryptoFee: 'En cours...',
                usdFee: 'En cours...',
                xafFee: 'En cours...',
                minCryptoTransferValue: 'En cours...',
                minTransferValue: 'En cours...',
                minTransferXafValue: 'En cours...'
            },
            externalTransfer: {
                fixedCryptoFee: 'En cours...',
                fixedUsdFee: 'En cours...',
                fixedXafFee: 'En cours...',
                minCryptoTransferValue: 'En cours...',
                minTransferValue: 'En cours...',
                minTransferXafValue: 'En cours...'
            }
        }
    ];
}



    // =========================== TRAITEMENT PAS À PAS POUR BUY_CRYPTO ===========================

private buildPricingItem(crypto: CryptoCurrency): Observable<PricingItem> {
    this.log(`🚀 Début construction pour ${crypto.symbol}`);

    // 1. Récupérer MIN_XAF_AMOUNT et le convertir en crypto
    const minXafAmount = this.configurationService.getConfigByKey('MIN_XAF_AMOUNT') || 500;
    this.log(`💰 MIN_XAF_AMOUNT configuré : ${minXafAmount} XAF`);

    return this.cryptoService.convertToCrypto({
        amount: minXafAmount
    }).pipe(
        switchMap(minXafToCryptoResponse => {
            this.log(`🔄 Conversion MIN_XAF vers cryptos:`, minXafToCryptoResponse.data);
            
            // 2. Récupérer les frais d'achat pour 1 unité de crypto
            return this.getBuyCryptoFeesAndCalculate(crypto, minXafToCryptoResponse.data, minXafAmount);
        }),
        catchError((error) => {
            this.log(`❌ ERREUR DÉTAILLÉE pour ${crypto.symbol}:`, error);
            throw error;
        })
    );
}

private getBuyCryptoFeesAndCalculate(
    crypto: CryptoCurrency, 
    minXafToCryptoData: any, 
    minXafAmount: number
): Observable<PricingItem> {
    
    this.log(`📊 Calcul frais d'achat pour ${crypto.symbol}`);
    
    // Étape 2: Récupérer les frais d'achat pour 1 unité
    return this.cryptoService.transactionFees({
        amount: 1,
        currency: crypto.symbol,
        type: 'BUY_CRYPTO'
    }).pipe(
        switchMap(buyFeesResponse => {
            this.log(`💸 Frais d'achat reçus pour ${crypto.symbol}:`, buyFeesResponse.data);
            
            // Étape 3: Calculer cryptoFee 
            const referenceAmount = 1;
            const cryptoFee = buyFeesResponse.data.total - referenceAmount;
            this.log(`🧮 Calcul cryptoFee: ${buyFeesResponse.data.total} - ${referenceAmount} = ${cryptoFee}`);
            
            // Étape 4: Convertir cryptoFee en XAF
            return this.convertCryptoFeeToXaf(crypto, cryptoFee, buyFeesResponse.data, minXafToCryptoData, minXafAmount);
        }),
        catchError(error => {
            this.log(`❌ ERREUR frais d'achat pour ${crypto.symbol}:`, error);
            throw error;
        })
    );
}

private convertCryptoFeeToXaf(
    crypto: CryptoCurrency,
    cryptoFee: number,
    buyFeesData: any,
    minXafToCryptoData: any,
    minXafAmount: number
): Observable<PricingItem> {
    
    this.log(`🔄 Conversion cryptoFee vers XAF pour ${crypto.symbol}. CryptoFee: ${cryptoFee}`);
    
    return this.cryptoService.convertToFiat({
        amount: cryptoFee,
        crypto_currency: crypto.symbol
    }).pipe(
        map(cryptoFeeToXafResponse => {
            this.log(`💱 Conversion cryptoFee vers fiat:`, cryptoFeeToXafResponse.data);
            
            // Étape 5: Construire la structure buy avec tous les calculs
            return this.buildBuyPricingStructure(
                crypto,
                buyFeesData,
                cryptoFee,
                cryptoFeeToXafResponse.data,
                minXafToCryptoData,
                minXafAmount
            );
        }),
        catchError(error => {
            this.log(`❌ ERREUR conversion cryptoFee vers XAF pour ${crypto.symbol}:`, error);
            throw error;
        })
    );
}

private buildBuyPricingStructure(
    crypto: CryptoCurrency,
    buyFeesData: any,
    cryptoFee: number,
    cryptoFeeInFiat: any,
    minXafToCryptoData: any,
    minXafAmount: number
): PricingItem {
    
    this.log(`🏗️ Construction structure buy pour ${crypto.symbol}`);
    
    // Récupération de la configuration feePercentage
    const feePercentage = this.configurationService.getConfigByKey('CRYPTO_BUY_SERVICE_FEES_PERCENTAGE') || 0;
    
    // Construction des valeurs selon vos spécifications
    const buyStructure = {
        feePercentage: feePercentage,
        cryptoFee: `${this.formatCrypto(cryptoFee)} ${crypto.symbol}`,
        usdFee: this.formatCurrency(buyFeesData.usd_fees, 'USD'),
        xafFee: `${Math.round(cryptoFeeInFiat.xaf_amount)} XAF`,
        
        // Valeurs minimales depuis la conversion MIN_XAF_AMOUNT
        minCryptoBuyingValue: `${this.formatCrypto(minXafToCryptoData[`${crypto.symbol.toLowerCase()}_amount`])} ${crypto.symbol}`,
        minBuyingValue: this.formatCurrency(minXafToCryptoData.usd_amount, 'USD'),
        minBuyingXafValue: `${minXafAmount} XAF`
    };
    
    this.log(`✅ Structure buy construite pour ${crypto.symbol}:`, buyStructure);
    
    // Construire l'item complet (temporairement avec buy seulement)
    const pricingItem: PricingItem = {
        name: crypto.name,
        abv: crypto.symbol,
        icon: crypto.icon,
        
        // Prix unitaire depuis les données de frais
        usdValue: this.formatCurrency(buyFeesData.usd_total / buyFeesData.total, 'USD'),
        xafValue: `${Math.round(buyFeesData.xaf_total / buyFeesData.total)} XAF`,
        
        // Structure buy calculée
        buy: buyStructure,
        
        // Structures temporaires (à implémenter plus tard)
        recharge: this.getTemporaryStructure('recharge'),
        sell: this.getTemporaryStructure('sell'),
        internalTransfer: this.getTemporaryStructure('internalTransfer'),
        externalTransfer: this.getTemporaryStructure('externalTransfer')
    };
    
    return pricingItem;
}

// =========================== MÉTHODES UTILITAIRES ===========================

private formatCrypto(amount: number): string {
    if (amount < 0.000001) {
        return amount.toExponential(2);
    }
    return amount.toFixed(6).replace(/\.?0+$/, '');
}

private formatCurrency(amount: number, currency: 'USD' | 'XAF'): string {
    if (currency === 'USD') {
        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
        return `${Math.round(amount).toLocaleString('fr-FR')} XAF`;
    }
}

private getTemporaryStructure(type: string): any {
    const baseStructure = {
        feePercentage: 0,
        cryptoFee: 'En cours...',
        usdFee: 'En cours...',
        xafFee: 'En cours...'
    };
    
    switch (type) {
        case 'buy':
        case 'sell':
            return {
                ...baseStructure,
                minCryptoBuyingValue: 'En cours...',
                minBuyingValue: 'En cours...',
                minBuyingXafValue: 'En cours...',
                ...(type === 'sell' && {
                    minCryptoSellingValue: 'En cours...',
                    minSellingValue: 'En cours...',
                    minSellingXafValue: 'En cours...'
                })
            };
        case 'internalTransfer':
            return {
                ...baseStructure,
                minCryptoTransferValue: 'En cours...',
                minTransferValue: 'En cours...',
                minTransferXafValue: 'En cours...'
            };
        case 'externalTransfer':
            return {
                fixedCryptoFee: 'En cours...',
                fixedUsdFee: 'En cours...',
                fixedXafFee: 'En cours...',
                minCryptoTransferValue: 'En cours...',
                minTransferValue: 'En cours...',
                minTransferXafValue: 'En cours...'
            };
        default:
            return baseStructure;
    }
}

}