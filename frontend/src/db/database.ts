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

class FinanceDatabase extends Dexie {
    users!: Table<User, string>;
    categories!: Table<Category, string>;
    transactions!: Table<Transaction, string>;

    constructor() {
        super(DB_NAME);

        // v1 — начальная схема, не удалять
        this.version(1).stores({
            users: 'id',
            categories: 'id, user_id',
            transactions: 'id, user_id, category_id, transaction_date, is_synced',
        });

        // v2 — добавлен индекс is_deleted
        // .upgrade() проставляет is_deleted = 0 всем существующим записям
        this.version(DB_VERSION).stores(STORES).upgrade(async (tx) => {
            await tx.table('categories').toCollection().modify((category) => {
                category.is_deleted = 0;
            });
            await tx.table('transactions').toCollection().modify((transaction) => {
                transaction.is_deleted = 0;
            });
        });
    }
}

export const db = new FinanceDatabase();