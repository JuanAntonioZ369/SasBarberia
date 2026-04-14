import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SasBarbería",
  description: "Sistema de gestión para tu barbería",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
