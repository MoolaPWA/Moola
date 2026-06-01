import { db, type Transaction } from '../database';
import {generateUUID} from "@/db/utils/uuid.ts";

export const transactionService = {

    async getById(id: string): Promise<Transaction | undefined> {
        return db.transactions.get(id);
    },

    // Возвращаем только не удалённые
    async getAllByUser(user_id: string): Promise<Transaction[]> {
        return db.transactions
            .where('user_id').equals(user_id)
            .filter((t) => t.is_deleted === 0)
            .toArray();
    },

    async getByCategory(category_id: string): Promise<Transaction[]> {
        return db.transactions
            .where('category_id').equals(category_id)
            .filter((t) => t.is_deleted === 0)
            .toArray();
    },

    async getByDateRange(user_id: string, from: string, to: string): Promise<Transaction[]> {
        return db.transactions
            .where('transaction_date').between(from, to, true, true)
            .filter((t) => t.user_id === user_id && t.is_deleted === 0)
            .toArray();
    },

    async getUnsynced(): Promise<Transaction[]> {
        return db.transactions.where('is_synced').equals(0).toArray();
    },

    // Последние N операций для главного экрана
    async getLatest(user_id: string, limit: number = 3): Promise<Transaction[]> {
        const all = await db.transactions
            .where('user_id').equals(user_id)
            .filter((t) => t.is_deleted === 0)
            .toArray();

        return all
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .slice(0, limit);
    },

    async create(data: Omit<Transaction, 'id'>): Promise<string> {
        const transaction: Transaction = {
            id: generateUUID(),
            ...data,
            is_deleted: 0,
        };
        await db.transactions.add(transaction);
        return transaction.id;
    },

    async update(id: string, data: Partial<Omit<Transaction, 'id'>>): Promise<void> {
        await db.transactions.update(id, data);
    },

    // Мягкое удаление
    async softDelete(id: string): Promise<void> {
        await db.transactions.update(id, {
            is_deleted: 1,
            is_synced: 0,
            updated_at: new Date().toISOString(),
        });
    },

    // Жёсткое удаление — только после синхронизации
    async hardDelete(id: string): Promise<void> {
        await db.transactions.delete(id);
    },

};