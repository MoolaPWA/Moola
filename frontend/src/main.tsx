import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { syncService } from './db/services/syncService';
import { seedDefaultCategories } from "@/db/seeds/seedDatabase.ts";

async function init() {
    // Сначала засеваем категории — потом рендерим приложение
    await seedDefaultCategories();
    syncService.register();

    createRoot(document.getElementById("root")!).render(<App />);
}

init();