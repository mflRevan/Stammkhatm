import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Layout } from '@/components/Layout';
import { Sun, Moon, Globe, Settings as SettingsIcon } from 'lucide-react';

export function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <SettingsIcon className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t.settingsPage}</h1>
        </div>

        {/* Language */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              {t.language}
            </CardTitle>
            <CardDescription>Choose your preferred language</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={lang === 'en' ? 'default' : 'outline'}
                onClick={() => setLang('en')}
                className="flex-1 sm:flex-initial"
              >
                🇬🇧 {t.english}
              </Button>
              <Button
                variant={lang === 'de' ? 'default' : 'outline'}
                onClick={() => setLang('de')}
                className="flex-1 sm:flex-initial"
              >
                🇩🇪 {t.german}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card className="animate-fade-in-up stagger-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              {t.theme}
            </CardTitle>
            <CardDescription>Switch between light and dark mode</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="flex-1 sm:flex-initial"
              >
                <Sun className="h-4 w-4 mr-1.5" />
                {t.lightMode}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="flex-1 sm:flex-initial"
              >
                <Moon className="h-4 w-4 mr-1.5" />
                {t.darkMode}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
