"use client";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function ThemeSwitcher() {
  const { setTheme } = useTheme();
  return (
    <div className="flex gap-1 rounded-lg border p-1">
      {[
        { name: "light", icon: Sun },
        { name: "dark", icon: Moon },
        { name: "system", icon: Monitor },
      ].map(({ name, icon: Icon }) => (
        <Button
          key={name}
          variant="ghost"
          size="icon"
          aria-label={`Use ${name} theme`}
          onClick={() => setTheme(name)}
        >
          <Icon className="size-4" />
        </Button>
      ))}
    </div>
  );
}
