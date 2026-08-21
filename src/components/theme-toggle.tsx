"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-md border border-border bg-card/60" />
    );
  }

  const cycleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      className="relative h-9 w-9 border-border bg-card/80 backdrop-blur hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer shadow-xs"
      title={`Current theme: ${theme} (Click to change)`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4 text-primary transition-transform duration-200 rotate-0 scale-100" />
      ) : theme === "light" ? (
        <Sun className="h-4 w-4 text-amber-500 transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Laptop className="h-4 w-4 text-muted-foreground transition-transform duration-200 rotate-0 scale-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
