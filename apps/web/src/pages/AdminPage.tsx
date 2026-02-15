import React, { useState, useEffect } from "react";
import { useI18n } from "@/context/I18nContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/Modal";
import { Layout } from "@/components/Layout";
import { RefreshCw, Send, Save } from "lucide-react";

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
  const [message, setMessage] = useState("");
  const [regenerateModal, setRegenerateModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/admin/settings");
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
    setMessage("");
    try {
      const res = await api.put("/admin/settings", settings);
      if (res.ok) {
        setMessage(t.settingsSaved);
        setTimeout(() => setMessage(""), 3000);
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
      const res = await api.post("/admin/cycle/regenerate", {});
      if (res.ok) {
        setMessage(t.regenerated);
        setRegenerateModal(false);
        setTimeout(() => setMessage(""), 3000);
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
      const res = await api.post("/admin/reminders/send-now", {});
      if (res.ok) {
        const data = await res.json();
        setMessage(data.message || t.remindersSent);
        setTimeout(() => setMessage(""), 3000);
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
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t.adminPanel}</h1>

        {message && (
          <div className="p-3 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm">
            {message}
          </div>
        )}

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.settings}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t.totalPages}</label>
                    <Input
                      type="number"
                      value={settings.totalPages}
                      onChange={(e) =>
                        setSettings({ ...settings, totalPages: parseInt(e.target.value) || 604 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t.segmentsPerMonth}</label>
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
                    <label className="text-sm font-medium">{t.reminderIntervalDays}</label>
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
                    <label className="text-sm font-medium">{t.timezone}</label>
                    <Input
                      value={settings.timezone}
                      onChange={(e) =>
                        setSettings({ ...settings, timezone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.appUrl}</label>
                  <Input
                    value={settings.appUrl}
                    onChange={(e) =>
                      setSettings({ ...settings, appUrl: e.target.value })
                    }
                  />
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? t.loading : t.saveSettings}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
            <Button
              variant="destructive"
              onClick={() => setRegenerateModal(true)}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {t.regenerateSegments}
            </Button>
            <Button
              variant="secondary"
              onClick={handleSendReminders}
              disabled={sendingReminders}
            >
              <Send className="h-4 w-4 mr-1" />
              {sendingReminders ? t.loading : t.sendReminders}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Regenerate Modal */}
      <Modal open={regenerateModal} onClose={() => setRegenerateModal(false)}>
        <ModalTitle>{t.regenerateSegments}</ModalTitle>
        <ModalDescription>{t.regenerateWarning}</ModalDescription>
        <ModalFooter>
          <Button variant="outline" onClick={() => setRegenerateModal(false)}>
            {t.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            {regenerating ? t.loading : t.regenerateConfirm}
          </Button>
        </ModalFooter>
      </Modal>
    </Layout>
  );
}
