import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { SignUpScreen } from "./components/SignUpScreen";
import { LoginScreen } from "./components/LoginScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { AddOperationScreen } from "./components/AddOperationScreen";
import { OperationsListScreen } from "./components/OperationsListScreen";
import { StatisticsScreen } from "./components/StatisticsScreen";
import { SettingsScreen } from "./components/SettingsScreen";



export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: WelcomeScreen },
      { path: "signup", Component: SignUpScreen },
      { path: "login", Component: LoginScreen },
      { path: "dashboard", Component: DashboardScreen },
      { path: "add-operation", Component: AddOperationScreen },
      { path: "operations", Component: OperationsListScreen },
      { path: "statistics", Component: StatisticsScreen },
      { path: "settings", Component: SettingsScreen },
    ],
  },
]);