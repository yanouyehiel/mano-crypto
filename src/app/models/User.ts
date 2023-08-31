export interface User {
    id?: number;
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
}

export interface ProfileUser {
    id: string | undefined;
    name: string | undefined;
    email: string | undefined;
    phone: string | undefined;
    isVerify: boolean | undefined;
}

export interface ResponseUser {
    statusCode: number;
    message: string;
    data?: {
        token: any;
    }
}

export interface ResponseProfile {
    statusCode: number;
    message: string;
    data?: {
        user: {
            id: string;
            name: string;
            email: string;
            phoneNumber: string;
            isVerified: boolean;
        }
    }
}