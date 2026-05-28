/**
 * Тело запроса для регистрации.
 */
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

/**
 * Тело запроса для входа.
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Тело запроса для обновления токенов.
 */
export interface RefreshRequest {
    refresh_token: string;
}

/**
 * Ответ от сервера с парой токенов.
 * Возвращается из /auth/register, /auth/login, /auth/refresh.
 */
export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: 'bearer';
}

/**
 * Ошибка валидации от FastAPI (HTTP 422).
 */
export interface ValidationErrorResponse {
    detail: Array<{
        loc: (string | number)[];
        msg: string;
        type: string;
        input?: unknown;
        ctx?: Record<string, unknown>;
    }>;
}

/**
 * Типы ошибок API для строгой обработки в UI.
 */
export type ApiError =
    | { kind: 'network'; message: string }
    | { kind: 'validation'; message: string; details?: ValidationErrorResponse['detail'] }
    | { kind: 'unauthorized'; message: string }
    | { kind: 'forbidden'; message: string }
    | { kind: 'server'; message: string; status: number };