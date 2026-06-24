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
import { useUser } from "@/context/UserContext";
import {IconPicker} from "@/app/components/IconPicker.tsx"
import {CategoryIcon} from "@/app/components/CategoryIcon.tsx"
import { useSync } from "@/hooks/useSync";
import {toApiCategoryCreate} from "@/services/api/mappers.ts"
import {updateCategory} from "@/services/api/categories.ts"



export function OperationsListScreen() {
  const navigate = useNavigate();
  const { userId } = useUser();
  const { sync } = useSync();
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
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");

  // Диалог категорий
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    icon_path: "",
    icon_color: "#000000",
    background_color: "#FFFFFF",
  });

// Раскрыт ли пикер иконок в диалоге
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

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
    if (!userId) return;
    setIsLoadingOperations(true);
    try {
      const data = await transactionService.getAllByUser(userId);
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
    if (!userId) return;
    setIsLoadingCategories(true);
    try {
      const data = await categoryService.getAllByUser(userId);
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
  }, [userId]);

  useEffect(() => {
    const reload = () => {
      loadOperations();
      loadCategories();
    };
    window.addEventListener('datasync', reload);
    return () => window.removeEventListener('datasync', reload);
  }, [userId]);

  // Фильтрация операций
  const filteredOperations = useMemo(() => {
    const now = new Date();

    // Вычисляем from/to по пресету
    let periodFrom = "";
    let periodTo = "";

    if (filterPeriod === "day") {
      periodFrom = now.toISOString().split('T')[0];
      periodTo = periodFrom;
    } else if (filterPeriod === "week") {
      const from = new Date();
      from.setDate(from.getDate() - 6);
      periodFrom = from.toISOString().split('T')[0];
      periodTo = now.toISOString().split('T')[0];
    } else if (filterPeriod === "month") {
      periodFrom = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString().split('T')[0];
      periodTo = now.toISOString().split('T')[0];
    } else if (filterPeriod === "custom") {
      periodFrom = filterDateFrom;
      periodTo = filterDateTo;
    }

    return operations.filter((op) => {
      const matchesSearch = op.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || op.type === filterType;
      const matchesCategory =
          filterCategory === "all" || op.category_id === filterCategory;

      const opDate = op.transaction_date.split("T")[0];
      let matchesPeriod = true;
      if (periodFrom) matchesPeriod = opDate >= periodFrom;
      if (periodTo) matchesPeriod = matchesPeriod && opDate <= periodTo;

      return matchesSearch && matchesType && matchesCategory && matchesPeriod;
    });
  }, [operations, searchQuery, filterType, filterCategory, filterPeriod, filterDateFrom, filterDateTo]);


  // Диалог категории
  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        type: category.type,
        icon_path: category.icon_path,
        icon_color: category.icon_color,
        background_color: category.background_color,
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: "",
        type: "expense",
        icon_path: "",          // пусто → в добавлении покажем плюс-плейсхолдер
        icon_color: "#000000",  // дефолт по ТЗ
        background_color: "#FFFFFF", // дефолт по ТЗ
      });
    }
    setIsIconPickerOpen(false); // пикер закрыт при открытии диалога
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
    // Проверка дубликата (имя + тип) среди локальных категорий
    if (!editingCategory) {
      const nameTrimmed = categoryFormData.name.trim().toLowerCase();
      const duplicate = categories.find(
          (c) => c.name.trim().toLowerCase() === nameTrimmed
              && c.type === categoryFormData.type
      );
      if (duplicate) {
        toast.error("Категория с таким названием и типом уже существует");
        return;
      }
    }

    try {
      if (editingCategory) {
        const updated = { ...editingCategory, ...categoryFormData };
        const serverCategory = await updateCategory(
            editingCategory.id,
            toApiCategoryCreate(updated)
        );
        await categoryService.update(editingCategory.id, serverCategory);
        toast.success("Категория обновлена!");
      } else {
        // Дефолт в серверном формате (static/icons/...)
        const iconPath = categoryFormData.icon_path
            || (categoryFormData.type === 'expense'
                ? 'static/icons/badge-plus.svg'
                : 'static/icons/badge-dollar-sign.svg');

        await categoryService.create({
          user_id: userId!,
          name: categoryFormData.name,
          type: categoryFormData.type,
          is_deleted: 0,
          icon_path: iconPath,
          background_color: categoryFormData.background_color,
          icon_color: categoryFormData.icon_color,
        });
        toast.success("Категория создана!");
        await loadCategories();
        setIsCategoryDialogOpen(false);
        sync(true);
      }
      await loadCategories();
      setIsCategoryDialogOpen(false);
    } catch (error) {
      console.error('Ошибка сохранения категории:', error);
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
                  className="pl-12 pr-12 py-6 rounded-xl bg-[#e8f5e9] border-0 text-green-900 placeholder:text-green-600"
                  style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
              />
              {searchQuery && (
                  <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-900"
                  >
                    ✕
                  </button>
              )}
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
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-green-700" />
                    <span className="text-sm font-medium text-green-900">Фильтры</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Тип */}
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

                    {/* Категория */}
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

                    {/* Период */}
                    <Select value={filterPeriod} onValueChange={(v) => {
                      setFilterPeriod(v);
                      if (v !== "custom") {
                        setFilterDateFrom("");
                        setFilterDateTo("");
                      }
                    }}>
                      <SelectTrigger className="rounded-xl border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
                        <SelectValue placeholder="Все периоды" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все периоды</SelectItem>
                        <SelectItem value="day">За день</SelectItem>
                        <SelectItem value="week">За неделю</SelectItem>
                        <SelectItem value="month">За месяц</SelectItem>
                        <SelectItem value="custom">За период</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date picker — только для произвольного периода */}
                  {filterPeriod === "custom" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-xs text-green-700">От</span>
                          <Input
                              type="date"
                              value={filterDateFrom}
                              onChange={(e) => setFilterDateFrom(e.target.value)}
                              className="rounded-xl border-0 bg-[#e8f5e9] text-green-900"
                              style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-green-700">До</span>
                          <Input
                              type="date"
                              value={filterDateTo}
                              onChange={(e) => setFilterDateTo(e.target.value)}
                              className="rounded-xl border-0 bg-[#e8f5e9] text-green-900"
                              style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                          />
                        </div>
                      </div>
                  )}

                  {/* Сброс фильтров */}
                  {(filterType !== "all" || filterCategory !== "all" || filterPeriod !== "all" || searchQuery) && (
                      <Button
                          variant="ghost"
                          onClick={() => {
                            setFilterType("all");
                            setFilterCategory("all");
                            setFilterPeriod("all");
                            setFilterDateFrom("");
                            setFilterDateTo("");
                            setSearchQuery("");
                          }}
                          className="w-full text-green-700 hover:text-green-900 text-sm rounded-xl"
                      >
                        Сбросить все фильтры
                      </Button>
                  )}
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
                                  {(() => {
                                    const cat = categories.find(c => c.id === operation.category_id);
                                    return cat ? (
                                        <CategoryIcon
                                            iconPath={cat.icon_path}
                                            type={cat.type}
                                            backgroundColor={cat.background_color}
                                            iconColor={cat.icon_color}
                                            size={48}
                                        />
                                    ) : (
                                        <CategoryIcon
                                            iconPath=""
                                            type={operation.type}
                                            backgroundColor="#FFFFFF"
                                            iconColor="#000000"
                                            size={48}
                                        />
                                    );
                                  })()}
                                </div>
                                <div>
                                  <div className="font-semibold text-green-900">{operation.description || "Без описания"}</div>
                                  <div className="text-sm text-green-700">
                                    {categories.find(c => c.id === operation.category_id)?.name ?? "Без категории"}
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
                            <CategoryIcon
                                iconPath={category.icon_path}
                                type={category.type}
                                backgroundColor={category.background_color}
                                iconColor={category.icon_color}
                                size={48}
                            />
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
                          onValueChange={(v) => setCategoryFormData({
                            ...categoryFormData,
                            type: v as "income" | "expense",
                            icon_path: "", // сброс иконки при смене типа — иконки разные для дохода/расхода
                          })}
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

                    {/* Графа "Иконка" */}
                    <div className="space-y-2">
                      <Label className="text-green-900">Иконка</Label>

                      {!isIconPickerOpen ? (
                          // Обычное состояние: слева иконка, справа цвет и фон
                          <div className="flex items-center gap-4">
                            {/* Текущая иконка — клик раскрывает пикер */}
                            <button
                                type="button"
                                onClick={() => setIsIconPickerOpen(true)}
                                className="shrink-0"
                            >
                              {categoryFormData.icon_path ? (
                                  <CategoryIcon
                                      iconPath={categoryFormData.icon_path}
                                      type={categoryFormData.type}
                                      backgroundColor={categoryFormData.background_color}
                                      iconColor={categoryFormData.icon_color}
                                      size={56}
                                  />
                              ) : (
                                  // Плейсхолдер "плюс" для новой категории без иконки
                                  <div
                                      className="rounded-xl flex items-center justify-center border-2 border-dashed border-green-400"
                                      style={{ width: 56, height: 56 }}
                                  >
                                    <Plus className="w-6 h-6 text-green-500" />
                                  </div>
                              )}
                            </button>

                            {/* Цвет иконки и фон */}
                            <div className="flex gap-4">
                              <div className="space-y-1">
                                <Label className="text-xs text-green-700">Цвет иконки</Label>
                                <input
                                    type="color"
                                    value={categoryFormData.icon_color}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, icon_color: e.target.value })}
                                    className="block w-10 h-10 rounded-lg cursor-pointer border border-green-200"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-green-700">Фон</Label>
                                <input
                                    type="color"
                                    value={categoryFormData.background_color}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, background_color: e.target.value })}
                                    className="block w-10 h-10 rounded-lg cursor-pointer border border-green-200"
                                />
                              </div>
                            </div>
                          </div>
                      ) : (
                          // Раскрытый пикер — выбор иконки закрывает его
                          <IconPicker
                              type={categoryFormData.type}
                              iconColor={categoryFormData.icon_color}
                              backgroundColor={categoryFormData.background_color}
                              onSelect={(path) => {
                                setCategoryFormData({ ...categoryFormData, icon_path: path });
                                setIsIconPickerOpen(false);
                              }}
                          />
                      )}
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