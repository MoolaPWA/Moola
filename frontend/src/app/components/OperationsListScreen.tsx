import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { ArrowLeft, Filter, Search, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import { transactionService } from "@/db/services/transactionService";
import { categoryService } from "@/db/services/categoryService";
import type { Transaction, Category } from "@/db/database";

const TEMP_USER_ID = "temp-user-1";

export function OperationsListScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedOperation, setSelectedOperation] = useState<Transaction | null>(null);

  // Данные из БД
  const [operations, setOperations] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Состояния загрузки
  const [isLoadingOperations, setIsLoadingOperations] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Фильтры
  const [filterMonth, setFilterMonth] = useState<string>("all");

  // Диалог категорий
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    icon: "",
    type: "expense" as "income" | "expense",
  });

  // Редактирование операции
  const [isEditingOperation, setIsEditingOperation] = useState(false);
  const [editOperationForm, setEditOperationForm] = useState({
    amount: "",
    description: "",
    transaction_date: "",
    category_id: "",
    type: "expense" as "income" | "expense",
  });

  // Загрузка операций из БД
  const loadOperations = async () => {
    setIsLoadingOperations(true);
    try {
      const data = await transactionService.getAllByUser(TEMP_USER_ID);
      // Сортируем по дате — новые сверху
      data.sort((a, b) => b.created_at.localeCompare(a.created_at));
      setOperations(data);
    } catch (error) {
      toast.error("Не удалось загрузить операции");
    } finally {
      setIsLoadingOperations(false);
    }
  };

  // Загрузка категорий из БД
  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const data = await categoryService.getAllByUser(TEMP_USER_ID);
      setCategories(data);
    } catch (error) {
      toast.error("Не удалось загрузить категории");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadOperations();
    loadCategories();
  }, []);

  // Фильтрация операций
  const filteredOperations = useMemo(() => {
    return operations.filter((op) => {
      const matchesSearch = op.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || op.type === filterType;
      const matchesCategory = filterCategory === "all" || op.category_id === filterCategory;
      const matchesMonth = filterMonth === "all" || op.transaction_date.startsWith(filterMonth);
      return matchesSearch && matchesType && matchesCategory && matchesMonth;
    });
  }, [operations, searchQuery, filterType, filterCategory, filterMonth]);

  // Добавить после объявления filteredOperations
  const availableMonths = useMemo(() => {
    const months = new Set(
        operations.map((op) => op.transaction_date.slice(0, 7)) // "2026-03"
    );
    return Array.from(months).sort((a, b) => b.localeCompare(a)); // новые сверху
  }, [operations]);

  // Диалог категории
  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        icon: category.name,
        type: category.type,
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({ name: "", icon: "", type: "expense" });
    }
    setIsCategoryDialogOpen(true);
  };

  const handleSaveOperation = async () => {
    if (!selectedOperation) return;
    try {
      await transactionService.update(selectedOperation.id, {
        amount: Number(editOperationForm.amount),
        description: editOperationForm.description,
        transaction_date: editOperationForm.transaction_date,
        category_id: editOperationForm.category_id,
        type: editOperationForm.type,
        updated_at: new Date().toISOString(),
        is_synced: 0,
      });
      await loadOperations();
      setSelectedOperation(null);
      setIsEditingOperation(false);
      toast.success("Операция обновлена!");
    } catch (error) {
      toast.error("Не удалось обновить операцию");
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, {
          name: categoryFormData.name,
          type: categoryFormData.type,
        });
        toast.success("Категория обновлена!");
      } else {
        await categoryService.create({
          user_id: TEMP_USER_ID,
          name: categoryFormData.name,
          type: categoryFormData.type,
          is_deleted: 0,
        });
        toast.success("Категория создана!");
      }
      await loadCategories();
      setIsCategoryDialogOpen(false);
    } catch (error) {
      toast.error("Не удалось сохранить категорию");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await categoryService.softDelete(categoryId);
      await loadCategories();
      toast.success("Категория удалена!");
    } catch (error) {
      toast.error("Не удалось удалить категорию");
    }
  };

  const handleDeleteOperation = async (operationId: string) => {
    try {
      await transactionService.softDelete(operationId);
      await loadOperations();
      setSelectedOperation(null);
      toast.success("Операция удалена!");
    } catch (error) {
      toast.error("Не удалось удалить операцию");
    }
  };

  // Скелетон для загрузки
  const SkeletonCard = () => (
      <Card className="border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-flat)' }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-green-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-green-200 rounded w-1/3" />
              <div className="h-3 bg-green-200 rounded w-1/4" />
            </div>
            <div className="h-6 bg-green-200 rounded w-20" />
          </div>
        </CardContent>
      </Card>
  );

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
              <Card className="border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-raised)' }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-green-700" />
                    <span className="text-sm font-medium text-green-900">Фильтры</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                    {/* Фильтр по типу — без изменений */}
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

                    {/* Фильтр по категории — без изменений */}
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="rounded-xl border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Фильтр по месяцу — новый */}
                    <Select value={filterMonth} onValueChange={setFilterMonth}>
                      <SelectTrigger className="rounded-xl border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
                        <SelectValue placeholder="Все месяцы" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все месяцы</SelectItem>
                        {availableMonths.map((month) => (
                            <SelectItem key={month} value={month}>
                              {new Date(month + "-01").toLocaleDateString('ru-RU', {
                                month: 'long', year: 'numeric'
                              })}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Operations List */}
              <div className="space-y-3">
                {isLoadingOperations ? (
                    // Скелетон пока грузится
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                ) : filteredOperations.length === 0 ? (
                    <Card className="border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-raised)' }}>
                      <CardContent className="p-12 text-center">
                        <div className="text-4xl mb-4">🔍</div>
                        <div className="text-green-700">Операции не найдены</div>
                        <div className="text-sm text-green-600 mt-2">Попробуйте изменить фильтры</div>
                      </CardContent>
                    </Card>
                ) : (
                    filteredOperations.map((operation) => (
                        <Card
                            key={operation.id}
                            className="border-0 cursor-pointer hover:opacity-90 transition-opacity bg-[#e8f5e9]"
                            onClick={() => setSelectedOperation(operation)}
                            style={{ boxShadow: 'var(--shadow-neu-flat)' }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="text-3xl">
                                  {categories.find(c => c.id === operation.category_id)?.name?.[0] ?? "📝"}
                                </div>
                                <div>
                                  <div className="font-semibold text-green-900">{operation.description || "Без описания"}</div>
                                  <div className="text-sm text-green-700">
                                    {categories.find(c => c.id === operation.category_id)?.name ?? operation.category_id}
                                  </div>
                                  <div className="text-xs text-green-600 mt-1">
                                    {new Date(operation.transaction_date).toLocaleDateString('ru-RU', {
                                      day: 'numeric', month: 'long', year: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-xl font-bold ${operation.type === 'income' ? 'text-green-600' : 'text-green-900'}`}>
                                  {operation.type === 'income' ? '+' : '-'}{operation.amount.toLocaleString('ru-RU')} ₽
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
                    ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4 mt-6">
              <Card
                  className="border-0 cursor-pointer hover:opacity-90 transition-opacity bg-[#e8f5e9]"
                  onClick={() => handleOpenCategoryDialog()}
                  style={{ boxShadow: 'var(--shadow-neu-flat)' }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="bg-green-600 p-2 rounded-full" style={{ boxShadow: 'var(--shadow-neu-raised)' }}>
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-green-900 font-semibold">Добавить новую категорию</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {isLoadingCategories ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                ) : categories.map((category) => (
                    <Card
                        key={category.id}
                        className="border-0 cursor-pointer hover:opacity-90 transition-opacity bg-[#e8f5e9]"
                        onClick={() => handleOpenCategoryDialog(category)}
                        style={{ boxShadow: 'var(--shadow-neu-flat)' }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">📁</div>
                            <div>
                              <div className="font-semibold text-green-900">{category.name}</div>
                              <div className="text-sm text-green-700">
                                {category.type === 'income' ? 'Доход' : 'Расход'}
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

              {/* Category Dialog */}
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-green-900">
                      {editingCategory ? "Редактировать категорию" : "Добавить категорию"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-green-900">Название</Label>
                      <Input
                          id="category-name"
                          value={categoryFormData.name}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                          placeholder="Например: Продукты"
                          className="rounded-xl border-0 bg-[#e8f5e9]"
                          style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-green-900">Тип</Label>
                      <Select
                          value={categoryFormData.type}
                          onValueChange={(v) => setCategoryFormData({ ...categoryFormData, type: v as "income" | "expense" })}
                      >
                        <SelectTrigger className="rounded-xl border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">Расход</SelectItem>
                          <SelectItem value="income">Доход</SelectItem>
                        </SelectContent>
                      </Select>
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
        <Dialog open={!!selectedOperation} onOpenChange={(open) => {
          if (!open) {
            setSelectedOperation(null);
            setIsEditingOperation(false);
          }
        }}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span>📝</span>
                <span>{selectedOperation?.description || "Без описания"}</span>
              </DialogTitle>
            </DialogHeader>

            {!isEditingOperation ? (
                // Режим просмотра
                <>
                  <div className="text-base pt-2 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Категория:</span>
                      <span className="font-medium text-slate-900">
              {categories.find(c => c.id === selectedOperation?.category_id)?.name ?? "—"}
            </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Сумма:</span>
                      <span className={`text-xl font-bold ${selectedOperation?.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
              {selectedOperation?.type === 'income' ? '+' : '-'}{selectedOperation?.amount.toLocaleString('ru-RU')} ₽
            </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Дата:</span>
                      <span className="font-medium text-slate-900">
              {selectedOperation && new Date(selectedOperation.transaction_date).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
                    </div>
                  </div>
                  <DialogFooter className="flex gap-2 pt-2">
                    <Button
                        onClick={() => {
                          if (!selectedOperation) return;
                          setEditOperationForm({
                            amount: selectedOperation.amount.toString(),
                            description: selectedOperation.description,
                            transaction_date: selectedOperation.transaction_date,
                            category_id: selectedOperation.category_id,
                            type: selectedOperation.type,
                          });
                          setIsEditingOperation(true);
                        }}
                        className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white border-0"
                    >
                      Редактировать
                    </Button>
                    <Button
                        onClick={() => selectedOperation && handleDeleteOperation(selectedOperation.id)}
                        className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white border-0"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Удалить
                    </Button>
                  </DialogFooter>
                </>
            ) : (
                // Режим редактирования
                <>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-type" className="text-green-900">Тип</Label>
                      <Select
                          value={editOperationForm.type}
                          onValueChange={(v) => setEditOperationForm({ ...editOperationForm, type: v as "income" | "expense" })}
                      >
                        <SelectTrigger id="edit-type" className="rounded-xl border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">Расход</SelectItem>
                          <SelectItem value="income">Доход</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-category" className="text-green-900">Категория</Label>
                      <Select
                          value={editOperationForm.category_id}
                          onValueChange={(v) => setEditOperationForm({ ...editOperationForm, category_id: v })}
                      >
                        <SelectTrigger id="edit-category" className="rounded-xl border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                              .filter(c => c.type === editOperationForm.type)
                              .map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-amount" className="text-green-900">Сумма</Label>
                      <Input
                          id="edit-amount"
                          type="number"
                          value={editOperationForm.amount}
                          onChange={(e) => setEditOperationForm({ ...editOperationForm, amount: e.target.value })}
                          className="rounded-xl border-0 bg-[#e8f5e9]"
                          style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-date" className="text-green-900">Дата</Label>
                      <Input
                          id="edit-date"
                          type="date"
                          value={editOperationForm.transaction_date}
                          onChange={(e) => setEditOperationForm({ ...editOperationForm, transaction_date: e.target.value })}
                          className="rounded-xl border-0 bg-[#e8f5e9]"
                          style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description" className="text-green-900">Описание</Label>
                      <Input
                          id="edit-description"
                          value={editOperationForm.description}
                          onChange={(e) => setEditOperationForm({ ...editOperationForm, description: e.target.value })}
                          className="rounded-xl border-0 bg-[#e8f5e9]"
                          style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex gap-2 pt-2">
                    <Button
                        onClick={() => setIsEditingOperation(false)}
                        variant="outline"
                        className="flex-1 rounded-xl border-0 bg-[#e8f5e9] text-green-900"
                        style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                    >
                      Отмена
                    </Button>
                    <Button
                        onClick={handleSaveOperation}
                        className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white border-0"
                    >
                      Сохранить
                    </Button>
                  </DialogFooter>
                </>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
}