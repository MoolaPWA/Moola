import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";

export function AddOperationScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: "expense",
    category: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
  });

  const categories = [
    { id: "food", name: "Продукты", icon: "🛒", type: "expense" },
    { id: "transport", name: "Транспорт", icon: "🚗", type: "expense" },
    { id: "entertainment", name: "Развлечения", icon: "🎮", type: "expense" },
    { id: "health", name: "Здоровье", icon: "💊", type: "expense" },
    { id: "education", name: "Образование", icon: "📚", type: "expense" },
    { id: "shopping", name: "Покупки", icon: "🛍️", type: "expense" },
    { id: "salary", name: "Зарплата", icon: "💰", type: "income" },
    { id: "freelance", name: "Фриланс", icon: "💻", type: "income" },
    { id: "investment", name: "Инвестиции", icon: "📈", type: "income" },
    { id: "other", name: "Другое", icon: "📝", type: "expense" },
  ];

  // Фильтруем категории по типу операции
  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Операция успешно добавлена!");
    navigate("/dashboard");
  };

  // При смене типа операции сбрасываем выбранную категорию, если она не подходит
  const handleTypeChange = (newType: "expense" | "income") => {
    const selectedCategory = categories.find(cat => cat.id === formData.category);
    if (selectedCategory && selectedCategory.type !== newType) {
      setFormData({ ...formData, type: newType, category: "" });
    } else {
      setFormData({ ...formData, type: newType });
    }
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
          <h1 className="text-2xl font-bold">Новая операция</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-6 mt-4">
        <Card 
          className="border-0 bg-[#e8f5e9]"
          style={{ boxShadow: 'var(--shadow-neu-raised)' }}
        >
          <CardHeader>
            <CardTitle className="text-green-900">Добавление операции</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Operation Type */}
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
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="rounded-xl py-6 border-0 bg-[#e8f5e9]" style={{ boxShadow: 'var(--shadow-neu-pressed)' }}>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
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

              {/* Date */}
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

              {/* Description */}
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-xl border-0 flex items-center justify-center gap-2"
                style={{ boxShadow: 'var(--shadow-neu-raised)' }}
              >
                <Check className="w-5 h-5" />
                Сохранить операцию
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}