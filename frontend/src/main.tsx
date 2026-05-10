import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { syncService } from './db/services/syncService';
import { seedDefaultCategories } from "@/db/seeds/seedDatabase.ts";

// Перехватываем до рендера — событие не потеряется
window.__installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__installPrompt = e;
    window.dispatchEvent(new Event('installpromptready'));
});

async function init() {
    await seedDefaultCategories();
    syncService.register();
    createRoot(document.getElementById("root")!).render(<App />);
}

init();