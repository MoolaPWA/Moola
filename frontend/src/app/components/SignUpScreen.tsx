import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function SignUpScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock registration - navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#e8f5e9]">
      <div className="max-w-md w-full space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-green-700 bg-[#e8f5e9] rounded-xl"
          style={{ boxShadow: 'var(--shadow-neu-flat)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Button>

        {/* Registration Card */}
        <Card 
          className="border-0 bg-[#e8f5e9]"
          style={{ boxShadow: 'var(--shadow-neu-raised)' }}
        >
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="flex justify-center mb-4">
              <div 
                className="bg-[#e8f5e9] p-4 rounded-2xl"
                style={{ boxShadow: 'var(--shadow-neu-raised)' }}
              >
                <UserPlus className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl text-green-900">Регистрация</CardTitle>
            <CardDescription className="text-base text-green-700">
              Создайте аккаунт для управления финансами
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-green-900">Имя пользователя</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Введите имя пользователя"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="rounded-xl py-6 border-0 bg-[#e8f5e9]"
                  style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-900">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="rounded-xl py-6 border-0 bg-[#e8f5e9]"
                  style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-green-900">Подтвердите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Повторите пароль"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="rounded-xl py-6 border-0 bg-[#e8f5e9]"
                  style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agree"
                  checked={formData.agree}
                  onCheckedChange={(checked) => setFormData({ ...formData, agree: checked as boolean })}
                />
                <Label 
                  htmlFor="agree" 
                  className="text-sm text-green-700 cursor-pointer"
                >
                  Я согласен с обработкой персональных данных
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-xl border-0"
                style={{ boxShadow: 'var(--shadow-neu-raised)' }}
                disabled={!formData.agree}
              >
                Зарегистрироваться
              </Button>

              <div className="text-center text-sm text-green-700">
                Уже есть аккаунт?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Войти
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}