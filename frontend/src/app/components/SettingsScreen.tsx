import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { ArrowLeft, User, Bell, Globe, Moon, Sun, HelpCircle, Info, Star, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { toast } from "sonner";

export function SettingsScreen() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("ru");
  const [currency, setCurrency] = useState("RUB");
  const [notifications, setNotifications] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteAccount = () => {
    toast.success("Аккаунт удалён");
    setDeleteDialogOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen pb-6 bg-[#e8f5e9]">
      {/* Header */}
      <div className="bg-[#e8f5e9] text-green-900 p-6 pb-8">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-green-900 hover:bg-green-100 rounded-xl bg-[#e8f5e9]"
            style={{ boxShadow: 'var(--shadow-neu-flat)' }}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold">Настройки</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-6 mt-4">
        {/* Account Settings */}
        <Card 
          className="border-0 bg-[#e8f5e9]"
          style={{ boxShadow: 'var(--shadow-neu-raised)' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <User className="w-5 h-5" />
              Настройки аккаунта
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Profile */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback 
                  className="bg-green-600 text-white text-2xl"
                  style={{ boxShadow: 'var(--shadow-neu-raised)' }}
                >
                  ИП
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Button 
                  variant="outline" 
                  className="rounded-xl border-0 bg-[#e8f5e9] text-green-900"
                  style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                >
                  Изменить фото
                </Button>
              </div>
            </div>

            <Separator className="bg-green-200" />

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-green-900">Имя пользователя</Label>
              <Input
                id="username"
                type="text"
                defaultValue="ivan_petrov"
                className="rounded-xl border-0 bg-[#e8f5e9]"
                style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-900">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="ivan@example.com"
                className="rounded-xl border-0 bg-[#e8f5e9]"
                style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
              />
            </div>

            {/* Change Password */}
            <div>
              <Button 
                variant="outline" 
                className="rounded-xl border-0 bg-[#e8f5e9] text-green-900"
                onClick={() => toast.info("Функция изменения пароля")}
                style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
              >
                Изменить пароль
              </Button>
            </div>

            <Separator className="bg-green-200" />

            {/* Delete Account */}
            <div>
              <Button 
                variant="destructive" 
                className="rounded-xl flex items-center gap-2 border-0 bg-red-500 hover:bg-red-600"
                onClick={() => setDeleteDialogOpen(true)}
                style={{ boxShadow: 'var(--shadow-neu-raised)' }}
              >
                <Trash2 className="w-4 h-4" />
                Удалить аккаунт
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Application Settings */}
        <Card 
          className="border-0 bg-[#e8f5e9]"
          style={{ boxShadow: 'var(--shadow-neu-raised)' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Globe className="w-5 h-5" />
              Настройки приложения
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "light" ? <Sun className="w-5 h-5 text-slate-600" /> : <Moon className="w-5 h-5 text-slate-600" />}
                <div>
                  <Label className="text-base">Тема оформления</Label>
                  <p className="text-sm text-slate-500">Светлая или тёмная тема</p>
                </div>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Светлая</SelectItem>
                  <SelectItem value="dark">Тёмная</SelectItem>
                  <SelectItem value="auto">Авто</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-green-200" />

            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-600" />
                <div>
                  <Label className="text-base">Язык</Label>
                  <p className="text-sm text-slate-500">Язык интерфейса</p>
                </div>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-green-200" />

            {/* Currency */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Валюта</Label>
                <p className="text-sm text-slate-500">Основная валюта</p>
              </div>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-32 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUB">₽ RUB</SelectItem>
                  <SelectItem value="USD">$ USD</SelectItem>
                  <SelectItem value="EUR">€ EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-green-200" />

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-600" />
                <div>
                  <Label className="text-base">Уведомления</Label>
                  <p className="text-sm text-slate-500">Получать уведомления о расходах</p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Support and Information */}
        <Card 
          className="border-0 bg-[#e8f5e9]"
          style={{ boxShadow: 'var(--shadow-neu-raised)' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <HelpCircle className="w-5 h-5" />
              Поддержка и информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="ghost" 
              className="w-full justify-between rounded-xl py-6 bg-[#e8f5e9] text-green-900 border-0"
              onClick={() => toast.info("Центр помощи")}
              style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
            >
              <span className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-green-700" />
                Центр помощи
              </span>
              <span className="text-green-600">→</span>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-between rounded-xl py-6 bg-[#e8f5e9] text-green-900 border-0"
              onClick={() => toast.info("FAQ")}
              style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
            >
              <span className="flex items-center gap-3">
                <Info className="w-5 h-5 text-green-700" />
                Часто задаваемые вопросы
              </span>
              <span className="text-green-600">→</span>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-between rounded-xl py-6 bg-[#e8f5e9] text-green-900 border-0"
              onClick={() => toast.info("О приложении")}
              style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
            >
              <span className="flex items-center gap-3">
                <Info className="w-5 h-5 text-green-700" />
                О приложении
              </span>
              <span className="text-green-600">→</span>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-between rounded-xl py-6 bg-[#e8f5e9] text-green-900 border-0"
              onClick={() => toast.success("Спасибо за оценку!")}
              style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
            >
              <span className="flex items-center gap-3">
                <Star className="w-5 h-5 text-green-700" />
                Оценить приложение
              </span>
              <span className="text-green-600">→</span>
            </Button>
          </CardContent>
        </Card>

        {/* App Version */}
        <div className="text-center text-sm text-green-600 pb-6">
          <p>Финансовый менеджер v1.0.0</p>
          <p className="mt-1">© 2026 Все права защищены</p>
        </div>

        {/* Logout Button */}
        <div className="flex justify-center pb-6">
          <Button
            onClick={() => {
              toast.success("Вы вышли из аккаунта");
              navigate("/");
            }}
            className="bg-red-500 hover:bg-red-600 text-white py-6 px-8 rounded-xl border-0"
            style={{ boxShadow: 'var(--shadow-neu-raised)' }}
          >
            Выход из аккаунта
          </Button>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-600">Удалить аккаунт?</DialogTitle>
            <DialogDescription className="pt-4">
              Это действие нельзя отменить. Все ваши данные, операции и статистика будут безвозвратно удалены.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="rounded-xl flex-1"
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="rounded-xl flex-1"
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}