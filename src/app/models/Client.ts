import { User } from "./User";

export interface Client {
    user: User;
    compteCrypto: string;
    adresse: string;
    isConfirmer: boolean;
}