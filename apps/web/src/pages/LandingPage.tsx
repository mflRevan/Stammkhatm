import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/ui/Button';
import { BookOpen, Users, CheckCircle2, Star } from 'lucide-react';

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-primary/30 rounded-full animate-float" />
        <div
          className="absolute top-1/2 left-1/5 w-1.5 h-1.5 bg-primary/20 rounded-full animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-primary/25 rounded-full animate-float"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="text-center max-w-lg space-y-6 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6 animate-fade-in-up">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-500 hover:scale-105">
            <span className="text-4xl text-primary-foreground font-serif animate-float">ق</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight animate-fade-in-up stagger-1">{t.landingTitle}</h1>
        <p className="text-xl text-muted-foreground animate-fade-in-up stagger-2">{t.landingSubtitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto animate-fade-in-up stagger-3">
          {t.landingDescription}
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 pt-4 animate-fade-in-up stagger-4">
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border transition-all duration-200 hover:shadow-sm">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">30 {t.segment}e</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border transition-all duration-200 hover:shadow-sm">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">{t.groupName}</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border transition-all duration-200 hover:shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Khatm</span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 animate-fade-in-up stagger-5">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto group">
              <BookOpen className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
              {t.getStarted}
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground animate-fade-in stagger-5">
          {t.alreadyHaveAccount}{' '}
          <Link to="/login" className="text-primary hover:underline font-medium transition-colors duration-200">
            {t.loginHere}
          </Link>
        </p>
      </div>

      <footer className="absolute bottom-6 text-xs text-muted-foreground animate-fade-in">
        {t.orgName} – {t.groupName}
      </footer>
    </div>
  );
}
