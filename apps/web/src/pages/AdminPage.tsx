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
  Users,
  Mail,
} from 'lucide-react';

interface Settings {
  totalPages: number;
  segmentsPerMonth: number;
  splitEnabled: boolean;
  reminderIntervalDays: number;
  reminderTarget: 'incomplete-claims' | 'unclaimed-users';
  reminderTemplate: string;
  timezone: string;
  appUrl: string;
}

interface OverviewSegment {
  id: string;
  index: number;
  startPage: number;
  endPage: number;
  surahSpanJson: string;
  juzSpanJson: string;
  status: 'unclaimed' | 'claimed' | 'completed';
}

interface OverviewUser {
  id: string;
  name: string;
  email: string;
}

interface OverviewData {
  cycle: {
    monthKey: string;
    segments: OverviewSegment[];
  };
  unclaimedUsers: OverviewUser[];
}

export function AdminPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [regenerateModal, setRegenerateModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [reminderModal, setReminderModal] = useState<OverviewSegment | null>(null);
  const [reminderText, setReminderText] = useState('');
  const [reminderChannel, setReminderChannel] = useState('email');
  const [sendingSegmentReminder, setSendingSegmentReminder] = useState(false);
  const [sendingUnclaimed, setSendingUnclaimed] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchOverview();
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

  const fetchOverview = async () => {
    try {
      const res = await api.get('/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (err) {
      console.error(err);
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
        await fetchOverview();
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

  const handleSendSegmentReminder = async () => {
    if (!reminderModal) return;
    setSendingSegmentReminder(true);
    try {
      const res = await api.post('/admin/reminders/segment', {
        segmentId: reminderModal.id,
        message: reminderText,
        channel: reminderChannel,
      });
      if (res.ok) {
        setMessage(t.reminderSent);
        setReminderModal(null);
        setReminderText('');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingSegmentReminder(false);
    }
  };

  const handleSendUnclaimedReminders = async () => {
    setSendingUnclaimed(true);
    try {
      const res = await api.post('/admin/reminders/unclaimed', {
        message: reminderText || settings?.reminderTemplate || t.reminderDefault,
        channel: reminderChannel,
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(data.message || t.reminderSent);
        setReminderText('');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingUnclaimed(false);
    }
  };

  const handleSendReminderToUser = async (userId: string) => {
    setSendingUnclaimed(true);
    try {
      const res = await api.post('/admin/reminders/unclaimed', {
        message: reminderText || settings?.reminderTemplate || t.reminderDefault,
        channel: reminderChannel,
        userIds: [userId],
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(data.message || t.reminderSent);
        setReminderText('');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingUnclaimed(false);
    }
  };

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getTimeLeft = (monthKey: string, timeZone?: string) => {
    const [year, month] = monthKey.split('-');
    const monthIndex = parseInt(month) - 1;
    const safeTz = timeZone || 'UTC';

    const getNowInTz = () => {
      try {
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: safeTz,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).formatToParts(new Date());
        const y = parts.find((p) => p.type === 'year')?.value;
        const m = parts.find((p) => p.type === 'month')?.value;
        const d = parts.find((p) => p.type === 'day')?.value;
        if (!y || !m || !d) return new Date();
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      } catch {
        return new Date();
      }
    };

    const endDate = new Date(parseInt(year), monthIndex + 1, 0, 23, 59, 59);
    const diffMs = endDate.getTime() - getNowInTz().getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  const totalSegments = overview?.cycle.segments.length ?? 0;
  const completedSegments = overview?.cycle.segments.filter((s) => s.status === 'completed').length ?? 0;
  const claimedSegments = overview?.cycle.segments.filter((s) => s.status !== 'unclaimed').length ?? 0;
  const progressPercent = totalSegments > 0 ? Math.round((completedSegments / totalSegments) * 100) : 0;

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

        {/* Overview */}
        {overview && (
          <div className="space-y-4 animate-fade-in-up">
            <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/10">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold">{t.currentMonth}: {formatMonth(overview.cycle.monthKey)}</p>
                    <p className="text-xs text-muted-foreground">
                      {claimedSegments}/{totalSegments} {t.claimed} • {completedSegments}/{totalSegments} {t.completed.toLowerCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{progressPercent}%</p>
                    <p className="text-xs text-muted-foreground">{getTimeLeft(overview.cycle.monthKey, settings?.timezone)} {t.daysLeft}</p>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {t.unclaimedUsers}
                </CardTitle>
                <CardDescription>{t.unclaimedUsersDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {overview.unclaimedUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t.everyoneClaimed}</p>
                ) : (
                  <div className="space-y-2">
                    {overview.unclaimedUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-xs">
                          {u.name}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleSendReminderToUser(u.id)}>
                          {t.sendReminder}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <textarea
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder={t.reminderMessagePlaceholder}
                    value={reminderText}
                    onChange={(e) => setReminderText(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={handleSendUnclaimedReminders}
                      disabled={sendingUnclaimed || overview.unclaimedUsers.length === 0}
                    >
                      {sendingUnclaimed ? t.loading : t.remindUnclaimed}
                    </Button>
                    <select
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={reminderChannel}
                      onChange={(e) => setReminderChannel(e.target.value)}
                    >
                      <option value="email">Email</option>
                      <option value="whatsapp" disabled>
                        WhatsApp (soon)
                      </option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Segments status */}
        {overview && (
          <Card className="animate-fade-in-up">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                {t.segmentStatus}
              </CardTitle>
              <CardDescription>{t.segmentStatusDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                {overview.cycle.segments.map((segment) => (
                  <div
                    key={segment.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {t.segment} {segment.index + 1} • {t.pages}: {segment.startPage}–{segment.endPage}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {segment.status === 'unclaimed'
                          ? t.unclaimed
                          : segment.status === 'completed'
                            ? t.completed
                            : t.claimed}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {segment.status === 'claimed' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setReminderModal(segment);
                            setReminderText(settings?.reminderTemplate || t.reminderDefault);
                          }}
                        >
                          {t.sendReminder}
                        </Button>
                      )}
                      {segment.status === 'unclaimed' && (
                        <Badge variant="outline" className="text-xs">
                          {t.unclaimed}
                        </Badge>
                      )}
                      {segment.status === 'completed' && (
                        <Badge variant="success" className="text-xs">
                          {t.completed}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                      <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                      {t.splitEnabled}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={settings.splitEnabled}
                        onChange={(e) => setSettings({ ...settings, splitEnabled: e.target.checked })}
                      />
                      {settings.splitEnabled ? t.splitActive : t.splitDisabled}
                    </label>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {t.reminderTarget}
                  </label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                    value={settings.reminderTarget}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        reminderTarget: e.target.value as Settings['reminderTarget'],
                      })
                    }
                  >
                    <option value="incomplete-claims">{t.reminderTargetClaims}</option>
                    <option value="unclaimed-users">{t.reminderTargetUnclaimed}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.reminderTemplate}</label>
                  <textarea
                    className="w-full min-h-[90px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                    value={settings.reminderTemplate}
                    onChange={(e) => setSettings({ ...settings, reminderTemplate: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">{t.reminderTemplateHint}</p>
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

      {/* Segment Reminder Modal */}
      <Modal open={!!reminderModal} onClose={() => setReminderModal(null)}>
        <ModalTitle className="text-center">{t.sendReminder}</ModalTitle>
        <ModalDescription className="text-center">{t.reminderModalDesc}</ModalDescription>
        <div className="space-y-3 mt-4">
          <textarea
            className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={reminderText}
            onChange={(e) => setReminderText(e.target.value)}
          />
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={reminderChannel}
            onChange={(e) => setReminderChannel(e.target.value)}
          >
            <option value="email">Email</option>
            <option value="whatsapp" disabled>
              WhatsApp (soon)
            </option>
          </select>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setReminderModal(null)}>
            {t.cancel}
          </Button>
          <Button onClick={handleSendSegmentReminder} disabled={sendingSegmentReminder}>
            {sendingSegmentReminder ? t.loading : t.sendReminder}
          </Button>
        </ModalFooter>
      </Modal>

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
