export interface ResponseDeposit {
    statusCode: number;
    message: string;
    data?: {
        wallet: {
            solde: number;
            type: string;
            _id: string;
        }
    }
}

export interface ResponseCryptoFee{

    statusCode: number,
    message: string,
    data?: {
      details: {
        currency_from: string,
        currency_to: string,
        services_fee: number,
        sub_total: number,
        total: number
      }
    }

}

export interface ResponseTransactionList {
    statusCode: number;
    message: string;
    data: {
        transactions: [
            {
                _id: string;
                uuid: string;
                type: string;
                taux: number;
                date: string;
                infoSup: string;
                userId: string;
                __v: 0
            }
        ]
    }
}

export interface ResponseParent {
    statusCode: number;
    message: string;
    data?: any
}
