import { db } from '@/db/database';
import { syncTransactions, fetchTransactions } from './transactions';
import { fetchCategories } from './categories';

export interface SyncResult {
    pushed: number;
    pulled: number;
}

export async function syncAllTransactions(): Promise<SyncResult> {
    // 1. PUSH — отправляем несинхронизированные
    const unsynced = await db.transactions
        .where('is_synced').equals(0)
        .toArray();

    await syncTransactions(unsynced);

    // 2. PULL — скачиваем актуальное состояние с сервера
    const serverTransactions = await fetchTransactions();

    // 3. Перезаписываем локальную БД
    await db.transaction('rw', db.transactions, async () => {
        // Удаляем локальные что были помечены на удаление и ушли
        const deletedIds = unsynced
            .filter((t) => t.is_deleted === 1)
            .map((t) => t.id);
        for (const id of deletedIds) {
            await db.transactions.delete(id);
        }

        // Записываем всё что пришло с сервера
        for (const t of serverTransactions) {
            await db.transactions.put(t);
        }
    });

    return {
        pushed: unsynced.length,
        pulled: serverTransactions.length,
    };
}

/**
 * Загружает категории с сервера и обновляет локальную БД.
 * Сервер — источник правды: системные категории создаются при регистрации.
 */
export async function syncAllCategories(): Promise<number> {
    const serverCategories = await fetchCategories();

    await db.transaction('rw', db.categories, async () => {
        await db.categories.clear();
        for (const c of serverCategories) {
            await db.categories.put(c);
        }
    });

    return serverCategories.length;
}

/**
 * Полная синхронизация — сначала категории (для FK транзакций), потом транзакции.
 */
export async function syncAll(): Promise<SyncResult> {
    await syncAllCategories();
    return syncAllTransactions();
}