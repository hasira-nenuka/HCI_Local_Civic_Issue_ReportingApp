import React from "react";
import { Redirect } from "expo-router";
import { useApp } from "../../hooks/AppContext";
export default function Entry() {
  const { user } = useApp();
  return <Redirect href={user ? "/Main/Home" : "/Login"} />;
}
