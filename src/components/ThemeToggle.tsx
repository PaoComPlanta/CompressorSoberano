"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />; // Espaço vazio para não saltar
  }

  // Lógica simplificada: Se é escuro -> muda para claro. Se é claro -> muda para escuro.
  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Mudar Tema"
    >
      {resolvedTheme === "dark" ? (
        <FiSun size={20} className="animate-in spin-in-90 duration-300" />
      ) : (
        <FiMoon size={20} className="animate-in fade-in duration-300" />
      )}
    </button>
  );
}