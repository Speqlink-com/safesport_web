"use client";

import { useState } from "react";
import { Award, Download, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publicCertificateApi, type PublicCertificateLookup } from "@/features/auth/api";

export default function PublicCertificateLookupPage() {
  const [safeSportId, setSafeSportId] = useState("");
  const [result, setResult] = useState<PublicCertificateLookup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const lookup = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const value = safeSportId.trim().toUpperCase();
    setResult(null);
    setMessage("");
    if (!value) {
      setMessage("Enter a SafeSport ID to check certificates.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await publicCertificateApi.lookupBySafeSportId(value);
      setResult(response);
      setSafeSportId(response.safesport_id);
      if (response.certificates.length === 0) {
        setMessage("This SafeSport ID is valid, but no certificates are available yet.");
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to verify that SafeSport ID.";
      setMessage(text);
      toast.error(text);
    } finally {
      setIsLoading(false);
    }
  };

  const certificate = result?.certificates[0];

  return (
    <main className="grid h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),linear-gradient(135deg,#f8fafc_0%,#eefdf6_45%,#ecfeff_100%)] p-4 text-slate-950 sm:p-6">
      <section className="mx-auto grid h-full w-full max-w-5xl items-center gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700 shadow-sm backdrop-blur">
            <ShieldCheck className="size-4" />
            SafeSport verify
          </div>
          <div className="space-y-3">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Check athlete certificates by SafeSport ID.
            </h1>
            <p className="max-w-lg text-base leading-7 text-slate-600">
              Enter the athlete&apos;s public SafeSport ID to retrieve issued onboarding and PPE participation certificates.
            </p>
          </div>
          <form onSubmit={lookup} className="flex max-w-xl gap-2 rounded-2xl border border-white/70 bg-white/80 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
            <Input
              value={safeSportId}
              onChange={(event) => setSafeSportId(event.target.value.toUpperCase())}
              placeholder="SAFE-DEG67H"
              className="h-12 border-0 bg-transparent font-mono text-base shadow-none focus-visible:ring-0"
              autoFocus
            />
            <Button type="submit" className="h-12 px-5" disabled={isLoading}>
              <Search className="mr-2 size-4" />
              {isLoading ? "Checking" : "Check"}
            </Button>
          </form>
          {message && <p className="max-w-xl rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700">{message}</p>}
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.14)] backdrop-blur sm:p-8">
          {result ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-emerald-700">SafeSport ID</p>
                  <p className="mt-1 font-mono text-2xl font-semibold tracking-wide">{result.safesport_id}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <Award className="size-7" />
                </div>
              </div>
              <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-slate-500">Athlete</p>
                  <p className="font-medium text-slate-950">{result.athlete_name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Sport</p>
                  <p className="font-medium text-slate-950">{result.sport || "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-slate-500">Institution</p>
                  <p className="font-medium text-slate-950">{result.institution || "—"}</p>
                </div>
              </div>
              {certificate ? (
                <div className="space-y-4 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Certificate found</p>
                      <h2 className="mt-2 text-xl font-semibold text-slate-950">{certificate.eligibility}</h2>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 font-mono text-xs text-slate-600 shadow-sm">{certificate.code}</span>
                  </div>
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-slate-500">Restrictions</dt>
                      <dd className="font-medium text-slate-950">{certificate.restrictions}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Review date</dt>
                      <dd className="font-medium text-slate-950">{certificate.review_date}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Signed by</dt>
                      <dd className="font-medium text-slate-950">{certificate.clinician_signature}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Issued</dt>
                      <dd className="font-medium text-slate-950">{certificate.issued_at ? certificate.issued_at.slice(0, 10) : "—"}</dd>
                    </div>
                  </dl>
                  <a href={certificate.download_url} download className="block">
                    <Button className="w-full" type="button">
                      <Download className="mr-2 size-4" />
                      Download certificate PDF
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-sm text-slate-600">
                  No certificate has been issued for this SafeSport ID yet.
                </div>
              )}
            </div>
          ) : (
            <div className="grid min-h-[420px] place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
              <div className="space-y-3">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="size-8" />
                </div>
                <p className="text-lg font-semibold text-slate-950">Ready to verify</p>
                <p className="max-w-sm text-sm leading-6 text-slate-600">
                  Certificate details appear here after a valid SafeSport ID is checked.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
