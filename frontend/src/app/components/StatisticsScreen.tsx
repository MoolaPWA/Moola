import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from "recharts";
import { analyticsService } from "@/db/services/analyticsService";

const TEMP_USER_ID = "temp-user-1";

// Вычисляем from/to по выбранному периоду
function getPeriodDates(period: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0];

  switch (period) {
    case 'day': {
      return { from: to, to };
    }
    case 'week': {
      const from = new Date();
      from.setDate(from.getDate() - 6);
      return { from: from.toISOString().split('T')[0], to };
    }
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: from.toISOString().split('T')[0], to };
    }
    case 'year': {
      const from = new Date(now.getFullYear(), 0, 1);
      return { from: from.toISOString().split('T')[0], to };
    }
    default:
      return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0], to };
  }
}

// Добавь функцию рядом с getPeriodDates
function getPeriodDays(period: string): number {
  switch (period) {
    case 'day': return 1;
    case 'week': return 7;
    case 'month': return new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    case 'year': return 365;
    default: return 30;
  }
}

export function StatisticsScreen() {
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState("month");
  const isMobile = window.innerWidth < 768;

  // Реальные данные из БД
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [topCategory, setTopCategory] = useState('—');
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { from, to } = getPeriodDates(timePeriod);

      const [summary, byCategory, daily, monthly, top] = await Promise.all([
        analyticsService.getSummary(TEMP_USER_ID, from, to),
        analyticsService.getExpensesByCategory(TEMP_USER_ID, from, to),
        analyticsService.getDailyExpenses(TEMP_USER_ID),
        analyticsService.getMonthlyTrend(TEMP_USER_ID),
        analyticsService.getTopCategory(TEMP_USER_ID, from, to),
      ]);

      setTotalIncome(summary.totalIncome);
      setTotalExpenses(summary.totalExpenses);
      setBalance(summary.balance);
      setTotalCount(summary.count);
      setCategoryData(byCategory);
      setDailyData(daily);
      setTrendData(monthly);
      setTopCategory(top);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [timePeriod]);

  // Перезагружаем при смене периода
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Пустое состояние для графиков
  const EmptyChart = () => (
      <div className="flex flex-col items-center justify-center h-[300px] text-green-600">
        <div className="text-4xl mb-3">📊</div>
        <div className="text-sm">Нет данных за выбранный период</div>
      </div>
  );

  // Скелетон для карточек
  const SkeletonCard = () => (
      <div className="animate-pulse">
        <div className="h-8 bg-green-200 rounded w-1/2 mb-2" />
        <div className="h-10 bg-green-200 rounded w-3/4" />
      </div>
  );

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
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 space-y-6 mt-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-raised)' }}>
              <CardContent className="p-6">
                {isLoading ? <SkeletonCard /> : (
                    <>
                      <div className="text-sm text-green-700 mb-2">Доходы</div>
                      <div className="text-3xl font-bold text-green-600">
                        +{totalIncome.toLocaleString('ru-RU')} ₽
                      </div>
                    </>
                )}
              </CardContent>
            </Card>
            <Card className="border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-raised)' }}>
              <CardContent className="p-6">
                {isLoading ? <SkeletonCard /> : (
                    <>
                      <div className="text-sm text-red-700 mb-2">Расходы</div>
                      <div className="text-3xl font-bold text-red-600">
                        -{totalExpenses.toLocaleString('ru-RU')} ₽
                      </div>
                    </>
                )}
              </CardContent>
            </Card>
            <Card className="border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-raised)' }}>
              <CardContent className="p-6">
                {isLoading ? <SkeletonCard /> : (
                    <>
                      <div className="text-sm text-green-700 mb-2">Баланс</div>
                      <div className="text-3xl font-bold text-green-900">
                        {balance.toLocaleString('ru-RU')} ₽
                      </div>
                    </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
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

            {/* PieChart */}
            <TabsContent value="pie" className="mt-6">
              <Card className="border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-raised)' }}>
                <CardHeader>
                  <CardTitle className="text-lg text-green-900">Расходы по категориям</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryData.length === 0 ? <EmptyChart /> : (
                      <>
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={!isMobile}
                                label={isMobile ? undefined : ({ name, percent }) =>
                                    `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={isMobile ? 90 : 80}
                                dataKey="value"
                            >
                              {categoryData.map((entry) => (
                                  <Cell key={entry.id} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${Number(value).toLocaleString('ru-RU')} ₽`} />
                          </PieChart>
                        </ResponsiveContainer>

                        {/* Легенда с процентами — всегда снизу */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {categoryData.map((cat) => {
                            const total = categoryData.reduce((sum, c) => sum + c.value, 0);
                            const percent = total > 0 ? ((cat.value / total) * 100).toFixed(0) : 0;
                            return (
                                <div key={cat.id} className="flex items-center gap-2 text-sm">
                                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                  <span className="text-green-700 truncate">{cat.name}</span>
                                  <span className="text-green-500 ml-auto flex-shrink-0">{percent}%</span>
                                </div>
                            );
                          })}
                        </div>
                      </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* BarChart */}
            <TabsContent value="bar" className="mt-6">
              <Card className="border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-raised)' }}>
                <CardHeader>
                  <CardTitle className="text-lg text-green-900">Расходы по дням (30 дней)</CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyData.every(d => d.amount === 0) ? <EmptyChart /> : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#c8e6c9" />
                          <XAxis dataKey="day" stroke="#558b2f" tick={{ fontSize: 11 }} interval={4} />
                          <YAxis stroke="#558b2f" />
                          <Tooltip
                              formatter={(value) => `${Number(value).toLocaleString('ru-RU')} ₽`}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                          />
                          <Bar dataKey="amount" fill="#66bb6a" radius={[8, 8, 0, 0]} name="Расходы" />
                        </BarChart>
                      </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* LineChart */}
            <TabsContent value="line" className="mt-6">
              <Card className="border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-raised)' }}>
                <CardHeader>
                  <CardTitle className="text-lg text-green-900">Динамика за 6 месяцев</CardTitle>
                </CardHeader>
                <CardContent>
                  {trendData.every(d => d.income === 0 && d.expenses === 0) ? <EmptyChart /> : (
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
                          <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} name="Доходы" dot={{ r: 6 }} />
                          <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} name="Расходы" dot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Text Statistics */}
          <Card className="border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-raised)' }}>
            <CardHeader>
              <CardTitle className="text-lg text-green-900">Текстовая статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#e8f5e9] p-4 rounded-xl" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
                  <div className="text-sm text-green-700 mb-1">Средние расходы в день</div>
                  <div className="text-2xl font-bold text-green-900">
                    {totalExpenses > 0
                        ? Math.round(totalExpenses / getPeriodDays(timePeriod)).toLocaleString('ru-RU')
                        : '0'} ₽
                  </div>
                </div>
                <div className="bg-[#e8f5e9] p-4 rounded-xl" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
                  <div className="text-sm text-green-700 mb-1">Самая затратная категория</div>
                  <div className="text-2xl font-bold text-green-900">{topCategory}</div>
                </div>
                <div className="bg-[#e8f5e9] p-4 rounded-xl" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
                  <div className="text-sm text-green-700 mb-1">Всего операций</div>
                  <div className="text-2xl font-bold text-green-900">{totalCount}</div>
                </div>
                <div className="bg-[#e8f5e9] p-4 rounded-xl" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
                  <div className="text-sm text-green-700 mb-1">Баланс периода</div>
                  <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {balance >= 0 ? '+' : ''}{balance.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}