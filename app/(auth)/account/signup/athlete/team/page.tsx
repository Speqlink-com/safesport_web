"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, CheckCircleIcon, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { catalogApi, type CatalogInstitution } from "@/features/auth/api";

export default function AthleteTeamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firstName = searchParams.get("firstName") || "";
  const lastName = searchParams.get("lastName") || "";
  const dob = searchParams.get("dob") || "";
  const [institutions, setInstitutions] = useState<CatalogInstitution[]>([]);
  const [search, setSearch] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState(searchParams.get("orgId") || "");
  const [selectedSportId, setSelectedSportId] = useState(searchParams.get("sportId") || "");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firstName || !lastName || !dob) {
      router.replace("/account/signup/athlete/name");
      return;
    }
    catalogApi.institutions().then(setInstitutions).catch((error) => {
      toast.error(error instanceof Error ? error.message : "Unable to load institutions");
    }).finally(() => setIsLoading(false));
  }, [dob, firstName, lastName, router]);

  const filteredInstitutions = useMemo(
    () => institutions.filter((item) => item.type !== "medical" && item.name.toLowerCase().includes(search.toLowerCase())),
    [institutions, search],
  );
  const selectedInstitution = institutions.find((item) => item.id === selectedOrgId);
  const selectedSport = selectedInstitution?.sports.find((item) => item.id === selectedSportId);

  const selectInstitution = (institution: CatalogInstitution) => {
    setSelectedOrgId(institution.id);
    if (!institution.sports.some((sport) => sport.id === selectedSportId)) setSelectedSportId("");
  };
  const handleNext = () => {
    if (!selectedInstitution || !selectedSport) return;
    const params = new URLSearchParams({
      firstName,
      lastName,
      dob,
      orgId: selectedInstitution.id,
      orgName: selectedInstitution.name,
      sportId: selectedSport.id,
      sportName: selectedSport.name,
    });
    router.push(`/account/signup/athlete/account?${params.toString()}`);
  };
  const handleBack = () => {
    const params = new URLSearchParams({ firstName, lastName, dob });
    router.push(`/account/signup/athlete/dob?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-2xl space-y-8">
      <Button onClick={handleBack} variant="ghost" size="sm"><ArrowLeftIcon className="mr-2 size-4" />Back</Button>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground"><span>Step 3 of 6</span><span>50%</span></div>
        <Progress value={50} />
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Which institution are you part of?</h1>
          <p className="text-muted-foreground">Choose your institution and the sport you participate in.</p>
        </div>
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by institution name..." autoFocus />
        {isLoading ? (
          <div className="flex justify-center py-10"><LoaderCircle className="size-6 animate-spin text-primary" /></div>
        ) : filteredInstitutions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No active institutions match your search.</div>
        ) : (
          <div className="max-h-[320px] space-y-3 overflow-y-auto">
            {filteredInstitutions.map((institution) => (
              <Card key={institution.id} className={`cursor-pointer p-4 transition-all hover:border-primary ${selectedOrgId === institution.id ? "border-primary bg-primary/5" : ""}`} onClick={() => selectInstitution(institution)}>
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    {institution.logo_url && <AvatarImage src={institution.logo_url} alt={institution.name} />}
                    <AvatarFallback>{institution.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1"><p className="font-semibold">{institution.name}</p><p className="text-sm capitalize text-muted-foreground">{institution.type} · {institution.city}, {institution.country}</p></div>
                  {selectedOrgId === institution.id && <CheckCircleIcon className="size-5 text-primary" />}
                </div>
              </Card>
            ))}
          </div>
        )}
        {selectedInstitution && (
          <div className="space-y-3">
            <div><h2 className="font-semibold">Which sport do you play?</h2><p className="text-sm text-muted-foreground">Sports offered by {selectedInstitution.name}</p></div>
            {selectedInstitution.sports.length === 0 ? (
              <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">This institution has no active sports configured. Contact your institution administrator.</div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {selectedInstitution.sports.map((sport) => (
                  <Button key={sport.id} type="button" variant={selectedSportId === sport.id ? "default" : "outline"} className="justify-between" onClick={() => setSelectedSportId(sport.id)}>
                    {sport.name}{selectedSportId === sport.id && <CheckCircleIcon className="size-4" />}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="flex justify-center pt-4"><Button onClick={handleNext} disabled={!selectedOrgId || !selectedSportId} size="lg">Continue</Button></div>
      </div>
    </div>
  );
}
