import React, { useState, useEffect } from 'react';
import { useI18n } from '@/context/I18nContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/Modal';
import { Layout } from '@/components/Layout';
import {
  RefreshCw,
  Send,
  Save,
  Settings as SettingsIcon,
  Zap,
  BookOpen,
  Clock,
  Globe,
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface Settings {
  totalPages: number;
  segmentsPerMonth: number;
  reminderIntervalDays: number;
  timezone: string;
  appUrl: string;
}

export function AdminPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [regenerateModal, setRegenerateModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/admin/settings', settings);
      if (res.ok) {
        setMessage(t.settingsSaved);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await api.post('/admin/cycle/regenerate', {});
      if (res.ok) {
        setMessage(t.regenerated);
        setRegenerateModal(false);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleSendReminders = async () => {
    setSendingReminders(true);
    try {
      const res = await api.post('/admin/reminders/send-now', {});
      if (res.ok) {
        const data = await res.json();
        setMessage(data.message || t.remindersSent);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReminders(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">{t.loading}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <SettingsIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t.adminPanel}</h1>
            <p className="text-xs text-muted-foreground">Stammkhatm – {t.orgName}</p>
          </div>
        </div>

        {/* Success message */}
        {message && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm animate-fade-in border border-green-200 dark:border-green-800/50">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            {message}
          </div>
        )}

        {/* Settings */}
        <Card className="animate-fade-in-up">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg">{t.settings}</CardTitle>
            </div>
            <CardDescription>Configure the Khatm cycle parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {settings && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      {t.totalPages}
                    </label>
                    <Input
                      type="number"
                      value={settings.totalPages}
                      onChange={(e) => setSettings({ ...settings, totalPages: parseInt(e.target.value) || 604 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                      {t.segmentsPerMonth}
                    </label>
                    <Input
                      type="number"
                      value={settings.segmentsPerMonth}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          segmentsPerMonth: parseInt(e.target.value) || 30,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {t.reminderIntervalDays}
                    </label>
                    <Input
                      type="number"
                      value={settings.reminderIntervalDays}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          reminderIntervalDays: parseInt(e.target.value) || 7,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      {t.timezone}
                    </label>
                    <Input
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {t.appUrl}
                  </label>
                  <Input
                    value={settings.appUrl}
                    onChange={(e) => setSettings({ ...settings, appUrl: e.target.value })}
                  />
                </div>
                <div className="pt-2">
                  <Button onClick={handleSave} disabled={saving} className="group">
                    <Save className="h-4 w-4 mr-1.5 transition-transform duration-200 group-hover:scale-110" />
                    {saving ? t.loading : t.saveSettings}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="animate-fade-in-up stagger-1">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </div>
            <CardDescription>Manage cycle segments and send reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Regenerate */}
              <button
                onClick={() => setRegenerateModal(true)}
                className="flex items-start gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-all duration-200 text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                  <RefreshCw className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t.regenerateSegments}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Delete and recreate all segments</p>
                </div>
              </button>

              {/* Send Reminders */}
              <button
                onClick={handleSendReminders}
                disabled={sendingReminders}
                className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-200 text-left group disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{sendingReminders ? t.loading : t.sendReminders}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Email users with incomplete segments</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regenerate Modal */}
      <Modal open={regenerateModal} onClose={() => setRegenerateModal(false)}>
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
        </div>
        <ModalTitle className="text-center">{t.regenerateSegments}</ModalTitle>
        <ModalDescription className="text-center">{t.regenerateWarning}</ModalDescription>
        <ModalFooter>
          <Button variant="outline" onClick={() => setRegenerateModal(false)}>
            {t.cancel}
          </Button>
          <Button variant="destructive" onClick={handleRegenerate} disabled={regenerating}>
            {regenerating ? t.loading : t.regenerateConfirm}
          </Button>
        </ModalFooter>
      </Modal>
    </Layout>
  );
}
