"use client";
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Field,
  Choice,
  Check,
  Panel,
  Go,
} from "@/features/safesport/workspace/ui";
import {
  roles,
  type Role,
  identities,
  href,
} from "@/features/safesport/workspace/catalog";
import {
  useWorkspace,
  newId,
  today,
  fullName,
} from "@/features/safesport/workspace/store";
import { makeAthlete } from "@/features/safesport/workspace/people";
export default function DemoAuth() {
  const path = usePathname();
  return (
    <div className="w-full max-w-lg space-y-6">
      <p className="rounded-lg border bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">
        Frontend preview · No real account is created. Use demonstration
        details. Changes reset when you refresh.
      </p>
      {path.includes("/signup/athlete") ? (
        <Signup kind="athlete" />
      ) : path.includes("/signup/guardian") ? (
        <Signup kind="guardian" />
      ) : path.includes("/request-demo") ? (
        <DemoRequest />
      ) : path.endsWith("/signup") ? (
        <ChooseSignup />
      ) : path.includes("forgot-password") ? (
        <Recovery />
      ) : path.includes("reset-pasword") || path.includes("reset-password") ? (
        <Reset />
      ) : path.includes("verify-otp") ? (
        <Verification />
      ) : (
        <SignIn />
      )}
    </div>
  );
}
function SignIn() {
  const { state, setState } = useWorkspace();
  const router = useRouter();
  const [role, setRole] = useState<Role>("clinician");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [provider, setProvider] = useState("");
  const next = () => {
    setState((s) => ({
      ...s,
      registration: {
        ...s.registration,
        signinRole: role,
        signinEmail: email,
        recovery: "false",
      },
    }));
    setPassword("");
    router.push("/account/verify-otp");
  };
  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome to SafeSport
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Smarter sport. Safer athletes. Explore your role’s workspace.
        </p>
      </div>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (password.length < 8) {
            toast.error("Use at least 8 characters for the demo password.");
            return;
          }
          next();
        }}
      >
        <Choice
          label="Demo workspace"
          value={role}
          onChange={(v) => setRole(v as Role)}
          options={roles.map((r) => ({ value: r, label: identities[r].title }))}
        />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />
        <Field
          label="Demo password"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />
        <Link
          className="block text-sm underline"
          href="/account/forgot-password"
        >
          Forgot password?
        </Link>
        <Button type="submit" className="w-full">
          Continue to verification preview
        </Button>
      </form>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => setProvider("Google")}>
          <FcGoogle />
          Google
        </Button>
        <Button variant="outline" onClick={() => setProvider("Facebook")}>
          <FaFacebook className="text-blue-600" />
          Facebook
        </Button>
      </div>
      <Button
        className="w-full"
        variant="secondary"
        onClick={() => router.push(href(role))}
      >
        Explore {state.accounts[role]?.name || identities[role].name}’s demo
      </Button>
      <p className="text-center text-sm">
        New to SafeSport?{" "}
        <Link href="/account/signup" className="underline">
          Create a demo profile
        </Link>
      </p>
      <Dialog open={!!provider} onOpenChange={(v) => !v && setProvider("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{provider} sign-in preview</DialogTitle>
            <DialogDescription>
              OAuth is not connected. Continue to the selected role’s demo
              without contacting {provider}.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => router.push(href(role))}>
            Open demo workspace
          </Button>
          <Button variant="outline" onClick={() => setProvider("")}>
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
function Verification() {
  const { state } = useWorkspace();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [resent, setResent] = useState(false);
  const recovery = state.registration.recovery === "true";
  const selected = roles.includes(state.registration.signinRole as Role)
    ? (state.registration.signinRole as Role)
    : "clinician";
  return (
    <>
      <h1 className="text-3xl font-semibold">Verification preview</h1>
      <p className="text-sm text-muted-foreground">
        No email is sent. Enter demo code <strong>1234</strong> to continue.
      </p>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (code !== "1234") {
            toast.error("Enter the demonstration code 1234.");
            return;
          }
          router.push(recovery ? "/account/reset-password" : href(selected));
        }}
      >
        <Field
          label="Four-digit demo code"
          value={code}
          onChange={setCode}
          required
        />
        <Button type="submit">Verify demo code</Button>
      </form>
      <Button
        variant="ghost"
        onClick={() => {
          setResent(true);
          toast.info("Demo code is still 1234. No email was sent.");
        }}
      >
        {resent ? "Show demo code again" : "Resend code preview"}
      </Button>
      <Go to="/account/signin" secondary>
        Back to sign in
      </Go>
    </>
  );
}
function Recovery() {
  const { setState } = useWorkspace();
  const [email, setEmail] = useState("");
  const router = useRouter();
  return (
    <>
      <h1 className="text-3xl font-semibold">Reset password</h1>
      <p className="text-sm text-muted-foreground">
        Preview the recovery flow. No account lookup or email delivery takes
        place.
      </p>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setState((s) => ({
            ...s,
            registration: {
              ...s.registration,
              recovery: "true",
              recoveryEmail: email,
            },
          }));
          router.push("/account/verify-otp");
        }}
      >
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />
        <Button type="submit">Continue recovery preview</Button>
      </form>
      <Go to="/account/signin" secondary>
        Back to sign in
      </Go>
    </>
  );
}
function Reset() {
  const { setState } = useWorkspace();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  return (
    <>
      <h1 className="text-3xl font-semibold">Choose a demo password</h1>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (password.length < 8 || password !== confirm) {
            toast.error("Use matching passwords with at least 8 characters.");
            return;
          }
          setState((s) => ({
            ...s,
            registration: { ...s.registration, recovery: "false" },
          }));
          setPassword("");
          setConfirm("");
          toast.success(
            "Validation complete. No real credentials were changed.",
          );
          router.push("/account/signin");
        }}
      >
        <Field
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />
        <Field
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          required
        />
        <Button type="submit">Complete reset preview</Button>
      </form>
    </>
  );
}
function ChooseSignup() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Join SafeSport</h1>
      <p className="text-sm text-muted-foreground">
        Choose the profile you want to demonstrate.
      </p>
      <div className="grid gap-4">
        {[
          {
            title: "Athlete",
            description: "Your health, participation and care journey.",
            path: "signup/athlete/name",
          },
          {
            title: "Parent or guardian",
            description:
              "Support a linked minor with consent and care coordination.",
            path: "signup/guardian/name",
          },
          {
            title: "Institution",
            description: "Preview an institution demo request.",
            path: "request-demo/type",
          },
        ].map((c) => (
          <Panel key={c.path} title={c.title} description={c.description}>
            <Go to={`/account/${c.path}`}>Continue</Go>
          </Panel>
        ))}
      </div>
      <Go to="/account/signin" secondary>
        Back to sign in
      </Go>
    </>
  );
}
function Signup({ kind }: { kind: "athlete" | "guardian" }) {
  const { state, setState, update } = useWorkspace();
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const path = usePathname();
  const steps =
    kind === "athlete"
      ? ["name", "dob", "team", "account", "verify", "review"]
      : ["name", "relationship", "find-athlete", "account", "verify", "review"];
  const current = path.split("/").at(-1) || "name";
  const index = Math.max(0, steps.indexOf(current));
  const step = steps[index];
  const prefix = `${kind}-`;
  const form = Object.fromEntries(
    Object.entries(state.registration)
      .filter(([k]) => k.startsWith(prefix))
      .map(([k, v]) => [k.slice(prefix.length), v]),
  );
  const set = (key: string, value: string) =>
    setState((s) => ({
      ...s,
      registration: { ...s.registration, [`${prefix}${key}`]: value },
    }));
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [search, setSearch] = useState("");
  const minors = state.athletes.filter(
    (a) =>
      a.age < 18 &&
      `${fullName(a)} ${a.id}`.toLowerCase().includes(search.toLowerCase()),
  );
  const go = (i: number) =>
    startTransition(() => router.push(`/account/signup/${kind}/${steps[i]}`));
  const errors = () => {
    const list: string[] = [];
    if (!form.firstName?.trim() || !form.lastName?.trim())
      list.push("Full name");
    if (kind === "athlete" && (!form.dob || form.dob > today))
      list.push("Valid date of birth");
    if (kind === "athlete" && !form.team) list.push("Team");
    if (
      kind === "athlete" &&
      form.dob &&
      makeAthlete(state, form, "draft").age < 18 &&
      !form.guardian?.trim()
    )
      list.push("Guardian name");
    if (
      kind === "guardian" &&
      (!form.relationship ||
        !state.athletes.some((a) => a.id === form.athlete && a.age < 18))
    )
      list.push("Relationship and linked minor");
    if (!form.email || form.verified !== "true")
      list.push("Account and demo verification");
    if (kind === "athlete" && (!form.contact || !form.phone))
      list.push("Emergency contact");
    return list;
  };
  function next() {
    if (step === "account") {
      if (password.length < 8) {
        toast.error("Use at least 8 characters. The password is not stored.");
        return;
      }
      set("verified", "false");
      setPassword("");
    }
    if (step === "verify") {
      if (code !== "1234") {
        toast.error("Use demonstration code 1234.");
        return;
      }
      set("verified", "true");
    }
    if (step === "find-athlete" && !form.athlete) {
      toast.error("Select a linked minor for this demo.");
      return;
    }
    if (step === "team" && !form.team) {
      toast.error("Choose a team.");
      return;
    }
    go(index + 1);
  }
  function finish() {
    const missing = errors();
    if (missing.length) {
      toast.error(`Complete: ${missing.join(", ")}`);
      return;
    }
    if (kind === "athlete") {
      const a = makeAthlete(state, form, newId("ATH"));
      update(
        (s) => ({
          ...s,
          athletes: [a, ...s.athletes],
          athleteId: a.id,
          accounts: {
            ...s.accounts,
            athlete: {
              name: fullName(a),
              email: form.email,
              phone: form.phone,
            },
          },
          registration: {
            ...s.registration,
            [`${a.id}-emergency`]: `${form.contact} · ${form.phone}`,
          },
        }),
        "Demo athlete onboarding completed",
        "athlete",
        "consent",
      );
      router.push(href("athlete", "consent"));
    } else {
      update(
        (s) => ({
          ...s,
          guardianId: form.athlete,
          accounts: {
            ...s.accounts,
            guardian: {
              name: `${form.firstName} ${form.lastName}`,
              email: form.email,
              phone: form.phone || "",
            },
          },
        }),
        "Demo guardian linked to minor",
        "guardian",
        "consent",
      );
      router.push(href("guardian", "consent"));
    }
  }
  return (
    <>
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {kind} onboarding · Step {index + 1} of {steps.length}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          {
            (
              {
                name: "Tell us your name",
                dob: "About the athlete",
                team: "Your team and emergency contact",
                relationship: "Your relationship",
                "find-athlete": "Link a minor athlete",
                account: "Your demo account",
                verify: "Verify your demo details",
                review: "Review your profile",
              } as Record<string, string>
            )[step]
          }
        </h1>
      </div>
      <Progress value={((index + 1) / steps.length) * 100} />
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (step === "review") finish();
          else next();
        }}
      >
        {step === "name" && (
          <>
            <Field
              label="First name"
              value={form.firstName || ""}
              onChange={(v) => set("firstName", v)}
              required
            />
            <Field
              label="Last name"
              value={form.lastName || ""}
              onChange={(v) => set("lastName", v)}
              required
            />
          </>
        )}
        {step === "dob" && (
          <>
            <Field
              label="Date of birth"
              type="date"
              min="1920-01-01"
              max={today}
              value={form.dob || ""}
              onChange={(v) => set("dob", v)}
              required
            />
            <Choice
              label="Sex"
              value={form.gender || "other"}
              onChange={(v) => set("gender", v)}
              options={["male", "female", "other"]}
            />
            <Field
              label="Guardian name (required for minors)"
              value={form.guardian || ""}
              onChange={(v) => set("guardian", v)}
            />
          </>
        )}
        {step === "relationship" && (
          <>
            <Choice
              label="Relationship"
              value={form.relationship || ""}
              onChange={(v) => set("relationship", v)}
              options={["parent", "legal_guardian", "other"]}
            />
            <Field
              label="Contact phone"
              type="tel"
              value={form.phone || ""}
              onChange={(v) => set("phone", v)}
              required
            />
          </>
        )}
        {step === "find-athlete" && (
          <>
            <p className="text-sm text-muted-foreground">
              Demo directory only. Real guardian linking will require
              verification in the backend phase.
            </p>
            <Field
              label="Search minor by name or SafeSport ID"
              value={search}
              onChange={setSearch}
            />
            <Choice
              label="Linked minor"
              value={form.athlete || ""}
              onChange={(v) => set("athlete", v)}
              options={minors.map((a) => ({
                value: a.id,
                label: `${fullName(a)} · ${a.id}`,
              }))}
            />
          </>
        )}
        {step === "team" && (
          <>
            <Choice
              label="Institution and team"
              value={form.team || ""}
              onChange={(v) => set("team", v)}
              options={state.teams.map((t) => ({
                value: t.id,
                label: `${state.organizations.find((o) => o.id === t.organizationId)?.name} · ${t.name}`,
              }))}
            />
            <Field
              label="Emergency contact name"
              value={form.contact || ""}
              onChange={(v) => set("contact", v)}
              required
            />
            <Field
              label="Emergency contact phone"
              type="tel"
              value={form.phone || ""}
              onChange={(v) => set("phone", v)}
              required
            />
          </>
        )}
        {step === "account" && (
          <>
            <Field
              label="Email"
              type="email"
              value={form.email || ""}
              onChange={(v) => set("email", v)}
              required
            />
            <Field
              label="Demo password (not stored)"
              type="password"
              value={password}
              onChange={setPassword}
              required
            />
            <p className="text-xs text-muted-foreground">
              Clinical consent will be collected separately after registration.
            </p>
          </>
        )}
        {step === "verify" && (
          <>
            <p className="text-sm text-muted-foreground">
              No message is sent. Enter <strong>1234</strong> to verify the
              demonstration flow.
            </p>
            <Field
              label="Demo verification code"
              value={code}
              onChange={setCode}
              required
            />
            <Button
              variant="ghost"
              onClick={() => toast.info("Demo code: 1234. No email was sent.")}
            >
              Show code again
            </Button>
          </>
        )}
        {step === "review" && (
          <>
            <Panel
              title={`${form.firstName || "Missing first name"} ${form.lastName || ""}`}
            >
              <p className="text-sm">{form.email || "Email incomplete"}</p>
              <p className="text-sm">
                {kind === "athlete"
                  ? `${form.dob || "DOB incomplete"} · ${state.teams.find((t) => t.id === form.team)?.name || "Team incomplete"}`
                  : `${form.relationship || "Relationship incomplete"} · ${fullName(state.athletes.find((a) => a.id === form.athlete))}`}
              </p>
              <p className="text-sm">
                {form.contact && `${form.contact} · `}
                {form.phone || "Contact incomplete"}
              </p>
              <p className="text-xs text-muted-foreground">
                Clinical consent: not yet completed. Eligibility: pending
                clinician evaluation.
              </p>
            </Panel>
            {errors().length > 0 && (
              <p role="alert" className="text-sm text-destructive">
                Incomplete: {errors().join(", ")}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {steps.slice(0, 4).map((s, i) => (
                <Button variant="outline" key={s} onClick={() => go(i)}>
                  Edit {s.replaceAll("-", " ")}
                </Button>
              ))}
            </div>
          </>
        )}
        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={() =>
              index ? go(index - 1) : router.push("/account/signup")
            }
          >
            Back
          </Button>
          <Button type="submit" disabled={navigating}>
            {step === "review" ? "Complete demo profile" : "Next"}
          </Button>
        </div>
      </form>
    </>
  );
}
function DemoRequest() {
  const { state, setState } = useWorkspace();
  const router = useRouter();
  const path = usePathname();
  const steps = ["type", "details", "contact", "success"];
  const step = path.split("/").at(-1) || "type";
  const index = Math.max(0, steps.indexOf(step));
  const get = (k: string) => state.registration[`demo-${k}`] || "";
  const set = (k: string, v: string) =>
    setState((s) => ({
      ...s,
      registration: { ...s.registration, [`demo-${k}`]: v },
    }));
  const [agreement, setAgreement] = useState(false);
  if (step === "success")
    return (
      <>
        <h1 className="text-3xl font-semibold">Demo request prepared</h1>
        <p className="text-sm text-muted-foreground">
          {get("name") || "Your organization"} ·{" "}
          {get("email") || "Contact not entered"}. This request exists only in
          this tab; nothing was sent.
        </p>
        <Go to={href("institution")}>Explore institution workspace</Go>
        <Go to="/account/request-demo/contact" secondary>
          Edit contact
        </Go>
      </>
    );
  return (
    <>
      <h1 className="text-3xl font-semibold">Institution demo request</h1>
      <Progress value={((index + 1) / 3) * 100} />
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (index === 0 && !get("type")) {
            toast.error("Choose an organization type.");
            return;
          }
          if (index === 2 && !agreement) {
            toast.error("Acknowledge this is a local preview.");
            return;
          }
          router.push(`/account/request-demo/${steps[index + 1]}`);
        }}
      >
        {index === 0 && (
          <Choice
            label="Organization type"
            value={get("type")}
            onChange={(v) => set("type", v)}
            options={["school", "club", "academy", "professional", "medical"]}
          />
        )}{" "}
        {index === 1 && (
          <>
            <Field
              label="Organization name"
              value={get("name")}
              onChange={(v) => set("name", v)}
              required
            />
            <Field
              label="Number of athletes"
              type="number"
              min={1}
              value={get("count")}
              onChange={(v) => set("count", v)}
              required
            />
            <Field
              label="Location"
              value={get("location")}
              onChange={(v) => set("location", v)}
              required
            />
          </>
        )}
        {index === 2 && (
          <>
            <Field
              label="Contact person"
              value={get("contact")}
              onChange={(v) => set("contact", v)}
              required
            />
            <Field
              label="Work email"
              type="email"
              value={get("email")}
              onChange={(v) => set("email", v)}
              required
            />
            <Check
              label="I understand this request is a local frontend preview and will not be sent."
              checked={agreement}
              onChange={setAgreement}
            />
          </>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(
                index
                  ? `/account/request-demo/${steps[index - 1]}`
                  : "/account/signup",
              )
            }
          >
            Back
          </Button>
          <Button type="submit">
            {index === 2 ? "Prepare demo request" : "Next"}
          </Button>
        </div>
      </form>
    </>
  );
}
