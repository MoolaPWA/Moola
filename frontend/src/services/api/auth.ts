import { apiRequest } from './client.ts';
import { tokenStorage } from './tokenStorage.ts';
import type {
    RegisterRequest,
    LoginRequest,
    TokenResponse,
} from '@/types/auth.ts';
import { db } from '@/db/database.ts';

/**
 * Данные текущего пользователя с сервера.
 */
export interface CurrentUser {
    id: string;
    name: string;
    email: string;
}

/**
 * Получает профиль текущего пользователя.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
    return apiRequest<CurrentUser>('/api/users/me', { method: 'GET' });
}

/**
 * Регистрирует нового пользователя.
 * Сервер возвращает пару токенов — сразу сохраняем.
 */
export async function register(payload: RegisterRequest): Promise<TokenResponse> {
    const data = await apiRequest<TokenResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    tokenStorage.setAccessToken(data.access_token);
    await tokenStorage.setRefreshToken(data.refresh_token);

    // Сохраняем user_id
    const user = await getCurrentUser();
    tokenStorage.setUserId(user.id);

    return data;
}

/**
 * Авторизует пользователя по email и паролю.
 * Сервер возвращает пару токенов — сразу сохраняем.
 */
export async function login(payload: LoginRequest): Promise<TokenResponse> {
    const data = await apiRequest<TokenResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    tokenStorage.setAccessToken(data.access_token);
    await tokenStorage.setRefreshToken(data.refresh_token);

    const user = await getCurrentUser();
    tokenStorage.setUserId(user.id);

    return data;
}

/**
 * Выполняет логаут — вызывает серверный /logout, чистит токены и локальные данные.
 */
export async function logout(): Promise<void> {
    try {
        await apiRequest<void>('/api/auth/logout', { method: 'POST' });
    } catch {
        // Даже если сервер недоступен — продолжаем локальную очистку
    }

    await tokenStorage.clear();

    // Очищаем локальные данные пользователя
    await db.transactions.clear();
    await db.categories.clear();
    await db.users.clear();
}

/**
 * Проверяет, есть ли сохранённый refresh-токен.
 * Используется при старте приложения для восстановления сессии.
 */
export async function hasSession(): Promise<boolean> {
    const token = await tokenStorage.getRefreshToken();
    return token !== null;
}