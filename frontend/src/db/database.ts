import Dexie, { type Table } from 'dexie';
import {DB_NAME, STORES, DB_VERSION} from "@/db/schema.ts";

export interface User {
    id: string; // UUID
    name: string;
    email: string;
    // password не храним локально, только на сервере
}

export interface Category {
    id: string;
    user_id: string;
    name: string;
    type: 'income' | 'expense';
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
}


class FinanceDatabase extends Dexie {
    users!: Table<User, string>;
    categories!: Table<Category, string>;
    transactions!: Table<Transaction, string>;

    constructor() {
        super(DB_NAME);

        this.version(DB_VERSION).stores(STORES);
    }
}

export const db = new FinanceDatabase();