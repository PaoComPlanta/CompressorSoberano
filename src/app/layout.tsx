import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Compressor Soberano",
  description: "Otimizador de imagens moderno e rápido.",
  manifest: "/manifest.json", // Link automático gerado pelo next
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Soberano",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="antialiased transition-colors duration-300 font-sans">
        {/* 👇 ESTA LINHA É CRÍTICA: attribute="class" TEM DE ESTAR AQUI 👇 */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          
          <header className="absolute top-0 right-0 p-4 z-10">
            <ThemeToggle />
          </header>

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}