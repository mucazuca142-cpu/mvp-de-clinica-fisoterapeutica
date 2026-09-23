import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FisioVida — Agendamento de Consultas",
  description: "Agende sua sessão de fisioterapia de forma rápida e fácil.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
