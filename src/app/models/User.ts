export interface User {
    id?: number;
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
}

export interface ResponseUser {
    statusCode: number;
    message: string;
    data?: {
        token: any;
    }
}