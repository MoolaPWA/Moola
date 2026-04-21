import { Outlet } from "react-router";
import { Toaster } from "./ui/sonner";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <Outlet />
      <Toaster position="top-center" richColors />
    </div>
  );
}