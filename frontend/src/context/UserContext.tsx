import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getCurrentUser } from '@/services/api/auth';
import { tokenStorage } from '@/services/api/tokenStorage';

interface UserContextValue {
    userId: string | null;
    setUserId: (id: string | null) => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // При старте — если есть сессия, подтягиваем профиль
    useEffect(() => {
        const init = async () => {
            try {
                const refresh = await tokenStorage.getRefreshToken();
                if (refresh) {
                    const user = await getCurrentUser();
                    setUserId(user.id);
                    tokenStorage.setUserId(user.id);
                }
            } catch {
                // нет сессии или токен истёк — остаёмся без user
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    return (
        <UserContext.Provider value={{ userId, setUserId, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}

/**
 * Хук доступа к id текущего пользователя.
 */
export function useUser(): UserContextValue {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser должен использоваться внутри UserProvider');
    return ctx;
}