import { tokenStorage } from './tokenStorage.ts';
import type { ApiError, TokenResponse } from '@/types/auth.ts';

const BASE_URL = '';

// Эндпоинты которые не требуют access-токен в заголовке
const PUBLIC_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];

// Флаг и очередь для предотвращения множественных одновременных refresh
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

/**
 * Обрабатывает refresh всех ожидающих запросов после успешного обновления токена.
 */
function processQueue(token: string | null): void {
    refreshQueue.forEach((cb) => cb(token));
    refreshQueue = [];
}

/**
 * Принудительный логаут — очищает токены и редиректит на /login.
 */
async function forceLogout(): Promise<void> {
    await tokenStorage.clear();
    window.location.href = '/login';
}

/**
 * Парсит ответ сервера в типизированную ошибку API.
 */
async function parseError(response: Response): Promise<ApiError> {
    let body: unknown = null;
    try {
        body = await response.json();
    } catch {
        // ignore — тело может быть пустым
    }

    const message = (body as { detail?: string })?.detail ?? `HTTP ${response.status}`;

    if (response.status === 422 || response.status === 400) {
        return {
            kind: 'validation',
            message,
            details: (body as { detail?: ApiError extends { details: infer D } ? D : never })?.detail as never,
        };
    }
    if (response.status === 401) {
        return { kind: 'unauthorized', message };
    }
    if (response.status === 403) {
        return { kind: 'forbidden', message };
    }
    return { kind: 'server', message, status: response.status };
}

/**
 * Обновляет пару токенов через /api/auth/refresh.
 * Возвращает новый access-токен или null при провале.
 */
async function refreshTokens(): Promise<string | null> {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) return null;

        const data: TokenResponse = await response.json();
        tokenStorage.setAccessToken(data.access_token);
        await tokenStorage.setRefreshToken(data.refresh_token);
        return data.access_token;
    } catch {
        return null;
    }
}

/**
 * Базовый HTTP-клиент с автоматической подстановкой access-токена
 * и бесшовным обновлением токенов при получении 401.
 *
 * @param endpoint — путь эндпоинта (например '/api/users/me')
 * @param options — опции fetch (method, body, headers)
 * @throws ApiError при любой ошибке (network, validation, unauthorized, server)
 */
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const isPublic = PUBLIC_ENDPOINTS.includes(endpoint);

    // Готовим заголовки
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    // Подставляем access-токен только для защищённых эндпоинтов
    if (!isPublic) {
        const token = tokenStorage.getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    let response: Response;
    try {
        response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    } catch {
        const error: ApiError = { kind: 'network', message: 'Нет соединения с сервером' };
        throw error;
    }

    // Успешный ответ — возвращаем данные
    if (response.ok) {
        return response.json() as Promise<T>;
    }

    // 401 на публичном эндпоинте — обычная ошибка логина/пароля
    if (response.status === 401 && isPublic) {
        throw await parseError(response);
    }

    // 401 на защищённом эндпоинте — пробуем обновить токены
    if (response.status === 401 && !isPublic) {
        // Если refresh уже идёт — встаём в очередь
        if (isRefreshing) {
            const newToken = await new Promise<string | null>((resolve) => {
                refreshQueue.push(resolve);
            });
            if (!newToken) throw await parseError(response);
            // Повторяем исходный запрос с новым токеном
            return apiRequest<T>(endpoint, options);
        }

        isRefreshing = true;
        const newToken = await refreshTokens();
        isRefreshing = false;
        processQueue(newToken);

        if (!newToken) {
            await forceLogout();
            throw await parseError(response);
        }

        // Повторяем исходный запрос с новым токеном
        return apiRequest<T>(endpoint, options);
    }

    // Любая другая ошибка
    throw await parseError(response);
}