import React from "react";
import { Redirect } from "expo-router";

export default function DetalhesIndex() {
  // Redirecionar para tela de campanhas quando acessar diretamente a rota /campanhas/detalhes
  return <Redirect href="/campanhas" />;
}
