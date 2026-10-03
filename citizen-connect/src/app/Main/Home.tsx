import React from "react";
import { useApp } from "../../../hooks/AppContext";
import { HomeScreen } from "../../../screens/citizen";
import { DashboardScreen } from "../../../screens/admin";
export default function Home() {
  const { user } = useApp();
  return user?.role === "citizen" ? <HomeScreen /> : <DashboardScreen />;
}
