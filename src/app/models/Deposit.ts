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