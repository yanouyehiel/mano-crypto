import { Injectable } from "@angular/core";
import { Observable, forkJoin, tap, catchError, of, switchMap, map } from "rxjs";
import { PricingItem } from "../models/pricings-elements";
import { ConfigurationService } from "./configuration.service";
import { CryptoTransactionService } from "./crypto-transaction.service";


@Injectable({
  providedIn: 'root'
})
export class BuyPricingService {
  
  private readonly logPrefix = '[BUY-PRICING]';

  constructor(
    private cryptoService: CryptoTransactionService,
    private configurationService: ConfigurationService
  ) {}

  private log(message: string, data?: any): void {
    if (data) {
      console.log(`${this.logPrefix} ${message}`, data);
    } else {
      console.log(`${this.logPrefix} ${message}`);
    }
  }

  // =========================== MÉTHODE PRINCIPALE BUY ===========================
  
  public getBuyPricingData(): Observable<PricingItem[]> {
    this.log('🚀 Début construction grille tarifaire BUY');
    
    const cryptos = this.getSupportedCryptos();
    
    return forkJoin(
      cryptos.map(crypto => this.buildBuyPricingItem(crypto))
    ).pipe(
      tap(pricingItems => {
        this.log('✅ Grille tarifaire BUY complète:', pricingItems);
      }),
      catchError(error => {
        this.log('❌ ERREUR construction grille BUY:', error);
        return of(this.getDefaultBuyPricingItems());
      })
    );
  }

  // =========================== CONSTRUCTION ITEM BUY ===========================

  private buildBuyPricingItem(crypto: CryptoCurrency): Observable<PricingItem> {
    this.log(`🛒 Construction BUY pour ${crypto.symbol}`);

    // 1. Récupérer MIN_XAF_AMOUNT et le convertir
    const minXafAmount = this.configurationService.getConfigByKey('MIN_XAF_AMOUNT') || 500;
    this.log(`💰 MIN_XAF_AMOUNT: ${minXafAmount} XAF`);

    return this.cryptoService.convertToCrypto({
        amount: minXafAmount
    }).pipe(
        switchMap(minXafToCryptoResponse => {
            this.log(`🔄 Conversion MIN_XAF vers cryptos:`, minXafToCryptoResponse.data);
            
            // 2. Récupérer le prix de marché pour 1 unité
            return this.getMarketPrice(crypto).pipe(
                switchMap(marketData => {
                    // 3. Calculer les frais d'achat
                    return this.getBuyFeesData(crypto).pipe(
                        map(buyFeesData => {
                            // 4. Construction finale
                            return this.createBuyPricingItem(
                                crypto,
                                marketData,
                                buyFeesData,
                                minXafToCryptoResponse.data,
                                minXafAmount
                            );
                        })
                    );
                })
            );
        }),
        catchError(error => {
            this.log(`❌ ERREUR pour ${crypto.symbol}:`, error);
            return of(this.getDefaultBuyPricingItem(crypto));
        })
    );
  }

  // =========================== PRIX DE MARCHÉ ===========================

  private getMarketPrice(crypto: CryptoCurrency): Observable<any> {
    this.log(`📊 Récupération prix marché pour ${crypto.symbol}`);
    
    return this.cryptoService.convertToFiat({
        amount: 1,
        crypto_currency: crypto.symbol.toLowerCase()
    }).pipe(
        tap(response => {
            this.log(`💹 Prix marché ${crypto.symbol}:`, response.data);
        })
    );
  }

  // =========================== FRAIS D'ACHAT ===========================

  private getBuyFeesData(crypto: CryptoCurrency): Observable<any> {
    this.log(`💸 Calcul frais BUY pour ${crypto.symbol}`);
    
    // Étape 1: Récupérer les frais pour 1 unité
    return this.cryptoService.transactionFees({
        amount: 1,
        currency: crypto.symbol,
        type: 'BUY_CRYPTO'
    }).pipe(
        switchMap(buyFeesResponse => {
            this.log(`📋 Frais BUY reçus:`, buyFeesResponse.data);
            
            // Étape 2: Calculer cryptoFee
            const referenceAmount = 1;
            const cryptoFee = buyFeesResponse.data.total - referenceAmount;
            this.log(`🧮 CryptoFee calculé: ${cryptoFee} ${crypto.symbol}`);
            
            // Étape 3: Convertir cryptoFee en XAF
            return this.convertCryptoFeeToXaf(crypto, cryptoFee).pipe(
                map(cryptoFeeXafResponse => {
                    this.log(`💱 CryptoFee en XAF:`, cryptoFeeXafResponse.data);
                    
                    return {
                        buyFeesResponse: buyFeesResponse.data,
                        cryptoFee: cryptoFee,
                        cryptoFeeInXaf: cryptoFeeXafResponse.data
                    };
                })
            );
        })
    );
  }

  private convertCryptoFeeToXaf(crypto: CryptoCurrency, cryptoFee: number): Observable<any> {
    return this.cryptoService.convertToFiat({
        amount: cryptoFee,
        crypto_currency: crypto.symbol.toLowerCase()
    });
  }

  // =========================== CONSTRUCTION FINALE ===========================

  private createBuyPricingItem(
    crypto: CryptoCurrency,
    marketData: any,
    buyFeesData: any,
    minXafToCryptoData: any,
    minXafAmount: number
  ): PricingItem {
    
    this.log(`🏗️ Construction finale BUY pour ${crypto.symbol}`);
    
    // Récupérer le pourcentage depuis la config
    const feePercentage = this.configurationService.getConfigByKey('CRYPTO_BUY_SERVICE_FEES_PERCENTAGE') || 0;
    
    const buyStructure = {
        feePercentage: feePercentage,
        cryptoFee: `${this.formatCrypto(buyFeesData.cryptoFee)} ${crypto.symbol}`,
        usdFee: this.formatCurrency(buyFeesData.buyFeesResponse.usd_fees, 'USD'),
        xafFee: this.formatCurrency(buyFeesData.cryptoFeeInXaf.xaf_amount, 'XAF'),
        
        // Minimums d'achat
        minCryptoBuyingValue: `${this.formatCrypto(minXafToCryptoData[`${crypto.symbol.toLowerCase()}_amount`])} ${crypto.symbol}`,
        minBuyingValue: this.formatCurrency(minXafToCryptoData.usd_amount, 'USD'),
        minBuyingXafValue: `${minXafAmount} XAF`
    };

    const pricingItem: PricingItem = {
        name: crypto.name,
        abv: crypto.symbol,
        icon: crypto.icon,
        usdValue: this.formatCurrency(marketData.usd_amount, 'USD'),
        xafValue: this.formatCurrency(marketData.xaf_amount, 'XAF'),
        
        // Structure BUY calculée
        buy: buyStructure,
        
        // Autres sections en mode "en cours"
        recharge: this.getTemporaryStructure('recharge'),
        sell: this.getTemporaryStructure('sell'),
        internalTransfer: this.getTemporaryStructure('internalTransfer'),
        externalTransfer: this.getTemporaryStructure('externalTransfer')
    };

    this.log(`✅ PricingItem BUY créé pour ${crypto.symbol}:`, pricingItem);
    return pricingItem;
  }

  // =========================== UTILITAIRES ===========================

  private getSupportedCryptos(): CryptoCurrency[] {
    return [
        {
            name: 'Bitcoin',
            symbol: 'BTC',
            icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1.png'
        },
        {
            name: 'Tether',
            symbol: 'USDT',
            icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/825.png'
        },
        {
            name: 'Ethereum',
            symbol: 'ETH',
            icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1027.png'
        }
    ];
  }

  private formatCrypto(amount: number): string {
    if (amount < 0.001) {
        return amount.toFixed(8);
    }
    return amount.toFixed(6);
  }

  private formatCurrency(amount: number, currency: 'USD' | 'XAF'): string {
    if (currency === 'USD') {
        return `$${amount.toFixed(2)}`;
    }
    return `${Math.round(amount)} XAF`;
  }

  private getTemporaryStructure(type: string): any {
    return {
        feePercentage: 0,
        cryptoFee: 'En cours...',
        usdFee: 'En cours...',
        xafFee: 'En cours...'
    };
  }

  private getDefaultBuyPricingItems(): PricingItem[] {
    return this.getSupportedCryptos().map(crypto => this.getDefaultBuyPricingItem(crypto));
  }

  private getDefaultBuyPricingItem(crypto: CryptoCurrency): PricingItem {
    return {
        name: crypto.name,
        abv: crypto.symbol,
        icon: crypto.icon,
        usdValue: 'En cours...',
        xafValue: 'En cours...',
        buy: this.getTemporaryStructure('buy'),
        recharge: this.getTemporaryStructure('recharge'),
        sell: this.getTemporaryStructure('sell'),
        internalTransfer: this.getTemporaryStructure('internalTransfer'),
        externalTransfer: this.getTemporaryStructure('externalTransfer')
    };
  }
}

// =========================== INTERFACE ===========================

interface CryptoCurrency {
  name: string;
  symbol: string;
  icon: string;
}
