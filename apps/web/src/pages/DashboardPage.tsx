import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/Modal';
import { Layout } from '@/components/Layout';
import { BookOpen, Users, CheckCircle2, TrendingUp, Target, Sparkles, Clock } from 'lucide-react';

interface Segment {
  id: string;
  index: number;
  startPage: number;
  endPage: number;
  surahSpanJson: string;
  juzSpanJson: string;
  claim: {
    id: string;
    claimedAt: string;
    completedAt: string | null;
    isMine: boolean;
  } | null;
}

interface Cycle {
  id: string;
  monthKey: string;
  segments: Segment[];
}

interface SettingsSummary {
  splitEnabled: boolean;
  segmentsPerMonth: number;
  totalPages: number;
  timezone?: string;
}

interface UnclaimedUser {
  id: string;
  name: string;
}

export function DashboardPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [settings, setSettings] = useState<SettingsSummary | null>(null);
  const [unclaimedUsers, setUnclaimedUsers] = useState<UnclaimedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimModal, setClaimModal] = useState<Segment | null>(null);
  const [claiming, setClaiming] = useState(false);

  const fetchCycle = async () => {
    try {
      const res = await api.get('/cycles/current');
      if (res.ok) {
        const data = await res.json();
        setCycle(data.cycle);
        setSettings(data.settings);
        setUnclaimedUsers(data.unclaimedUsers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycle();
  }, []);

  const handleClaim = async (segment: Segment) => {
    setClaiming(true);
    try {
      const res = await api.post(`/segments/${segment.id}/claim`, {});
      if (res.ok) {
        await fetchCycle();
        setClaimModal(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
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

  const getSurahDisplay = (json: string) => {
    try {
      const surahs = JSON.parse(json);
      return surahs
        .map((s: { number: number; name: string; nameEn: string; nameDe: string }) =>
          lang === 'de' ? `${s.number}. ${s.name}` : `${s.number}. ${s.nameEn}`,
        )
        .join(', ');
    } catch {
      return '';
    }
  };

  const getJuzDisplay = (json: string) => {
    try {
      const juzs = JSON.parse(json);
      return juzs.map((j: { number: number }) => j.number).join(', ');
    } catch {
      return '';
    }
  };

  // Compute stats
  const totalSegments = cycle?.segments.length ?? 0;
  const claimedSegments = cycle?.segments.filter((s) => !!s.claim).length ?? 0;
  const completedSegments = cycle?.segments.filter((s) => s.claim?.completedAt).length ?? 0;
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
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">{t.dashboard}</h1>
            {cycle && (
              <p className="text-muted-foreground text-sm">
                {t.currentMonth}: {formatMonth(cycle.monthKey)}
              </p>
            )}
          </div>
        </div>

        {/* Stats overview */}
        {cycle && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up">
            <Card className="hover:shadow-md">
              <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                <Target className="h-5 w-5 text-primary mb-1" />
                <span className="text-2xl font-bold">
                  {claimedSegments}
                  <span className="text-sm text-muted-foreground font-normal">/{totalSegments}</span>
                </span>
                <span className="text-xs text-muted-foreground">{t.claimed}</span>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md">
              <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mb-1" />
                <span className="text-2xl font-bold">
                  {completedSegments}
                  <span className="text-sm text-muted-foreground font-normal">/{totalSegments}</span>
                </span>
                <span className="text-xs text-muted-foreground">{t.completed}</span>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md">
              <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                <TrendingUp className="h-5 w-5 text-primary mb-1" />
                <span className="text-2xl font-bold">{progressPercent}%</span>
                <span className="text-xs text-muted-foreground">Khatm</span>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md">
              <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                <Clock className="h-5 w-5 text-primary mb-1" />
                <span className="text-2xl font-bold">{cycle ? getTimeLeft(cycle.monthKey, settings?.timezone) : 0}</span>
                <span className="text-xs text-muted-foreground">{t.daysLeft}</span>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress bar */}
        {cycle && totalSegments > 0 && (
          <div className="animate-fade-in-up stagger-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>
                {completedSegments} / {totalSegments} {t.completed.toLowerCase()}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {settings && (
          <div className="grid gap-3 sm:grid-cols-2 animate-fade-in-up stagger-1">
            <Card className="hover:shadow-md">
              <CardContent className="p-4 space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.splitStatus}</p>
                <p className="text-sm font-semibold">
                  {settings.splitEnabled ? t.splitActive : t.splitDisabled}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.segmentsPerMonth}: {settings.segmentsPerMonth} • {t.totalPages}: {settings.totalPages}
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.unclaimedUsers}</p>
                {unclaimedUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t.everyoneClaimed}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {unclaimedUsers.map((u) => (
                      <Badge key={u.id} variant="outline" className="text-xs">
                        {u.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Segments list */}
        {!cycle ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">{t.noSegments}</CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {cycle.segments.map((segment, i) => {
              const isClaimedByMe = segment.claim?.isMine;
              const isGloballyComplete = !!segment.claim?.completedAt;

              return (
                <Card
                  key={segment.id}
                  className={`animate-fade-in transition-all duration-300 hover:-translate-y-0.5 ${
                    isGloballyComplete ? 'border-green-500/30 bg-green-50/30 dark:bg-green-950/10' : ''
                  }`}
                  style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">
                            {t.segment} {segment.index + 1}
                          </span>
                          <Badge variant="outline" className="text-[11px]">
                            {t.pages}: {segment.startPage}–{segment.endPage}
                          </Badge>
                          {isGloballyComplete && (
                            <Badge variant="success" className="text-[11px]">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {t.globallyComplete}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {t.surahs}: {getSurahDisplay(segment.surahSpanJson)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.juz}: {getJuzDisplay(segment.juzSpanJson)}
                        </p>
                        {segment.claim && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {isGloballyComplete ? t.completed : t.claimed}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 w-full sm:w-auto flex flex-wrap items-center gap-2 justify-start sm:justify-end">
                        {isClaimedByMe ? (
                          <Badge variant="secondary" className="text-xs">
                            {t.alreadyClaimed}
                          </Badge>
                        ) : segment.claim ? (
                          <Badge variant="outline" className="text-xs">
                            {t.segmentTaken}
                          </Badge>
                        ) : (
                          <Button size="sm" onClick={() => setClaimModal(segment)} className="group">
                            <BookOpen className="h-4 w-4 mr-1 transition-transform duration-200 group-hover:scale-110" />
                            {t.claimSegment}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Claim Modal */}
      <Modal open={!!claimModal} onClose={() => setClaimModal(null)}>
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>
        <ModalTitle className="text-center">{t.claimTitle}</ModalTitle>
        <ModalDescription className="text-center">
          {claimModal &&
            t.claimWarning
              .replace('{start}', String(claimModal.startPage))
              .replace('{end}', String(claimModal.endPage))}
        </ModalDescription>
        <ModalFooter>
          <Button variant="outline" onClick={() => setClaimModal(null)}>
            {t.cancel}
          </Button>
          <Button onClick={() => claimModal && handleClaim(claimModal)} disabled={claiming}>
            {claiming ? t.loading : t.claimConfirm}
          </Button>
        </ModalFooter>
      </Modal>
    </Layout>
  );
}
