import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/Modal";
import { Layout } from "@/components/Layout";
import { CheckCircle2, BookOpen } from "lucide-react";

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

  const fetchClaims = async () => {
    try {
      const res = await api.get("/cycles/current");
      if (res.ok) {
        const data = await res.json();
        const userClaims: Claim[] = [];
        for (const segment of data.cycle?.segments || []) {
          for (const claim of segment.claims) {
            if (claim.user.id === user?.id) {
              userClaims.push({
                id: claim.id,
                claimedAt: claim.claimedAt,
                completedAt: claim.completedAt,
                segment: {
                  id: segment.id,
                  index: segment.index,
                  startPage: segment.startPage,
                  endPage: segment.endPage,
                  surahSpanJson: segment.surahSpanJson,
                  juzSpanJson: segment.juzSpanJson,
                },
              });
            }
          }
        }
        setClaims(userClaims);
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

  const getSurahDisplay = (json: string) => {
    try {
      const surahs = JSON.parse(json);
      return surahs
        .map((s: { number: number; nameEn: string; name: string }) =>
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
      return juzs.map((j: { number: number }) => `Juz ${j.number}`).join(", ");
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
        <h1 className="text-2xl font-bold">{t.mySegments}</h1>

        {claims.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center space-y-4">
              <p className="text-muted-foreground">{t.noClaimedSegments}</p>
              <Link to="/dashboard">
                <Button variant="outline">{t.goToDashboard}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {claims.map((claim) => (
              <Card
                key={claim.id}
                className={claim.completedAt ? "border-green-500/30" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">
                          {t.segment} {claim.segment.index + 1}
                        </span>
                        <Badge variant="outline">
                          {t.pages}: {claim.segment.startPage}–{claim.segment.endPage}
                        </Badge>
                        {claim.completedAt && (
                          <Badge variant="success">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {t.completed}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t.surahs}: {getSurahDisplay(claim.segment.surahSpanJson)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getJuzDisplay(claim.segment.juzSpanJson)}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      {claim.completedAt ? (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {t.completedAt}:{" "}
                          {new Date(claim.completedAt).toLocaleDateString(
                            lang === "de" ? "de-DE" : "en-US"
                          )}
                        </p>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setCompleteModal(claim)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          {t.markComplete}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Complete Modal */}
      <Modal open={!!completeModal} onClose={() => setCompleteModal(null)}>
        <ModalTitle>{t.completeTitle}</ModalTitle>
        <ModalDescription>
          {completeModal &&
            t.completeWarning
              .replace("{start}", String(completeModal.segment.startPage))
              .replace("{end}", String(completeModal.segment.endPage))}
        </ModalDescription>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCompleteModal(null)}>
            {t.cancel}
          </Button>
          <Button
            onClick={() => completeModal && handleComplete(completeModal)}
            disabled={completing}
          >
            {completing ? t.loading : t.completeConfirm}
          </Button>
        </ModalFooter>
      </Modal>
    </Layout>
  );
}
