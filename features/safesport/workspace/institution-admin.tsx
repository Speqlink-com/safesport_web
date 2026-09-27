"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Building2, LoaderCircle, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  systemAdminApi,
  type CatalogInstitution,
  type CatalogSport,
} from "@/features/auth/api";
import { Choice, Empty, PageHeading, Panel, Status } from "./ui";

type InstitutionType = CatalogInstitution["type"];
interface InstitutionDraft {
  id?: string;
  name: string;
  type: InstitutionType;
  city: string;
  country: string;
  contactEmail: string;
  isActive: boolean;
  sportIds: string[];
  logo: File | null;
}

const emptyDraft: InstitutionDraft = {
  name: "",
  type: "school",
  city: "",
  country: "Kenya",
  contactEmail: "",
  isActive: true,
  sportIds: [],
  logo: null,
};

export function SystemAdminInstitutions() {
  const [institutions, setInstitutions] = useState<CatalogInstitution[]>([]);
  const [sports, setSports] = useState<CatalogSport[]>([]);
  const [draft, setDraft] = useState<InstitutionDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [institutionRows, sportRows] = await Promise.all([
        systemAdminApi.institutions(),
        systemAdminApi.sports(),
      ]);
      setInstitutions(institutionRows);
      setSports(sportRows.filter((sport) => sport.is_active));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load institutions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.all([systemAdminApi.institutions(), systemAdminApi.sports()])
      .then(([institutionRows, sportRows]) => {
        if (!active) return;
        setInstitutions(institutionRows);
        setSports(sportRows.filter((sport) => sport.is_active));
      })
      .catch((error) => {
        if (active) toast.error(error instanceof Error ? error.message : "Unable to load institutions");
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const edit = (institution: CatalogInstitution) => setDraft({
    id: institution.id,
    name: institution.name,
    type: institution.type,
    city: institution.city,
    country: institution.country,
    contactEmail: institution.contact_email ?? "",
    isActive: institution.is_active,
    sportIds: institution.sports.map((sport) => sport.id),
    logo: null,
  });

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    if (draft.sportIds.length === 0) {
      toast.error("Select at least one sport offered by this institution");
      return;
    }
    const form = new FormData();
    form.set("name", draft.name);
    form.set("type", draft.type);
    form.set("city", draft.city);
    form.set("country", draft.country);
    form.set("contact_email", draft.contactEmail);
    form.set("is_active", String(draft.isActive));
    draft.sportIds.forEach((sportId) => form.append("sport_ids", sportId));
    if (draft.logo) form.set("logo", draft.logo);
    setIsSaving(true);
    try {
      await systemAdminApi.saveInstitution(form, draft.id);
      toast.success(draft.id ? "Institution updated" : "Institution onboarded");
      setDraft(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save institution");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageHeading title="Institutions" description="Onboard institutions and configure the sports available during athlete registration.">
        <Button onClick={() => setDraft({ ...emptyDraft })}><Plus className="size-4" />Onboard institution</Button>
      </PageHeading>
      <Panel title="Institution directory" description="Only active institutions appear in athlete signup.">
        {isLoading ? (
          <div className="flex justify-center py-12"><LoaderCircle className="size-6 animate-spin text-primary" /></div>
        ) : institutions.length === 0 ? (
          <Empty title="No institutions yet" description="Onboard the first institution to make it available during athlete registration." />
        ) : (
          <div className="divide-y divide-border/60">
            {institutions.map((institution) => (
              <div key={institution.id} className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                <Avatar className="size-12">
                  {institution.logo_url && <AvatarImage src={institution.logo_url} alt={institution.name} />}
                  <AvatarFallback><Building2 className="size-5" /></AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{institution.name}</p><Status value={institution.is_active ? "active" : "inactive"} /></div>
                  <p className="text-sm capitalize text-muted-foreground">{institution.type} · {institution.city}, {institution.country}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{institution.sports.map((sport) => sport.name).join(" · ") || "No sports configured"}</p>
                </div>
                <Button variant="outline" onClick={() => edit(institution)}>Edit profile</Button>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit institution" : "Onboard institution"}</DialogTitle>
            <DialogDescription>Institution details and offered sports are used directly in athlete registration.</DialogDescription>
          </DialogHeader>
          {draft && (
            <form className="space-y-4" onSubmit={save}>
              <div className="space-y-2"><Label htmlFor="institution-name">Institution name</Label><Input id="institution-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></div>
              <Choice label="Institution type" value={draft.type} onChange={(value) => setDraft({ ...draft, type: value as InstitutionType })} options={["school", "club", "academy", "professional", "medical"]} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="institution-city">City</Label><Input id="institution-city" value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} required /></div>
                <div className="space-y-2"><Label htmlFor="institution-country">Country</Label><Input id="institution-country" value={draft.country} onChange={(event) => setDraft({ ...draft, country: event.target.value })} required /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="institution-email">Contact email</Label><Input id="institution-email" type="email" value={draft.contactEmail} onChange={(event) => setDraft({ ...draft, contactEmail: event.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="institution-logo">Institution logo</Label><Input id="institution-logo" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setDraft({ ...draft, logo: event.target.files?.[0] ?? null })} /><p className="text-xs text-muted-foreground">JPG, PNG or WebP, up to 2 MB.</p></div>
              <fieldset className="space-y-3"><legend className="text-sm font-medium">Sports offered</legend>
                {sports.length === 0 ? <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Create sports in Configuration → Sports before onboarding an institution.</p> : (
                  <div className="grid gap-3 sm:grid-cols-2">{sports.map((sport) => {
                    const selected = draft.sportIds.includes(sport.id);
                    return <label key={sport.id} className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm"><Checkbox checked={selected} onCheckedChange={(checked) => setDraft({ ...draft, sportIds: checked ? [...draft.sportIds, sport.id] : draft.sportIds.filter((id) => id !== sport.id) })} />{sport.name}</label>;
                  })}</div>
                )}
              </fieldset>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={draft.isActive} onCheckedChange={(checked) => setDraft({ ...draft, isActive: checked === true })} />Active and visible during athlete signup</label>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDraft(null)}>Cancel</Button><Button type="submit" disabled={isSaving}>{isSaving ? "Saving…" : "Save institution"}</Button></div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SystemAdminSports() {
  const [sports, setSports] = useState<CatalogSport[]>([]);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const load = useCallback(async () => {
    try { setSports(await systemAdminApi.sports()); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to load sports"); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    void systemAdminApi.sports()
      .then((rows) => { if (active) setSports(rows); })
      .catch((error) => { if (active) toast.error(error instanceof Error ? error.message : "Unable to load sports"); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);
  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try { await systemAdminApi.createSport(name); setName(""); toast.success("Sport added"); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to add sport"); }
    finally { setIsSaving(false); }
  };
  return (
    <>
      <PageHeading title="Sports catalogue" description="Manage the sports System Administrators can assign to institutions." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Available sports">
          {isLoading ? <LoaderCircle className="mx-auto size-6 animate-spin text-primary" /> : sports.length === 0 ? <Empty title="No sports configured" description="Add the first sport to begin institution onboarding." /> : (
            <div className="divide-y divide-border/60">{sports.map((sport) => <div key={sport.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0"><span className="font-medium">{sport.name}</span><Status value={sport.is_active ? "active" : "inactive"} /></div>)}</div>
          )}
        </Panel>
        <Panel title="Add sport"><form className="space-y-4" onSubmit={create}><div className="space-y-2"><Label htmlFor="sport-name">Sport name</Label><Input id="sport-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Swimming" required minLength={2} /></div><Button type="submit" disabled={isSaving || name.trim().length < 2} className="w-full">{isSaving ? "Adding…" : "Add sport"}</Button></form></Panel>
      </div>
    </>
  );
}
