import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from "recharts";

export function StatisticsScreen() {
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState("month");

  // Mock data for charts
  const categoryData = [
    { id: "food", name: "Продукты", value: 12500, color: "#10b981" },
    { id: "transport", name: "Транспорт", value: 4200, color: "#3b82f6" },
    { id: "entertainment", name: "Развлечения", value: 6800, color: "#8b5cf6" },
    { id: "health", name: "Здоровье", value: 3500, color: "#ef4444" },
    { id: "education", name: "Образование", value: 5000, color: "#f59e0b" },
    { id: "shopping", name: "Покупки", value: 8900, color: "#ec4899" },
  ];

  const trendData = [
    { id: "oct", month: "Окт", income: 65000, expenses: 38000 },
    { id: "nov", month: "Ноя", income: 72000, expenses: 42000 },
    { id: "dec", month: "Дек", income: 68000, expenses: 45000 },
    { id: "jan", month: "Янв", income: 75000, expenses: 41000 },
    { id: "feb", month: "Фев", income: 70000, expenses: 39000 },
    { id: "mar", month: "Мар", income: 85000, expenses: 40900 },
  ];

  const dailyData = [
    { id: "mon", day: "Пн", amount: 1200 },
    { id: "tue", day: "Вт", amount: 800 },
    { id: "wed", day: "Ср", amount: 2100 },
    { id: "thu", day: "Чт", amount: 950 },
    { id: "fri", day: "Пт", amount: 3400 },
    { id: "sat", day: "Сб", amount: 4200 },
    { id: "sun", day: "Вс", amount: 1800 },
  ];

  const totalIncome = 85000;
  const totalExpenses = 40900;
  const balance = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen pb-6 bg-[#e8f5e9]">
      {/* Header */}
      <div className="bg-[#e8f5e9] text-green-900 p-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-green-900 hover:bg-green-100 rounded-xl bg-[#e8f5e9]"
              style={{ boxShadow: 'var(--shadow-neu-flat)' }}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold">Статистика</h1>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-green-700" />
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="bg-[#e8f5e9] border-0 text-green-900 rounded-xl w-48" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">День</SelectItem>
                <SelectItem value="week">Неделя</SelectItem>
                <SelectItem value="month">Месяц</SelectItem>
                <SelectItem value="year">Год</SelectItem>
                <SelectItem value="custom">Произвольный период</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-6 mt-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="border-0 bg-[#e8f5e9]"
            style={{ boxShadow: 'var(--shadow-neu-raised)' }}
          >
            <CardContent className="p-6">
              <div className="text-sm text-green-700 mb-2">Доходы</div>
              <div className="text-3xl font-bold text-green-600">
                +{totalIncome.toLocaleString('ru-RU')} ₽
              </div>
            </CardContent>
          </Card>
          <Card 
            className="border-0 bg-[#e8f5e9]"
            style={{ boxShadow: 'var(--shadow-neu-raised)' }}
          >
            <CardContent className="p-6">
              <div className="text-sm text-red-700 mb-2">Расходы</div>
              <div className="text-3xl font-bold text-red-600">
                -{totalExpenses.toLocaleString('ru-RU')} ₽
              </div>
            </CardContent>
          </Card>
          <Card 
            className="border-0 bg-[#e8f5e9]"
            style={{ boxShadow: 'var(--shadow-neu-raised)' }}
          >
            <CardContent className="p-6">
              <div className="text-sm text-green-700 mb-2">Баланс</div>
              <div className="text-3xl font-bold text-green-900">
                {balance.toLocaleString('ru-RU')} ₽
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts with Tabs */}
        <Tabs defaultValue="pie" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#e8f5e9] p-1 rounded-2xl" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
            <TabsTrigger value="pie" className="rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white">
              По категориям
            </TabsTrigger>
            <TabsTrigger value="bar" className="rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white">
              По дням
            </TabsTrigger>
            <TabsTrigger value="line" className="rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Динамика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pie" className="mt-6">
            <Card 
              className="border-0 bg-[#e8f5e9]"
              style={{ boxShadow: 'var(--shadow-neu-raised)' }}
            >
              <CardHeader>
                <CardTitle className="text-lg text-green-900">Расходы по категориям</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString('ru-RU')} ₽`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {categoryData.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-green-700">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bar" className="mt-6">
            <Card 
              className="border-0 bg-[#e8f5e9]"
              style={{ boxShadow: 'var(--shadow-neu-raised)' }}
            >
              <CardHeader>
                <CardTitle className="text-lg text-green-900">Расходы по дням недели</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#c8e6c9" />
                    <XAxis dataKey="day" stroke="#558b2f" />
                    <YAxis stroke="#558b2f" />
                    <Tooltip 
                      formatter={(value) => `${Number(value).toLocaleString('ru-RU')} ₽`}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="amount" fill="#66bb6a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="line" className="mt-6">
            <Card 
              className="border-0 bg-[#e8f5e9]"
              style={{ boxShadow: 'var(--shadow-neu-raised)' }}
            >
              <CardHeader>
                <CardTitle className="text-lg text-green-900">Динамика доходов и расходов</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#c8e6c9" />
                    <XAxis dataKey="month" stroke="#558b2f" />
                    <YAxis stroke="#558b2f" />
                    <Tooltip 
                      formatter={(value) => `${Number(value).toLocaleString('ru-RU')} ₽`}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Доходы"
                      dot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      name="Расходы"
                      dot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Text Statistics */}
        <Card 
          className="border-0 bg-[#e8f5e9]"
          style={{ boxShadow: 'var(--shadow-neu-raised)' }}
        >
          <CardHeader>
            <CardTitle className="text-lg text-green-900">Текстовая статистика</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className="bg-[#e8f5e9] p-4 rounded-xl"
                style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
              >
                <div className="text-sm text-green-700 mb-1">Средние расходы в день</div>
                <div className="text-2xl font-bold text-green-900">
                  {Math.round(totalExpenses / 30).toLocaleString('ru-RU')} ₽
                </div>
              </div>
              <div 
                className="bg-[#e8f5e9] p-4 rounded-xl"
                style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
              >
                <div className="text-sm text-green-700 mb-1">Самая затратная категория</div>
                <div className="text-2xl font-bold text-green-900">Продукты</div>
              </div>
              <div 
                className="bg-[#e8f5e9] p-4 rounded-xl"
                style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
              >
                <div className="text-sm text-green-700 mb-1">Экономия к прошлому месяцу</div>
                <div className="text-2xl font-bold text-green-600">+8,5%</div>
              </div>
              <div 
                className="bg-[#e8f5e9] p-4 rounded-xl"
                style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
              >
                <div className="text-sm text-green-700 mb-1">Всего операций</div>
                <div className="text-2xl font-bold text-green-900">127</div>
              </div>
            </div>

            <div className="border-t border-green-200 pt-4">
              <div className="text-sm text-green-700 mb-3">Рекомендации</div>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Вы успешно сэкономили на транспорте в этом месяце</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">⚠</span>
                  <span>Расходы на развлечения выросли на 15% по сравнению с прошлым месяцем</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">ℹ</span>
                  <span>Ваш средний баланс превышает целевой показатель на 12%</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}