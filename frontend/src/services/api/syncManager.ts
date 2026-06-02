import { db } from '@/db/database';
import { syncTransactions, fetchTransactions } from './transactions';
import { fetchCategories, createCategory, deleteCategory } from './categories';

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
    // 0. PUSH удалений — категории помеченные is_deleted=1 удаляем на сервере
    const deletedLocal = await db.categories
        .filter((c) => c.is_deleted === 1)
        .toArray();

    for (const category of deletedLocal) {
        try {
            await deleteCategory(category.id);
        } catch (e) {
            console.error('Не удалось удалить категорию на сервере', category.name, e);
        }
        // Физически убираем локально независимо от результата
        await db.categories.delete(category.id);
    }

    // 1. Берём актуальные категории с сервера
    const serverCategories = await fetchCategories();
    const serverIds = new Set(serverCategories.map((c) => c.id));

    // 2. Локальные категории которых нет на сервере (новые)
    const localCategories = await db.categories
        .filter((c) => c.is_deleted === 0)
        .toArray();

    const toPush = localCategories.filter((c) => !serverIds.has(c.id));

    // 3. Отправляем новые категории на сервер
    for (const category of toPush) {
        try {
            const created = await createCategory(category);
            await db.transaction('rw', db.categories, db.transactions, async () => {
                if (created.id !== category.id) {
                    await db.transactions
                        .where('category_id').equals(category.id)
                        .modify({ category_id: created.id });
                    await db.categories.delete(category.id);
                }
                await db.categories.put(created);
            });
        } catch (e) {
            console.error('Не удалось отправить категорию', category.name, e);
        }
    }

    // 4. Подтягиваем финальный список с сервера
    const finalCategories = await fetchCategories();
    await db.transaction('rw', db.categories, async () => {
        await db.categories.clear();
        for (const c of finalCategories) {
            await db.categories.put(c);
        }
    });

    return finalCategories.length;
}

/**
 * Полная синхронизация — сначала категории (для FK транзакций), потом транзакции.
 */
export async function syncAll(): Promise<SyncResult> {
    await syncAllCategories();
    return syncAllTransactions();
}