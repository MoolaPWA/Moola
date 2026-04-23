import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { transactionService } from "@/db/services/transactionService";
import { categoryService } from "@/db/services/categoryService";
import type { Category } from "@/db/database";

const TEMP_USER_ID = "temp-user-1";

export function AddOperationScreen() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]); // ← только это, без хардкода
  const [formData, setFormData] = useState({
    type: "expense",
    category: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
  });

  // Загружаем категории из БД при открытии экрана
  useEffect(() => {
    categoryService.getAllByUser(TEMP_USER_ID).then(setCategories);
  }, []);

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      await transactionService.create({
        user_id: TEMP_USER_ID,
        category_id: formData.category,
        amount: Number(formData.amount),
        type: formData.type as "income" | "expense",
        transaction_date: formData.date,
        description: formData.description,
        created_at: now,
        updated_at: now,
        is_synced: 0,
        is_deleted: 0,
      });
      toast.success("Операция успешно добавлена!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Не удалось сохранить операцию");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (newType: "expense" | "income") => {
    const selectedCategory = categories.find(cat => cat.id === formData.category);
    if (selectedCategory && selectedCategory.type !== newType) {
      setFormData({ ...formData, type: newType, category: "" });
    } else {
      setFormData({ ...formData, type: newType });
    }
  };

  // Вёрстка без изменений
  return (
      <div className="min-h-screen pb-6 bg-[#e8f5e9]">
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
            <h1 className="text-2xl font-bold">Новая операция</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 space-y-6 mt-4">
          <Card className="border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-raised)' }}>
            <CardHeader>
              <CardTitle className="text-green-900">Добавление операции</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-green-900">Тип операции</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                        type="button"
                        variant={formData.type === "expense" ? "default" : "outline"}
                        onClick={() => handleTypeChange("expense")}
                        className={formData.type === "expense"
                            ? "bg-red-500 hover:bg-red-600 rounded-xl py-6 border-0"
                            : "rounded-xl py-6 border-0 bg-[#e8f5e9] text-green-900"
                        }
                        style={formData.type === "expense" ? {} : { boxShadow: 'var(--shadow-neu-pressed)' }}
                    >
                      Расход
                    </Button>
                    <Button
                        type="button"
                        variant={formData.type === "income" ? "default" : "outline"}
                        onClick={() => handleTypeChange("income")}
                        className={formData.type === "income"
                            ? "bg-green-600 hover:bg-green-700 rounded-xl py-6 border-0"
                            : "rounded-xl py-6 border-0 bg-[#e8f5e9] text-green-900"
                        }
                        style={formData.type === "income" ? {} : { boxShadow: 'var(--shadow-neu-pressed)' }}
                    >
                      Доход
                    </Button>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-green-900">Категория</Label>
                  <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full rounded-xl py-4 px-4 border-0 bg-[#e8f5e9] text-green-900 appearance-none text-base"
                      style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                  >
                    <option value="" disabled>Выберите категорию</option>
                    {filteredCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-green-900">Сумма</Label>
                  <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                      className="rounded-xl py-6 border-0 bg-[#e8f5e9] text-2xl font-semibold"
                      style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-green-900">Дата</Label>
                  <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="rounded-xl py-6 border-0 bg-[#e8f5e9]"
                      style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-green-900">Описание (комментарий)</Label>
                  <Textarea
                      id="description"
                      placeholder="Дополнительные детали..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="rounded-xl min-h-[100px] border-0 bg-[#e8f5e9]"
                      style={{ boxShadow: 'var(--shadow-neu-pressed)' }}
                  />
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-xl border-0 flex items-center justify-center gap-2"
                    style={{ boxShadow: 'var(--shadow-neu-raised)' }}
                >
                  <Check className="w-5 h-5" />
                  {isLoading ? "Сохранение..." : "Сохранить операцию"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}