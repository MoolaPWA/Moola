import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Plus, List, Settings, TrendingUp, Wallet, BarChart3 } from "lucide-react";

export function DashboardScreen() {
  const navigate = useNavigate();
  const availableBalance = 45750;

  return (
    <div className="min-h-screen pb-6 bg-[#e8f5e9]">
      {/* Header */}
      <div className="bg-[#e8f5e9] text-green-900 p-6 pb-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="bg-[#e8f5e9] p-3 rounded-2xl"
              style={{ boxShadow: 'var(--shadow-neu-flat)' }}
            >
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
        {/* Main Balance Card */}
        <Card 
          className="border-0 bg-[#e8f5e9] overflow-hidden"
          style={{ boxShadow: 'var(--shadow-neu-raised)' }}
        >
          <CardHeader className="relative">
            <CardTitle className="text-sm text-green-700 font-normal">
              Доступно к расходу в этом месяце
            </CardTitle>
          </CardHeader>
          <CardContent className="relative pb-8">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-green-900">
                {availableBalance.toLocaleString('ru-RU')}
              </span>
              <span className="text-2xl text-green-700">₽</span>
            </div>
            <div className="flex items-center gap-2 mt-4 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+12% к прошлому месяцу</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
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

        {/* Statistics Button - Wide */}
        <Button
          onClick={() => navigate("/statistics")}
          variant="outline"
          className="w-full border-0 bg-[#e8f5e9] text-green-900 hover:bg-green-50 py-8 rounded-2xl flex items-center justify-center gap-3 text-lg"
          style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
        >
          <BarChart3 className="w-6 h-6" />
          Статистика
        </Button>

        {/* Quick Stats - Expenses and Income only */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="border-0 bg-[#e8f5e9]"
            style={{ boxShadow: 'var(--shadow-neu-flat)' }}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">24,5k</div>
              <div className="text-sm text-green-700 mt-1">Расходы</div>
            </CardContent>
          </Card>
          <Card 
            className="border-0 bg-[#e8f5e9]"
            style={{ boxShadow: 'var(--shadow-neu-flat)' }}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">70,2k</div>
              <div className="text-sm text-green-700 mt-1">Доходы</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Operations Preview */}
        <Card 
          className="border-0 bg-[#e8f5e9]"
          style={{ boxShadow: 'var(--shadow-neu-raised)' }}
        >
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
            {[
              { name: "Продукты", category: "🛒", amount: -3250, date: "Сегодня" },
              { name: "Зарплата", category: "💰", amount: 70000, date: "Вчера" },
              { name: "Транспорт", category: "🚗", amount: -850, date: "15 марта" },
            ].map((op, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-green-50 bg-[#e8f5e9]"
                style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{op.category}</div>
                  <div>
                    <div className="font-medium text-green-900">{op.name}</div>
                    <div className="text-sm text-green-600">{op.date}</div>
                  </div>
                </div>
                <div className={`font-semibold ${op.amount > 0 ? 'text-green-600' : 'text-green-900'}`}>
                  {op.amount > 0 ? '+' : ''}{op.amount.toLocaleString('ru-RU')} ₽
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}