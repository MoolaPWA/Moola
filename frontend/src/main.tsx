import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
// @ts-ignore
import { db } from './db/database';
import { syncService } from './db/services/syncService';

createRoot(document.getElementById("root")!).render(<App />);
syncService.register();


  