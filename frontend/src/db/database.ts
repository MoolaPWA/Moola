import Dexie, { type Table } from 'dexie';
import { DB_NAME, DB_VERSION, STORES } from './schema';

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Category {
    id: string;
    user_id: string;
    name: string;
    type: 'income' | 'expense';
    is_deleted: 0 | 1;  // новое поле
}

export interface Transaction {
    id: string;
    user_id: string;
    category_id: string;
    amount: number;
    type: 'income' | 'expense';
    transaction_date: string;
    description: string;
    created_at: string;
    updated_at: string;
    is_synced: 0 | 1;
    is_deleted: 0 | 1;  // новое поле
}


export interface AuthRecord {
    key: string; // 'refresh_token'
    value: string;
}


class FinanceDatabase extends Dexie {
    users!: Table<User, string>;
    categories!: Table<Category, string>;
    transactions!: Table<Transaction, string>;
    auth!: Table<AuthRecord, string>;

    constructor() {
        super(DB_NAME);
        this.version(DB_VERSION).stores(STORES);
    }
}

export const db = new FinanceDatabase();