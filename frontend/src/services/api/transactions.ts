import { apiRequest } from './client';
import {
    toSyncItem,
    fromApiTransaction,
    type ApiTransaction,
    type ApiSyncItem,
} from './mappers';
import type { Transaction } from '@/db/database';

/**
 * Отправляет локальные изменения на сервер и получает актуальное состояние.
 * Сервер разрешает конфликты по updated_at (last-write-wins).
 *
 * @param transactions — локальные транзакции для отправки
 * @returns актуальные транзакции с сервера
 */
export async function syncTransactions(
    transactions: Transaction[]
): Promise<Transaction[]> {
    const items: ApiSyncItem[] = transactions.map(toSyncItem);

    const response = await apiRequest<ApiTransaction[]>('/api/transactions/sync', {
        method: 'POST',
        body: JSON.stringify({ items }),
    });

    return response.map(fromApiTransaction);
}

/**
 * Загружает все транзакции пользователя с сервера.
 */
export async function fetchTransactions(): Promise<Transaction[]> {
    const response = await apiRequest<ApiTransaction[]>('/api/transactions', {
        method: 'GET',
    });

    return response.map(fromApiTransaction);
}