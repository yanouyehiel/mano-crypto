// interfaces/pricing.interface.ts
export interface Configuration {
  _id: string;
  key: string;
  value: string | number | boolean;
  description_fr: string;
  description_en: string;
  __v: number;
  ETH_OTHER_WALLET_TRANSFER_FEES?: number;
  BTC_OTHER_WALLET_TRANSFER_FEES?: number;
  USDT_OTHER_WALLET_TRANSFER_FEES?: number;
  CRYPTO_SEND_TO_FRIEND_NETWORK_FEES_PERCENTAGE?: number;
  CRYPTO_SEND_TO_FRIEND_FEES_PERCENTAGE?: number;
  XAF_OTHER_WALLET_TRANSFER_FEES?: number;
  XAF_DEPOSITS_FEES_PERCENTAGE?: number;
  XAF_WITHDRAW_FEES_PERCENTAGE?: number;
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

export interface PricingItem {
  name: string;
  abv: string;
  usdValue: string;
  xafValue: string;
  manenFee: string;
  manenXafFee: string;
  minCryptoByingValue: string;
  minByingValue: string;
  minByingXafValue: string;
  minCryptoTransferableValue: string;
  minTransferableValue: string;
  minTransferableXafValue: string;
  icon: string;
}

export interface CryptoCurrency {
  symbol: string;
  name: string;
  icon: string;
}

export interface Currency {
  symbol: string;
  name: string;
  icon: string;
}
