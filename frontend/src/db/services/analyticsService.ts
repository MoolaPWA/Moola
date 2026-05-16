import { db } from '../database';
import { categoryService } from './categoryService';

const CHART_COLORS = [
    '#10b981', '#3b82f6', '#8b5cf6', '#ef4444',
    '#f59e0b', '#ec4899', '#14b8a6', '#f97316',
];

export const analyticsService = {

    // Суммы доходов и расходов за период
    async getSummary(user_id: string, from: string, to: string) {
        const transactions = await db.transactions
            .where('user_id').equals(user_id)
            .filter((t) =>
                t.is_deleted === 0 &&
                t.transaction_date >= from &&
                t.transaction_date <= to
            )
            .toArray();

        const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            count: transactions.length,
        };
    },

    // Расходы по категориям за период (для PieChart)
    async getExpensesByCategory(user_id: string, from: string, to: string) {
        const transactions = await db.transactions
            .where('user_id').equals(user_id)
            .filter((t) =>
                t.is_deleted === 0 &&
                t.type === 'expense' &&
                t.transaction_date >= from &&
                t.transaction_date <= to
            )
            .toArray();

        const categories = await categoryService.getAllByUser(user_id);
        const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

        // Группируем по категории
        const grouped = new Map<string, number>();
        for (const t of transactions) {
            const current = grouped.get(t.category_id) ?? 0;
            grouped.set(t.category_id, current + t.amount);
        }

        return Array.from(grouped.entries())
            .map(([category_id, value], index) => ({
                id: category_id,
                name: categoryMap.get(category_id) ?? 'Другое',
                value,
                color: CHART_COLORS[index % CHART_COLORS.length],
            }))
            .sort((a, b) => b.value - a.value);
    },

    // Расходы по дням за последние 30 дней (для BarChart)
    async getDailyExpenses(user_id: string) {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 29);

        const fromStr = from.toISOString().split('T')[0];
        const toStr = to.toISOString().split('T')[0];

        const transactions = await db.transactions
            .where('user_id').equals(user_id)
            .filter((t) =>
                t.is_deleted === 0 &&
                t.type === 'expense' &&
                t.transaction_date >= fromStr &&
                t.transaction_date <= toStr
            )
            .toArray();

        // Группируем по дате
        const grouped = new Map<string, number>();
        for (const t of transactions) {
            const date = t.transaction_date.split('T')[0];
            grouped.set(date, (grouped.get(date) ?? 0) + t.amount);
        }

        // Заполняем все 30 дней, даже пустые
        const result = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            result.push({
                id: dateStr,
                day: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                amount: grouped.get(dateStr) ?? 0,
            });
        }

        return result;
    },

    // Доходы и расходы по месяцам за последние 6 месяцев (для LineChart)
    async getMonthlyTrend(user_id: string) {
        const result = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const from = `${year}-${month}-01`;
            const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();
            const to = `${year}-${month}-${lastDay}`;

            const summary = await analyticsService.getSummary(user_id, from, to);

            result.push({
                id: `${year}-${month}`,
                month: date.toLocaleDateString('ru-RU', { month: 'short' }),
                income: summary.totalIncome,
                expenses: summary.totalExpenses,
            });
        }

        return result;
    },

    // Самая затратная категория
    async getTopCategory(user_id: string, from: string, to: string): Promise<string> {
        const data = await analyticsService.getExpensesByCategory(user_id, from, to);
        return data[0]?.name ?? '—';
    },
};