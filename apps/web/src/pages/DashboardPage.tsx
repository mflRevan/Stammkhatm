import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/Modal";
import { Layout } from "@/components/Layout";
import { BookOpen, Users, CheckCircle2 } from "lucide-react";

interface Segment {
  id: string;
  index: number;
  startPage: number;
  endPage: number;
  surahSpanJson: string;
  juzSpanJson: string;
  claims: {
    id: string;
    completedAt: string | null;
    user: { id: string; name: string };
  }[];
}

interface Cycle {
  id: string;
  monthKey: string;
  segments: Segment[];
}

export function DashboardPage() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimModal, setClaimModal] = useState<Segment | null>(null);
  const [claiming, setClaiming] = useState(false);

  const fetchCycle = async () => {
    try {
      const res = await api.get("/cycles/current");
      if (res.ok) {
        const data = await res.json();
        setCycle(data.cycle);
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
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(lang === "de" ? "de-DE" : "en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const getSurahDisplay = (json: string) => {
    try {
      const surahs = JSON.parse(json);
      return surahs
        .map((s: { number: number; name: string; nameEn: string; nameDe: string }) =>
          lang === "de" ? `${s.number}. ${s.name}` : `${s.number}. ${s.nameEn}`
        )
        .join(", ");
    } catch {
      return "";
    }
  };

  const getJuzDisplay = (json: string) => {
    try {
      const juzs = JSON.parse(json);
      return juzs.map((j: { number: number }) => j.number).join(", ");
    } catch {
      return "";
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
        <div>
          <h1 className="text-2xl font-bold">{t.dashboard}</h1>
          {cycle && (
            <p className="text-muted-foreground">
              {t.currentMonth}: {formatMonth(cycle.monthKey)}
            </p>
          )}
        </div>

        {!cycle ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              {t.noSegments}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {cycle.segments.map((segment) => {
              const isClaimedByMe = segment.claims.some((c) => c.user.id === user?.id);
              const isGloballyComplete = segment.claims.some((c) => c.completedAt);

              return (
                <Card key={segment.id} className={isGloballyComplete ? "border-green-500/30" : ""}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">
                            {t.segment} {segment.index + 1}
                          </span>
                          <Badge variant="outline">
                            {t.pages}: {segment.startPage}–{segment.endPage}
                          </Badge>
                          {isGloballyComplete && (
                            <Badge variant="success">
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
                        {segment.claims.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>
                              {segment.claims.length} {t.claimed}:{" "}
                              {segment.claims.map((c) => c.user.name).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        {isClaimedByMe ? (
                          <Badge variant="secondary">{t.alreadyClaimed}</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setClaimModal(segment)}
                          >
                            <BookOpen className="h-4 w-4 mr-1" />
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
        <ModalTitle>{t.claimTitle}</ModalTitle>
        <ModalDescription>
          {claimModal &&
            t.claimWarning
              .replace("{start}", String(claimModal.startPage))
              .replace("{end}", String(claimModal.endPage))}
        </ModalDescription>
        <ModalFooter>
          <Button variant="outline" onClick={() => setClaimModal(null)}>
            {t.cancel}
          </Button>
          <Button
            onClick={() => claimModal && handleClaim(claimModal)}
            disabled={claiming}
          >
            {claiming ? t.loading : t.claimConfirm}
          </Button>
        </ModalFooter>
      </Modal>
    </Layout>
  );
}
