import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Tránh hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
      className={className}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark
        ? <Sun className="h-4 w-4 text-yellow-400 transition-all" />
        : <Moon className="h-4 w-4 text-slate-600 transition-all" />
      }
    </Button>
  );
}
