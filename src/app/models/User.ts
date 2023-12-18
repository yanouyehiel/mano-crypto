export interface User {
    id?: number;
    name: string;
    role?:string;
    country?:string;
    email: string;
    password: string;
    countryCode: string;
    phoneNumber: string;
}

export interface ProfileUser {
    id: string | undefined;
    role?:string;
    name: string | undefined;
    email: string | undefined;
    phone: string | undefined;
    isPhoneVerified?: boolean | undefined;
    isEmailVerified?: boolean | undefined;
}

export interface ResponseUser {
    statusCode: number;
    message: string;
    data?: {
        token: any;
        user: any;
    };
}

export interface ResponseProfile {
    statusCode: number;
    message: string;
    data?: {
        user: {
            id: string;
            name: string;
            email: string;
            role?:string;
            phoneNumber: string;
            isEmailVerified: boolean;
            isPhoneNumberVerified: boolean;
        }
    }
}

export interface ResponseEmail {
    statusCode: number;
    message: string;
}