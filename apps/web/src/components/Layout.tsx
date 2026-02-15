import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import { BookOpen, LayoutDashboard, Settings, Shield, LogOut, Menu, X, Moon, Sun } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout } = useAuth();
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { path: '/my-segments', label: t.nav.mySegments, icon: BookOpen },
    ...(isAdmin ? [{ path: '/admin', label: t.nav.admin, icon: Shield }] : []),
    { path: '/settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
        <div className="w-full max-w-5xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 font-bold text-lg group"
          >
            <span className="text-primary font-serif text-xl transition-transform duration-300 group-hover:scale-110">
              ق
            </span>
            <span className="transition-colors duration-200 group-hover:text-primary">
              {t.appName}
            </span>
          </Link>

          {user && (
            <>
              {/* Desktop nav */}
              <nav className="hidden md:flex items-center gap-0.5">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-accent text-accent-foreground font-medium shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                    >
                      <item.icon className={`h-4 w-4 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="transition-all duration-200 hover:rotate-12">
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <div className="h-4 w-px bg-border mx-1" />
                <span className="text-sm text-muted-foreground">{user.name}</span>
                <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors duration-200">
                  <LogOut className="h-4 w-4 mr-1" />
                  {t.logout}
                </Button>
              </div>

              {/* Mobile menu button */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
                <div className="transition-transform duration-200">
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </div>
              </Button>
            </>
          )}
        </div>

        {/* Mobile nav */}
        {user && mobileOpen && (
          <nav className="md:hidden border-t p-4 space-y-1 bg-card animate-slide-down">
            {navItems.map((item, i) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 animate-fade-in stagger-${i + 1} ${
                  location.pathname === item.path
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground active:bg-accent/50'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Main content */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">{children}</main>
    </div>
  );
}
