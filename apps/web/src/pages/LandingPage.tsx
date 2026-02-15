import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/context/I18nContext";
import { Button } from "@/components/ui/Button";
import { BookOpen } from "lucide-react";

export function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-lg space-y-6">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
            <span className="text-3xl text-primary-foreground font-serif">ق</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight">{t.landingTitle}</h1>
        <p className="text-xl text-muted-foreground">{t.landingSubtitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{t.landingDescription}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto">
              <BookOpen className="h-4 w-4 mr-2" />
              {t.getStarted}
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          {t.alreadyHaveAccount}{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            {t.loginHere}
          </Link>
        </p>
      </div>

      <footer className="absolute bottom-6 text-xs text-muted-foreground">
        {t.orgName} – {t.groupName}
      </footer>
    </div>
  );
}
