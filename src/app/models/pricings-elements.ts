// interfaces/pricing.interface.ts
export interface Configuration {
  _id: string;
  key: string;
  value: string | number | boolean;
  description_fr: string;
  description_en: string;
  __v: number;
}
export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}


export interface CryptoConversionResponse {
  statusCode: number;
  message: string;
  data: {
    crypto_amount: number;
    crypto_currency: string;
    xaf_amount: number;
    usdc_amount: number;
    usd_amount: number;
  };
}

// models/pricings-elements.ts
export interface PricingItem {
  // Informations de base
  name: string;
  abv: string;
  icon: string;
  
  // Valeurs de référence
  usdValue: string;
  xafValue: string;
  
  // RECHARGE - Frais de recharge crypto
  recharge: {
    feePercentage: number;
    cryptoFee: string;
    usdFee: string;
    xafFee: string;
  };
  
  // ACHAT - Frais d'achat crypto
  buy: {
    feePercentage: number;
    cryptoFee: string;
    usdFee: string;
    xafFee: string;
    minCryptoBuyingValue: string;
    minBuyingValue: string;
    minBuyingXafValue: string;
  };
  
  // VENTE - Frais de vente crypto
  sell: {
    feePercentage: number;
    cryptoFee: string;
    usdFee: string;
    xafFee: string;
    minCryptoSellingValue: string;
    minSellingValue: string;
    minSellingXafValue: string;
  };
  
  // TRANSFERT INTERNE - Transfert vers un ami
  internalTransfer: {
    feePercentage: number;
    cryptoFee: string;
    usdFee: string;
    xafFee: string;
    minCryptoTransferValue: string;
    minTransferValue: string;
    minTransferXafValue: string;
  };
  
  // TRANSFERT EXTERNE - Transfert vers autre wallet
  externalTransfer: {
    fixedCryptoFee: string;  // Frais fixe en crypto
    fixedUsdFee: string;     // Équivalent USD
    fixedXafFee: string;     // Équivalent XAF
    minCryptoTransferValue: string;
    minTransferValue: string;
    minTransferXafValue: string;
  };
}


export interface CryptoCurrency {
  symbol: string;
  name: string;
  icon: string;
}
