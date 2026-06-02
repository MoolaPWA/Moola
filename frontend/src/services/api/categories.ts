import { apiRequest } from './client';
import {
    toApiCategoryCreate,
    fromApiCategory,
    type ApiCategory,
} from './mappers';
import type { Category } from '@/db/database';

/**
 * Загружает все категории пользователя с сервера.
 */
export async function fetchCategories(): Promise<Category[]> {
    const response = await apiRequest<ApiCategory[]>('/api/categories', {
        method: 'GET',
    });

    return response.map(fromApiCategory);
}

/**
 * Создаёт категорию на сервере.
 * @returns созданная категория с серверным id
 */
export async function createCategory(category: Category): Promise<Category> {
    const body = toApiCategoryCreate(category);

    const response = await apiRequest<ApiCategory>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(body),
    });

    return fromApiCategory(response);
}

/**
 * Удаляет категорию на сервере.
 */
export async function deleteCategory(categoryId: string): Promise<void> {
    await apiRequest<void>(`/api/categories/${categoryId}`, {
        method: 'DELETE',
    });
}