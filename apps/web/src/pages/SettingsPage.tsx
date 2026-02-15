import React from "react";
import { useI18n } from "@/context/I18nContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Layout } from "@/components/Layout";
import { Sun, Moon, Globe } from "lucide-react";

export function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t.settingsPage}</h1>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t.language}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={lang === "en" ? "default" : "outline"}
                onClick={() => setLang("en")}
              >
                {t.english}
              </Button>
              <Button
                variant={lang === "de" ? "default" : "outline"}
                onClick={() => setLang("de")}
              >
                {t.german}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              {t.theme}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4 mr-1" />
                {t.lightMode}
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4 mr-1" />
                {t.darkMode}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
