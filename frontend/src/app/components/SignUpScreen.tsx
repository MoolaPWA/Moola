import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { register } from "@/services/api/auth";
import type { ApiError } from "@/types/auth";

export function SignUpScreen() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Локальная валидация — пароли совпадают
    if (formData.password !== formData.confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    // Минимальная длина пароля (по Swagger pattern "stringst" — 8 символов)
    if (formData.password.length < 8) {
      toast.error("Пароль должен быть не менее 8 символов");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.success("Аккаунт создан!");
      navigate("/dashboard");
    } catch (err) {
      const error = err as ApiError;
      if (error.kind === 'network') {
        toast.error("Нет соединения с сервером");
      } else if (error.kind === 'validation') {
        toast.error("Проверьте правильность введённых данных");
      } else {
        toast.error("Не удалось создать аккаунт");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#e8f5e9]">
        <div className="max-w-md w-full space-y-6">
          <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-green-700 bg-[#e8f5e9] rounded-xl"
              style={{ boxShadow: 'var(--shadow-neu-flat)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>

          <Card className="border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-raised)' }}>
            <CardHeader className="space-y-1 text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-[#e8f5e9] p-4 rounded-2xl" style={{ boxShadow: 'var(--shadow-neu-raised)' }}>
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
                  <Label htmlFor="name" className="text-green-900">Имя</Label>
                  <Input
                      id="name"
                      type="text"
                      placeholder="Ваше имя"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="rounded-xl py-6 border-0 bg-[#e8f5e9]"
                      style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-green-900">Email</Label>
                  <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      placeholder="Минимум 8 символов"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
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
                  <Label htmlFor="agree" className="text-sm text-green-700 cursor-pointer">
                    Я согласен с обработкой персональных данных
                  </Label>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-xl border-0"
                    style={{ boxShadow: 'var(--shadow-neu-raised)' }}
                    disabled={!formData.agree || isLoading}
                >
                  {isLoading ? "Создание..." : "Зарегистрироваться"}
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