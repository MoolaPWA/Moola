import { categoryService } from '../services/categoryService';
import { DEFAULT_CATEGORIES } from './defaultCategories';

// Запускается один раз при старте приложения
export async function seedDefaultCategories(): Promise<void> {
    // Проверяем — есть ли уже системные категории
    const existing = await categoryService.getAllByUser('system');
    if (existing.length > 0) return; // уже засеяно — выходим

    for (const category of DEFAULT_CATEGORIES) {
        await categoryService.create(category);
    }

    console.log('[DB] Default categories seeded');
}