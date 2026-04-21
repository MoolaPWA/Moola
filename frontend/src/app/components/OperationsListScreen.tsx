import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { ArrowLeft, Filter, Search, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";

interface Operation {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: string;
  categoryIcon: string;
  date: string;
  type: "income" | "expense";
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  limit?: number;
}

export function OperationsListScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  
  // Category management states
  const [categories, setCategories] = useState<Category[]>([
    { id: "food", name: "Продукты", icon: "🛒", color: "bg-blue-100", description: "Еда и напитки", limit: 15000 },
    { id: "transport", name: "Транспорт", icon: "🚗", color: "bg-purple-100", description: "Общественный транспорт, такси, бензин" },
    { id: "entertainment", name: "Развлечения", icon: "🎮", color: "bg-pink-100", description: "Кино, игры, хобби" },
    { id: "health", name: "Здоровье", icon: "💊", color: "bg-red-100", description: "Медицина и аптеки" },
    { id: "education", name: "Образование", icon: "📚", color: "bg-yellow-100", description: "Курсы, книги, обучение" },
    { id: "shopping", name: "Покупки", icon: "🛍️", color: "bg-green-100", description: "Одежда и товары" },
    { id: "salary", name: "Зарплата", icon: "💰", color: "bg-emerald-100", description: "Основной доход" },
    { id: "other", name: "Другое", icon: "📝", color: "bg-slate-100", description: "Прочие расходы" },
  ]);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    icon: "",
    description: "",
    limit: "",
  });

  const operations: Operation[] = [
    { id: "1", name: "Зарплата", description: "Месячная зарплата", amount: 70000, category: "Зарплата", categoryIcon: "💰", date: "2026-03-15", type: "income" },
    { id: "2", name: "Продукты в Пятёрочке", description: "Недельные продукты", amount: -3250, category: "Продукты", categoryIcon: "🛒", date: "2026-03-16", type: "expense" },
    { id: "3", name: "Транспорт", description: "Пополнение проездного", amount: -850, category: "Транспорт", categoryIcon: "🚗", date: "2026-03-15", type: "expense" },
    { id: "4", name: "Кино", description: "Билеты на премьеру", amount: -1200, category: "Развлечения", categoryIcon: "🎮", date: "2026-03-14", type: "expense" },
    { id: "5", name: "Аптека", description: "Лекарства и витамины", amount: -2400, category: "Здоровье", categoryIcon: "💊", date: "2026-03-13", type: "expense" },
    { id: "6", name: "Онлайн-курс", description: "Курс по программированию", amount: -5000, category: "Образование", categoryIcon: "📚", date: "2026-03-12", type: "expense" },
    { id: "7", name: "Новая одежда", description: "Покупки в H&M", amount: -4500, category: "Покупки", categoryIcon: "🛍️", date: "2026-03-11", type: "expense" },
    { id: "8", name: "Фриланс проект", description: "Оплата за веб-разработку", amount: 15000, category: "Зарплата", categoryIcon: "💰", date: "2026-03-10", type: "income" },
    { id: "9", name: "Ресторан", description: "Ужин с семьёй", amount: -3800, category: "Развлечения", categoryIcon: "🎮", date: "2026-03-09", type: "expense" },
    { id: "10", name: "Бензин", description: "Заправка полного бака", amount: -2500, category: "Транспорт", categoryIcon: "🚗", date: "2026-03-08", type: "expense" },
  ];

  const filteredOperations = operations.filter((op) => {
    const matchesSearch = op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         op.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || op.type === filterType;
    const matchesCategory = filterCategory === "all" || op.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const categoryNames = [...new Set(operations.map(op => op.category))];

  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        icon: category.icon,
        description: category.description || "",
        limit: category.limit?.toString() || "",
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({ name: "", icon: "", description: "", limit: "" });
    }
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (editingCategory) {
      toast.success("Категория обновлена!");
    } else {
      toast.success("Категория создана!");
    }
    setIsCategoryDialogOpen(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    toast.success("Категория удалена!");
  };

  return (
    <div className="min-h-screen pb-6 bg-[#e8f5e9]">
      {/* Header */}
      <div className="bg-[#e8f5e9] text-green-900 p-6 pb-8">
        <div className="max-w-4xl mx-auto">
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
            <h1 className="text-2xl font-bold">Список операций</h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
            <Input
              type="text"
              placeholder="Поиск операций..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 rounded-xl bg-[#e8f5e9] border-0 text-green-900 placeholder:text-green-600"
              style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-6 mt-4">
        <Tabs defaultValue="operations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#e8f5e9] p-1 rounded-2xl" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
            <TabsTrigger value="operations" className="rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Операции
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Настройка категорий
            </TabsTrigger>
          </TabsList>

          <TabsContent value="operations" className="space-y-4 mt-6">
            {/* Filters */}
            <Card 
              className="border-0 bg-[#e8f5e9]"
              style={{ boxShadow: 'var(--shadow-neu-raised)' }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-green-700" />
                  <span className="text-sm font-medium text-green-900">Фильтры</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="rounded-xl border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все операции</SelectItem>
                      <SelectItem value="income">Доходы</SelectItem>
                      <SelectItem value="expense">Расходы</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="rounded-xl border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все категории</SelectItem>
                      {categoryNames.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Operations List */}
            <div className="space-y-3">
              {filteredOperations.map((operation) => (
                <Card
                  key={operation.id}
                  className="border-0 cursor-pointer hover:opacity-90 transition-opacity bg-[#e8f5e9]"
                  onClick={() => setSelectedOperation(operation)}
                  style={{ boxShadow: 'var(--shadow-neu-flat)' }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{operation.categoryIcon}</div>
                        <div>
                          <div className="font-semibold text-green-900">{operation.name}</div>
                          <div className="text-sm text-green-700">{operation.category}</div>
                          <div className="text-xs text-green-600 mt-1">
                            {new Date(operation.date).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${operation.type === 'income' ? 'text-green-600' : 'text-green-900'}`}>
                          {operation.amount > 0 ? '+' : ''}{operation.amount.toLocaleString('ru-RU')} ₽
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                          operation.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {operation.type === 'income' ? 'Доход' : 'Расход'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredOperations.length === 0 && (
              <Card 
                className="border-0 bg-[#e8f5e9]"
                style={{ boxShadow: 'var(--shadow-neu-raised)' }}
              >
                <CardContent className="p-12 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <div className="text-green-700">Операции не найдены</div>
                  <div className="text-sm text-green-600 mt-2">Попробуйте изменить фильтры</div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 mt-6">
            {/* Add New Category Button - First Row */}
            <Card
              className="border-0 cursor-pointer hover:opacity-90 transition-opacity bg-[#e8f5e9]"
              onClick={() => handleOpenCategoryDialog()}
              style={{ boxShadow: 'var(--shadow-neu-flat)' }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-3">
                  <div 
                    className="bg-green-600 p-2 rounded-full"
                    style={{ boxShadow: 'var(--shadow-neu-raised)' }}
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-green-900 font-semibold">Добавить новую категорию</span>
                </div>
              </CardContent>
            </Card>

            {/* Category List */}
            <div className="space-y-3">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="border-0 cursor-pointer hover:opacity-90 transition-opacity bg-[#e8f5e9]"
                  onClick={() => handleOpenCategoryDialog(category)}
                  style={{ boxShadow: 'var(--shadow-neu-flat)' }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{category.icon}</div>
                        <div>
                          <div className="font-semibold text-green-900">{category.name}</div>
                          <div className="text-sm text-green-700">{category.description}</div>
                          <div className="text-xs text-green-600 mt-1">
                            Лимит: {category.limit ? category.limit.toLocaleString('ru-RU') + ' ₽' : 'Не установлен'}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        className="text-red-500 hover:bg-red-100 rounded-xl bg-[#e8f5e9]"
                        style={{ boxShadow: 'var(--shadow-neu-flat)' }}
                      >
                        <Trash2 className="w-6 h-6" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Category Detail Dialog */}
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-green-900">
                    <span className="text-3xl">{categoryFormData.icon || "📝"}</span>
                    <span>{editingCategory ? "Редактировать категорию" : "Добавить категорию"}</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-green-900">Название</Label>
                    <Input
                      type="text"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      placeholder="Например: Продукты"
                      className="rounded-xl border-0 bg-[#e8f5e9]"
                      style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-green-900">Иконка (эмодзи)</Label>
                    <Input
                      type="text"
                      value={categoryFormData.icon}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                      placeholder="🛒"
                      className="rounded-xl border-0 bg-[#e8f5e9] text-2xl"
                      style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-green-900">Описание</Label>
                    <Input
                      type="text"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                      placeholder="Краткое описание категории"
                      className="rounded-xl border-0 bg-[#e8f5e9]"
                      style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-green-900">Лимит (₽)</Label>
                    <Input
                      type="number"
                      value={categoryFormData.limit}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, limit: e.target.value })}
                      placeholder="15000"
                      className="rounded-xl border-0 bg-[#e8f5e9]"
                      style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                    />
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCategoryDialogOpen(false)}
                    className="rounded-xl border-0 bg-[#e8f5e9] text-green-900"
                    style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleSaveCategory}
                    className="rounded-xl bg-green-600 hover:bg-green-700 text-white border-0"
                    style={{ boxShadow: 'var(--shadow-neu-raised)' }}
                  >
                    Сохранить
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>

      {/* Operation Detail Dialog */}
      <Dialog open={!!selectedOperation} onOpenChange={(open) => !open && setSelectedOperation(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{selectedOperation?.categoryIcon}</span>
              <span>{selectedOperation?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-base pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Категория:</span>
                <span className="font-medium text-slate-900">{selectedOperation?.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Сумма:</span>
                <span className={`text-xl font-bold ${selectedOperation?.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                  {selectedOperation?.amount && (selectedOperation.amount > 0 ? '+' : '')}{selectedOperation?.amount.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Дата:</span>
                <span className="font-medium text-slate-900">
                  {selectedOperation && new Date(selectedOperation.date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              {selectedOperation?.description && (
                <div className="pt-3 border-t">
                  <div className="text-slate-600 mb-2">Описание:</div>
                  <div className="text-slate-900">{selectedOperation.description}</div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}