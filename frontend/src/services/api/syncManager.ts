import { db } from '@/db/database';
import { syncTransactions } from './transactions';
import { fetchCategories, createCategory } from './categories';

/**
 * Результат синхронизации.
 */
export interface SyncResult {
    pushed: number;   // отправлено локальных изменений
    pulled: number;   // получено с сервера
}

/**
 * Полная синхронизация транзакций.
 *
 * 1. Push — собираем несинхронизированные локальные транзакции (is_synced=0)
 * 2. Отправляем на сервер, получаем актуальное состояние
 * 3. Pull — перезаписываем локальную БД данными с сервера
 *
 * Сервер разрешает конфликты по updated_at, клиент принимает ответ как истину.
 */
export async function syncAllTransactions(): Promise<SyncResult> {
    // 1. Собираем несинхронизированные (включая удалённые is_deleted=1)
    const unsynced = await db.transactions
        .where('is_synced').equals(0)
        .toArray();

    // 2. Отправляем на сервер и получаем актуальное состояние
    const serverTransactions = await syncTransactions(unsynced);

    // 3. Атомарно перезаписываем локальную БД
    await db.transaction('rw', db.transactions, async () => {
        // Удаляем локальные транзакции которые были помечены is_deleted и успешно ушли
        const deletedIds = unsynced
            .filter((t) => t.is_deleted === 1)
            .map((t) => t.id);

        for (const id of deletedIds) {
            await db.transactions.delete(id);
        }

        // Записываем актуальные данные с сервера (is_synced=1)
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
 * Отправляет локальные категории которых нет на сервере, затем подтягивает актуальные.
 */
export async function syncAllCategories(): Promise<number> {
    // 1. Берём актуальные категории с сервера
    const serverCategories = await fetchCategories();
    const serverIds = new Set(serverCategories.map((c) => c.id));

    // 2. Находим локальные категории которых нет на сервере
    const localCategories = await db.categories
        .filter((c) => c.is_deleted === 0)
        .toArray();

    const toPush = localCategories.filter((c) => !serverIds.has(c.id));

    // 3. Отправляем недостающие категории на сервер
    for (const category of toPush) {
        try {
            const created = await createCategory(category);
            // Сервер мог вернуть другой id — обновляем локально
            await db.transaction('rw', db.categories, db.transactions, async () => {
                if (created.id !== category.id) {
                    // Перепривязываем транзакции на новый id категории
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

    // 4. Записываем серверные категории локально
    await db.transaction('rw', db.categories, async () => {
        for (const c of serverCategories) {
            await db.categories.put(c);
        }
    });

    return serverCategories.length + toPush.length;
}