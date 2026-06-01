import { apiRequest } from './client.ts';
import { tokenStorage } from './tokenStorage.ts';
import type {
    RegisterRequest,
    LoginRequest,
    TokenResponse,
} from '@/types/auth.ts';
import { db } from '@/db/database.ts';

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