export interface Table {
    id: string;
    transactionType: string;
    date: string;
    price: string;
    devise: string;
    status: string;
    bgClass: string;
    icon: string;
}

export interface TableUser {
    id: string;
    name: string;
    email: string;
    countryCode: string;
    phoneNumber: string;
    isEmailVerified: boolean;
    isPhoneNumberVerified: boolean;
    soldeXAF: string;
    soldeBTC: string;
    soldeETH: string;
}