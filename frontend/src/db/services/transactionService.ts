import { db, type Transaction } from '../database';

export const transactionService = {

    async getById(id: string): Promise<Transaction | undefined> {
        return db.transactions.get(id);
    },

    async getAllByUser(user_id: string): Promise<Transaction[]> {
        return db.transactions.where('user_id').equals(user_id).toArray();
    },

    async getByCategory(category_id: string): Promise<Transaction[]> {
        return db.transactions.where('category_id').equals(category_id).toArray();
    },

    async getByDateRange(
        user_id: string,
        from: string,
        to: string
    ): Promise<Transaction[]> {
        return db.transactions
            .where('transaction_date')
            .between(from, to, true, true)
            .filter((t) => t.user_id === user_id)
            .toArray();
    },

    async getUnsynced(): Promise<Transaction[]> {
        return db.transactions.where('is_synced').equals(0).toArray();
    },

    async create(data: Omit<Transaction, 'id'>): Promise<string> {
        const transaction: Transaction = {
            id: crypto.randomUUID(),
            ...data,
        };
        await db.transactions.add(transaction);
        return transaction.id;
    },

    async update(
        id: string,
        data: Partial<Omit<Transaction, 'id'>>
    ): Promise<void> {
        await db.transactions.update(id, data);
    },

    async delete(id: string): Promise<void> {
        await db.transactions.delete(id);
    },

};