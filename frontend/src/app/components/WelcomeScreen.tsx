import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Wallet, TrendingUp, PieChart, Shield } from "lucide-react";

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#e8f5e9]">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo and Icon */}
        <div className="flex justify-center">
          <div 
            className="bg-[#e8f5e9] p-6 rounded-3xl" 
            style={{ boxShadow: 'var(--shadow-neu-raised)' }}
          >
            <Wallet className="w-16 h-16 text-green-600" />
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-green-900">
            Управляйте финансами легко
          </h1>
          <p className="text-lg text-green-700">
            Отслеживайте расходы, контролируйте бюджет и принимайте правильные финансовые решения
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 py-6">
          <div className="flex flex-col items-center space-y-2">
            <div 
              className="bg-[#e8f5e9] p-3 rounded-2xl"
              style={{ boxShadow: 'var(--shadow-neu-flat)' }}
            >
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-800">Аналитика</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div 
              className="bg-[#e8f5e9] p-3 rounded-2xl"
              style={{ boxShadow: 'var(--shadow-neu-flat)' }}
            >
              <PieChart className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-800">Статистика</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div 
              className="bg-[#e8f5e9] p-3 rounded-2xl"
              style={{ boxShadow: 'var(--shadow-neu-flat)' }}
            >
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-800">Безопасность</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 pt-4">
          <Button 
            onClick={() => navigate("/signup")}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-2xl"
            style={{ boxShadow: 'var(--shadow-neu-raised)' }}
          >
            Зарегистрироваться
          </Button>
          <Button 
            onClick={() => navigate("/login")}
            variant="outline"
            className="w-full py-6 text-lg rounded-2xl border-0 bg-[#e8f5e9] text-green-900"
            style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
          >
            Войти
          </Button>
        </div>

        <p className="text-sm text-green-600 pt-4">
          Начните управлять своими финансами уже сегодня
        </p>
      </div>
    </div>
  );
}