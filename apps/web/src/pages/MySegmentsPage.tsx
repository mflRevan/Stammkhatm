import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/Modal';
import { Layout } from '@/components/Layout';
import { CheckCircle2, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

interface Claim {
  id: string;
  claimedAt: string;
  completedAt: string | null;
  segment: {
    id: string;
    index: number;
    startPage: number;
    endPage: number;
    surahSpanJson: string;
    juzSpanJson: string;
  };
}

export function MySegmentsPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [completeModal, setCompleteModal] = useState<Claim | null>(null);
  const [completing, setCompleting] = useState(false);
  const [releaseModal, setReleaseModal] = useState<Claim | null>(null);
  const [releasing, setReleasing] = useState(false);

  const fetchClaims = async () => {
    try {
      const res = await api.get('/claims/mine');
      if (res.ok) {
        const data = await res.json();
        setClaims(data.claims || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [user]);

  const handleComplete = async (claim: Claim) => {
    setCompleting(true);
    try {
      const res = await api.post(`/claims/${claim.id}/complete`, {});
      if (res.ok) {
        await fetchClaims();
        setCompleteModal(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  const handleRelease = async (claim: Claim) => {
    setReleasing(true);
    try {
      const res = await api.post(`/claims/${claim.id}/release`, {});
      if (res.ok) {
        await fetchClaims();
        setReleaseModal(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReleasing(false);
    }
  };

  const getSurahDisplay = (json: string) => {
    try {
      const surahs = JSON.parse(json);
      return surahs
        .map((s: { number: number; nameEn: string; name: string }) =>
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
      return juzs.map((j: { number: number }) => `Juz ${j.number}`).join(', ');
    } catch {
      return '';
    }
  };

  const completedCount = claims.filter((c) => c.completedAt).length;
  const progressPercent = claims.length > 0 ? Math.round((completedCount / claims.length) * 100) : 0;

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
        <h1 className="text-2xl font-bold">{t.mySegments}</h1>

        {claims.length === 0 ? (
          <Card className="animate-fade-in-up">
            <CardContent className="py-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-2">
                <BookOpen className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{t.noClaimedSegments}</p>
              <Link to="/dashboard">
                <Button variant="outline" className="group">
                  {t.goToDashboard}
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Progress summary */}
            <Card className="animate-fade-in-up bg-gradient-to-r from-primary/5 to-transparent border-primary/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {completedCount} / {claims.length} {t.completed.toLowerCase()}
                  </span>
                  <span className="text-sm font-bold text-primary">{progressPercent}%</span>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              {claims.map((claim, i) => (
                <Card
                  key={claim.id}
                  className={`animate-fade-in transition-all duration-300 hover:-translate-y-0.5 ${
                    claim.completedAt ? 'border-green-500/30 bg-green-50/30 dark:bg-green-950/10' : ''
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">
                            {t.segment} {claim.segment.index + 1}
                          </span>
                          <Badge variant="outline" className="text-[11px]">
                            {t.pages}: {claim.segment.startPage}–{claim.segment.endPage}
                          </Badge>
                          {claim.completedAt && (
                            <Badge variant="success" className="text-[11px]">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {t.completed}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {t.surahs}: {getSurahDisplay(claim.segment.surahSpanJson)}
                        </p>
                        <p className="text-xs text-muted-foreground">{getJuzDisplay(claim.segment.juzSpanJson)}</p>
                      </div>

                      <div className="flex-shrink-0 flex items-center gap-2">
                        {claim.completedAt ? (
                          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {t.completedAt}:{' '}
                            {new Date(claim.completedAt).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US')}
                          </p>
                        ) : (
                          <>
                            <Button size="sm" onClick={() => setCompleteModal(claim)} className="group">
                              <CheckCircle2 className="h-4 w-4 mr-1 transition-transform duration-200 group-hover:scale-110" />
                              {t.markComplete}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setReleaseModal(claim)}>
                              {t.releaseSegment}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Complete Modal */}
      <Modal open={!!completeModal} onClose={() => setCompleteModal(null)}>
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <ModalTitle className="text-center">{t.completeTitle}</ModalTitle>
        <ModalDescription className="text-center">
          {completeModal &&
            t.completeWarning
              .replace('{start}', String(completeModal.segment.startPage))
              .replace('{end}', String(completeModal.segment.endPage))}
        </ModalDescription>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCompleteModal(null)}>
            {t.cancel}
          </Button>
          <Button onClick={() => completeModal && handleComplete(completeModal)} disabled={completing}>
            {completing ? t.loading : t.completeConfirm}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Release Modal */}
      <Modal open={!!releaseModal} onClose={() => setReleaseModal(null)}>
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-destructive" />
          </div>
        </div>
        <ModalTitle className="text-center">{t.releaseTitle}</ModalTitle>
        <ModalDescription className="text-center">
          {releaseModal &&
            t.releaseWarning
              .replace('{start}', String(releaseModal.segment.startPage))
              .replace('{end}', String(releaseModal.segment.endPage))}
        </ModalDescription>
        <ModalFooter>
          <Button variant="outline" onClick={() => setReleaseModal(null)}>
            {t.cancel}
          </Button>
          <Button variant="destructive" onClick={() => releaseModal && handleRelease(releaseModal)} disabled={releasing}>
            {releasing ? t.loading : t.releaseConfirm}
          </Button>
        </ModalFooter>
      </Modal>
    </Layout>
  );
}
