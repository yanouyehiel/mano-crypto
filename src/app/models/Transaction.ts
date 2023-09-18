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