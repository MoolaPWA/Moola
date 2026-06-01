import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plus, List, Settings, TrendingUp, Wallet, BarChart3 } from "lucide-react";
import { transactionService } from "@/db/services/transactionService";
import type { Transaction } from "@/db/database";

const TEMP_USER_ID = "temp-user-1";

export function DashboardScreen() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Если событие уже было — берём сразу
    if (window.__installPrompt) {
      setInstallPrompt(window.__installPrompt);
      setShowInstallButton(true);
      return;
    }

    // Иначе ждём
    const handler = () => {
      setInstallPrompt(window.__installPrompt);
      setShowInstallButton(true);
    };

    window.addEventListener('installpromptready', handler);
    return () => window.removeEventListener('installpromptready', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowInstallButton(false);
    }
  };

  const navigate = useNavigate();
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await transactionService.getLatest(TEMP_USER_ID, 3);
        setLatestTransactions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Скелетон строки
  const SkeletonRow = () => (
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#e8f5e9] animate-pulse"
           style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-200" />
          <div className="space-y-2">
            <div className="h-4 bg-green-200 rounded w-24" />
            <div className="h-3 bg-green-200 rounded w-16" />
          </div>
        </div>
        <div className="h-5 bg-green-200 rounded w-20" />
      </div>
  );

  return (
      <div className="min-h-screen pb-6 bg-[#e8f5e9]">
        {/* Header — без изменений */}
        <div className="bg-[#e8f5e9] text-green-900 p-6 pb-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#e8f5e9] p-3 rounded-2xl" style={{ boxShadow: 'var(--shadow-neu-flat)' }}>
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Moola</h1>
                <p className="text-green-600 text-sm">Добро пожаловать!</p>
              </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/settings")}
                className="text-green-900 hover:bg-green-100 rounded-xl bg-[#e8f5e9]"
                style={{ boxShadow: 'var(--shadow-neu-flat)' }}
            >
              <Settings className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 space-y-6 mt-4">
          {/* Balance Card — без изменений */}
          <Card className="border-0 bg-[#e8f5e9] overflow-hidden" style={{ boxShadow: 'var(--shadow-neu-raised)' }}>
            <CardHeader className="relative">
              <CardTitle className="text-sm text-green-700 font-normal">
                Доступно к расходу в этом месяце
              </CardTitle>
            </CardHeader>
            <CardContent className="relative pb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-green-900">45 750</span>
                <span className="text-2xl text-green-700">₽</span>
              </div>
              <div className="flex items-center gap-2 mt-4 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+12% к прошлому месяцу</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons — без изменений */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
                onClick={() => navigate("/add-operation")}
                className="bg-green-600 hover:bg-green-700 text-white py-8 rounded-2xl flex items-center justify-center gap-3 text-lg border-0"
                style={{ boxShadow: 'var(--shadow-neu-raised)' }}
            >
              <Plus className="w-6 h-6" />
              Новая операция
            </Button>
            <Button
                onClick={() => navigate("/operations")}
                variant="outline"
                className="border-0 bg-[#e8f5e9] text-green-900 hover:bg-green-50 py-8 rounded-2xl flex items-center justify-center gap-3 text-lg"
                style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
            >
              <List className="w-6 h-6" />
              Список операций
            </Button>
          </div>

          {/* Statistics Button — без изменений */}
          <Button
              onClick={() => navigate("/statistics")}
              variant="outline"
              className="w-full border-0 bg-[#e8f5e9] text-green-900 hover:bg-green-50 py-8 rounded-2xl flex items-center justify-center gap-3 text-lg"
              style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
          >
            <BarChart3 className="w-6 h-6" />
            Статистика
          </Button>

          {showInstallButton && (
              <Button
                  onClick={handleInstall}
                  className="w-full border-0 bg-green-600 text-white hover:bg-green-700 py-8 rounded-2xl flex items-center justify-center gap-3 text-lg"
                  style={{ boxShadow: 'var(--shadow-neu-raised)' }}
              >
                📲 Установить приложение
              </Button>
          )}

          {/* Quick Stats — без изменений */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-flat)' }}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">24,5k</div>
                <div className="text-sm text-green-700 mt-1">Расходы</div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-flat)' }}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">70,2k</div>
                <div className="text-sm text-green-700 mt-1">Доходы</div>
              </CardContent>
            </Card>
          </div>

          {/* Последние операции — теперь из БД */}
          <Card className="border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-raised)' }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between text-green-900">
                <span>Последние операции</span>
                <Button
                    variant="ghost"
                    onClick={() => navigate("/operations")}
                    className="text-green-600 hover:text-green-700 text-sm"
                >
                  Все →
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                  // Скелетон пока грузится
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
              ) : latestTransactions.length === 0 ? (
                  <div className="text-center py-6 text-green-600">
                    <div className="text-3xl mb-2">💸</div>
                    <div className="text-sm">Операций пока нет</div>
                  </div>
              ) : (
                  latestTransactions.map((t) => (
                      <div
                          key={t.id}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-green-50 bg-[#e8f5e9]"
                          style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">📝</div>
                          <div>
                            <div className="font-medium text-green-900">
                              {t.description || "Без описания"}
                            </div>
                            <div className="text-sm text-green-600">
                              {new Date(t.transaction_date).toLocaleDateString('ru-RU', {
                                day: 'numeric', month: 'long'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-green-900'}`}>
                          {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}