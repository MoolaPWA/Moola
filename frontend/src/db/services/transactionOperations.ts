import { db } from '../database';
import { categoryService } from './categoryService';
import { transactionService } from './transactionService';
import type { Category, Transaction } from '../database';

// Создать категорию + транзакцию (атомарно)
export async function createCategoryWithTransaction(
    categoryData: Omit<Category, 'id'>,
    transactionData: Omit<Transaction, 'id' | 'category_id'>
): Promise<{ categoryId: string; transactionId: string }> {

    let categoryId!: string;
    let transactionId!: string;

    await db.transaction('rw', [db.categories, db.transactions], async () => {
        categoryId = await categoryService.create(categoryData);

        transactionId = await transactionService.create({
            ...transactionData,
            category_id: categoryId,
        });
    });

    return { categoryId, transactionId };
}

// Удалить категорию вместе со всеми её транзакциями (атомарно)
export async function deleteCategoryWithTransactions(
    categoryId: string
): Promise<void> {

    await db.transaction('rw', [db.categories, db.transactions], async () => {
        // Сначала удаляем все транзакции этой категории
        await db.transactions.where('category_id').equals(categoryId).delete();

        // Затем саму категорию
        await categoryService.delete(categoryId);

        // Если любой из шагов выше упал, то Dexie откатит всё
    });
}

// Обновить транзакцию и сбросить флаг синхронизации (атомарно)
export async function updateTransactionAndMarkUnsynced(
    transactionId: string,
    data: Partial<Omit<Transaction, 'id'>>
): Promise<void> {

    await db.transaction('rw', [db.transactions], async () => {
        await transactionService.update(transactionId, {
            ...data,
            updated_at: new Date().toISOString(),
            is_synced: 0, // После изменения помечаем как несинхронизированную
        });
    });
}

// Пометить список транзакций как синхронизированные (атомарно)
export async function markTransactionsSynced(
    transactionIds: string[]
): Promise<void> {

    await db.transaction('rw', [db.transactions], async () => {

        await db.transactions.where('id').anyOf(transactionIds).modify({ is_synced: 1 });

        // Если хоть одно обновление упало, все откатятся
    });
}