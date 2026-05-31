import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, LogIn } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { login } from "@/services/api/auth";
import type { ApiError } from "@/types/auth";
import { useSync } from "@/hooks/useSync";

export function LoginScreen() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const { sync } = useSync();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      await sync(true);

      toast.success("Добро пожаловать!");
      navigate("/dashboard");
    } catch (err) {
      const error = err as ApiError;
      if (error.kind === 'network') {
        toast.error("Нет соединения с сервером");
      } else if (error.kind === 'unauthorized') {
        toast.error("Неверный email или пароль");
      } else if (error.kind === 'validation') {
        toast.error("Проверьте правильность введённых данных");
      } else {
        toast.error("Не удалось войти");
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
                  <LogIn className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-3xl text-green-900">Вход</CardTitle>
              <CardDescription className="text-base text-green-700">
                Войдите в свой аккаунт
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
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
                      placeholder="Введите пароль"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="rounded-xl py-6 border-0 bg-[#e8f5e9]"
                      style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                        id="remember"
                        checked={formData.remember}
                        onCheckedChange={(checked) => setFormData({ ...formData, remember: checked as boolean })}
                    />
                    <Label htmlFor="remember" className="text-sm text-green-700 cursor-pointer">
                      Запомнить меня
                    </Label>
                  </div>
                  <button type="button" className="text-sm text-green-600 hover:text-green-700 font-medium">
                    Забыли пароль?
                  </button>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-xl border-0"
                    style={{ boxShadow: 'var(--shadow-neu-raised)' }}
                >
                  {isLoading ? "Вход..." : "Войти"}
                </Button>

                <div className="text-center text-sm text-green-700">
                  Нет аккаунта?{" "}
                  <button
                      type="button"
                      onClick={() => navigate("/signup")}
                      className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Зарегистрироваться
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}