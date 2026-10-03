import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShieldCheckIcon,
  LockIcon,
  UserCheckIcon,
  ActivityIcon,
  VideoIcon,
  UsersIcon,
  BuildingIcon,
  MailIcon,
  KeyRoundIcon,
  ServerIcon,
} from "lucide-react";

// ─── Section anchor IDs ────────────────────────────────────────────────────────
const sections = [
  { id: "about",       label: "About this Notice" },
  { id: "information", label: "Information We Handle" },
  { id: "how-used",    label: "How It Is Used" },
  { id: "health",      label: "Athlete Health Information" },
  { id: "screening",   label: "Movement Screening & Video" },
  { id: "minors",      label: "Minors & Guardian Consent" },
  { id: "access",      label: "Who Can Access Information" },
  { id: "security",    label: "Security Safeguards" },
  { id: "institutional","label": "Institutional Use" },
  { id: "requests",    label: "Data & Account Requests" },
  { id: "contact",     label: "Contact" },
  { id: "updates",     label: "Updates to this Notice" },
];

// ─── Small section heading component ─────────────────────────────────────────
function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-xl font-semibold tracking-tight mb-3"
    >
      {children}
    </h2>
  );
}

// ─── Subtle callout block ─────────────────────────────────────────────────────
function Callout({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 my-4">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* ── Hero ── */}
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          AYOT SafeSport™
        </p>
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Privacy Notice
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          How SafeSport handles athlete, health and platform information.
        </p>
      </div>

      {/* ── Quick summary strip ── */}
      <div className="mb-10 rounded-xl border bg-muted/30 px-6 py-5">
        <p className="text-sm font-semibold mb-3">
          SafeSport handles information to support:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {[
            "Athlete registration and identity",
            "Pre-participation health assessment",
            "Health and injury records",
            "Movement screening and analysis",
            "Rehabilitation and follow-up",
            "Participation and eligibility monitoring",
            "Clinical care co-ordination",
            "Institutional sports health services",
            "Safeguarding and consent",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-column layout: sidebar + content ── */}
      <div className="flex gap-12 items-start">
        {/* Sticky sidebar — desktop only */}
        <aside className="hidden lg:block w-52 shrink-0 sticky top-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            On this page
          </p>
          <nav className="space-y-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <article className="flex-1 min-w-0 max-w-[720px] space-y-10 text-sm leading-7">

          {/* 1 — About */}
          <section>
            <SectionHeading id="about">1. About this Privacy Notice</SectionHeading>
            <p>
              This notice describes how <strong>AYOT SafeSport™</strong>, a
              platform provided by <strong>Ayot Health Solutions Limited</strong>,
              handles personal and health information within the SafeSport
              platform and associated services.
            </p>
            <p className="mt-3">
              SafeSport is a clinically led athlete health and safety platform
              designed to support pre-participation health assessment, injury
              documentation, movement screening, rehabilitation, and
              participation monitoring for athletes in schools, sports academies,
              clubs, and institutional sports environments.
            </p>
            <p className="mt-3">
              This notice is intended for athletes, parents and guardians,
              clinicians, physiotherapists, coaches, institutions, and other
              authorized users of the SafeSport platform.
            </p>
            <p className="mt-3">
              SafeSport operates in accordance with the{" "}
              <strong>Kenyan Data Protection Act (2019)</strong> and applicable
              data-protection requirements.
            </p>
          </section>

          <Separator />

          {/* 2 — Information We Handle */}
          <section>
            <SectionHeading id="information">2. Information We Handle</SectionHeading>
            <p>
              Depending on the user&apos;s role and their interactions with the
              platform, SafeSport may handle the following categories of
              information. Not every user provides every category.
            </p>

            <div className="mt-5 space-y-5">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Identity and Profile
                </h3>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Name, date of birth, sex and gender as recorded</li>
                  <li>SafeSport athlete identifier</li>
                  <li>Organisation, team and sport</li>
                  <li>Guardian or parent contact information where applicable</li>
                  <li>Account credentials and authentication information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Health and Clinical Information
                </h3>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Medical history and health questionnaire responses</li>
                  <li>Allergies and medications</li>
                  <li>Injury history and incident records</li>
                  <li>Clinical examination findings and vital signs</li>
                  <li>Musculoskeletal baseline assessments</li>
                  <li>Rehabilitation information and progress records</li>
                  <li>
                    Eligibility and participation status decisions made by
                    authorised clinicians
                  </li>
                  <li>Referral information and clinical correspondence</li>
                  <li>Digital certificates</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Movement Screening
                </h3>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Movement screening records and session data</li>
                  <li>
                    Video recordings captured for movement-screening purposes,
                    subject to consent
                  </li>
                  <li>
                    Biomechanical metrics produced during movement analysis (such
                    as knee valgus angle, trunk lean, limb symmetry index,
                    stabilisation time)
                  </li>
                  <li>AI-assisted movement analysis outputs</li>
                  <li>
                    Reviewer information and clinical interpretation of screening
                    results
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Operational Information
                </h3>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Appointments, events and scheduling records</li>
                  <li>Referral status and workflow data</li>
                  <li>Documents and reports uploaded to the platform</li>
                  <li>Platform activity and audit records</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          {/* 3 — How Used */}
          <section>
            <SectionHeading id="how-used">3. How Information Is Used</SectionHeading>
            <p>
              SafeSport uses information to provide its clinical and
              institutional sports health services. Purposes grounded in the
              platform&apos;s documented function include:
            </p>
            <ul className="mt-3 space-y-1 text-muted-foreground list-disc list-inside">
              <li>Athlete registration and creation of a longitudinal health record</li>
              <li>Pre-participation health and performance assessment (PPE/PHPA)</li>
              <li>Clinical review, physical examination and structured health history</li>
              <li>Injury documentation, incident recording and follow-up</li>
              <li>Movement screening and physiotherapy workflows</li>
              <li>AI-assisted movement analysis as clinical decision support</li>
              <li>Rehabilitation tracking and return-to-participation management</li>
              <li>Eligibility and participation status management</li>
              <li>Referral creation and closed-loop care co-ordination</li>
              <li>
                Providing coaches, institutions and authorised users with
                participation-relevant status information
              </li>
              <li>Scheduling and operational service delivery</li>
              <li>Generating digital eligibility certificates</li>
              <li>Audit, safeguarding and platform security</li>
            </ul>
          </section>

          <Separator />

          {/* 4 — Health Information */}
          <section>
            <SectionHeading id="health">4. Athlete Health & Clinical Information</SectionHeading>

            <Callout icon={ActivityIcon}>
              <strong>Athlete health information is sensitive.</strong> SafeSport
              maintains structured athlete health records to support assessment,
              injury management, rehabilitation, follow-up and participation
              monitoring. Clinical information is handled separately from general
              profile data and is accessible only to authorised users according
              to role-based permissions.
            </Callout>

            <p>
              The SafeSport platform is designed around a{" "}
              <strong>longitudinal athlete record</strong> — a persistent record
              that can support an athlete&apos;s health history across different
              schools, academies, clubs and stages of participation. Authorised
              information supports continuity across assessment, injury,
              rehabilitation, screening, follow-up and participation.
            </p>
            <p className="mt-3">
              Clinical notes, detailed examination findings, mental-health
              information and sensitive medical history are accessible only to
              clinicians and other authorised clinical staff within the scope of
              their role. Schools, coaches and institutions receive only
              participation-relevant status information, not the full clinical
              record.
            </p>
            <p className="mt-3">
              SafeSport&apos;s data-retention practices are governed by applicable
              requirements and the platform&apos;s approved data-governance policies.
            </p>
          </section>

          <Separator />

          {/* 5 — Screening & Video */}
          <section>
            <SectionHeading id="screening">5. Movement Screening & Video</SectionHeading>

            <Callout icon={VideoIcon}>
              Movement-screening video recordings are captured subject to
              separate, specific consent. Video data is used only for the
              purposes described in the consent obtained.
            </Callout>

            <p>
              SafeSport may process movement-screening recordings and related
              biomechanical analysis as part of the platform&apos;s structured
              movement-screening workflow. This includes video capture of
              prescribed movements (such as jump landing, single-leg squat,
              sprint acceleration and cutting manoeuvres) and the derivation of
              biomechanical metrics such as knee valgus angle, trunk lean, limb
              symmetry index and stabilisation time.
            </p>

            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-sm font-semibold text-foreground mb-1">
                AI-assisted movement analysis
              </p>
              <p className="text-sm text-muted-foreground">
                SafeSport may use AI-assisted movement analysis as part of the
                movement-screening workflow.{" "}
                <strong>
                  AI outputs provide movement-risk information to support
                  professional review. AI output does not independently
                  determine clinical eligibility.
                </strong>{" "}
                The clinician remains the decision-maker for medical eligibility.
                All AI-generated outputs are reviewed and interpreted by an
                authorised clinician or physiotherapist before any eligibility
                decision is made.
              </p>
            </div>
          </section>

          <Separator />

          {/* 6 — Minors */}
          <section>
            <SectionHeading id="minors">6. Minors & Guardian Consent</SectionHeading>

            <Callout icon={UsersIcon}>
              SafeSport requires appropriate parental or guardian consent for the
              registration and clinical assessment of minor athletes, consistent
              with the requirements of the Kenyan Data Protection Act (2019) and
              applicable safeguarding requirements.
            </Callout>

            <p>
              Where an athlete is a minor, SafeSport records who provided
              consent, the date and time, the scope of consent, and whether
              consent was obtained, declined or deferred. The platform supports
              guardian-specific views that allow parents and guardians to access
              permitted information relevant to their child&apos;s participation
              status, consent records and health questionnaire responses.
            </p>
            <p className="mt-3">
              Confidential clinical notes and sensitive medical information
              remain accessible only to authorised clinical staff, not
              automatically to parents or guardians.
            </p>
            <p className="mt-3">
              Safeguarding concerns identified during assessment are handled in
              accordance with the organisation&apos;s approved safeguarding and
              mandatory-reporting procedures.
            </p>
            <p className="mt-3">
              Movement-screening video recordings of minor athletes require
              separate, specific consent prior to capture and processing.
            </p>
          </section>

          <Separator />

          {/* 7 — Access */}
          <section>
            <SectionHeading id="access">7. Who Can Access Information</SectionHeading>

            <Callout icon={UserCheckIcon}>
              SafeSport uses role-based permissions. Users receive access to
              information appropriate to their role and their authorised
              relationship to the athlete. No role automatically receives access
              to the full clinical record.
            </Callout>

            <p>
              The following roles are defined within the SafeSport platform. The
              information accessible to each role reflects the minimum-necessary
              disclosure principle:
            </p>

            <div className="mt-4 overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-2.5 text-left font-semibold">Role</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Can access</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-destructive/80">Cannot access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    {
                      role: "Athlete",
                      can: "Own permitted record and participation status",
                      cannot: "Other athletes' records; clinician-only notes",
                    },
                    {
                      role: "Parent / Guardian",
                      can: "Minor's permitted consent and status views",
                      cannot: "Other athletes; confidential clinician notes",
                    },
                    {
                      role: "Clinician",
                      can: "Full authorised clinical record",
                      cannot: "—",
                    },
                    {
                      role: "Physiotherapist",
                      can: "Assigned movement and rehabilitation data; permitted clinical context",
                      cannot: "Unrelated sensitive clinical notes unless authorised",
                    },
                    {
                      role: "Coach",
                      can: "Participation status and restrictions; operational alerts",
                      cannot: "Medical history; mental-health data; full examination",
                    },
                    {
                      role: "School / Club Administrator",
                      can: "Institutional readiness and status dashboards",
                      cannot: "Clinical record",
                    },
                    {
                      role: "System Administrator",
                      can: "Technical metadata and audit logs; user and access configuration",
                      cannot: "Clinical content unless explicitly privileged",
                    },
                  ].map((row) => (
                    <tr key={row.role} className="text-muted-foreground">
                      <td className="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">
                        {row.role}
                      </td>
                      <td className="px-4 py-2.5">{row.can}</td>
                      <td className="px-4 py-2.5 text-destructive/70">{row.cannot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <Separator />

          {/* 8 — Security */}
          <section>
            <SectionHeading id="security">8. Security Safeguards</SectionHeading>
            <p>
              SafeSport applies documented technical and organisational controls
              designed to protect athlete and platform information.
            </p>

            <div className="mt-5 grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: LockIcon,
                  title: "Encrypted in transit",
                  detail: "TLS",
                  desc: "All data transmitted between clients and the platform is protected using Transport Layer Security (TLS).",
                },
                {
                  icon: ServerIcon,
                  title: "Protected storage",
                  detail: "AES-256",
                  desc: "Athlete health data stored within the platform is encrypted at rest using AES-256.",
                },
                {
                  icon: KeyRoundIcon,
                  title: "Controlled access",
                  detail: "Role-based permissions",
                  desc: "Access to athlete information is governed by role-based permissions. Users access only the information their role permits.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border bg-muted/20 px-4 py-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="size-4 text-primary" />
                    <span className="font-semibold text-sm">{item.title}</span>
                  </div>
                  <p className="text-xs font-mono text-primary bg-primary/10 rounded px-2 py-0.5 w-fit">
                    {item.detail}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <Alert className="mt-5">
              <ShieldCheckIcon className="size-4" />
              <AlertDescription>
                SafeSport also maintains secure cloud storage and role-based
                data access controls as part of its overall security architecture.
                While SafeSport applies these documented controls, no system can
                guarantee absolute security. In the event of a security incident
                affecting personal information, SafeSport will act in accordance
                with applicable legal requirements.
              </AlertDescription>
            </Alert>
          </section>

          <Separator />

          {/* 9 — Institutional */}
          <section>
            <SectionHeading id="institutional">9. Institutional Use</SectionHeading>

            <Callout icon={BuildingIcon}>
              Institutional access within SafeSport is role-controlled.
              Institutions do not automatically receive unrestricted access to
              athletes&apos; clinical records.
            </Callout>

            <p>
              SafeSport supports schools, sports academies, clubs and other
              institutional sports-health environments. Institutional
              administrators can access organisation-level status dashboards
              showing participation readiness, assessment completion, and
              operational metrics for their registered athletes.
            </p>
            <p className="mt-3">
              Institutional views are designed to provide a{" "}
              <strong>
                minimum-necessary projection of participation status and
                operational readiness
              </strong>
              , not a window into individual clinical records. Detailed clinical
              information remains protected within the clinical record and is
              accessible only to authorised clinical staff.
            </p>
          </section>

          <Separator />

          {/* 10 — Requests */}
          <section>
            <SectionHeading id="requests">10. Data and Account Requests</SectionHeading>
            <p>
              Individuals whose information is held within SafeSport, or their
              authorised representatives, may have rights under the Kenyan Data
              Protection Act (2019) and other applicable law in relation to
              their personal information. These may include the right to access,
              correct or request deletion of personal information.
            </p>
            <p className="mt-3">
              To submit a request relating to your information, or to raise a
              concern about how your information has been handled, contact Ayot
              Health Solutions Limited using the details in the{" "}
              <a href="#contact" className="text-primary hover:underline">
                Contact
              </a>{" "}
              section below.
            </p>
            <p className="mt-3">
              SafeSport&apos;s data-retention practices are governed by applicable
              requirements and the platform&apos;s approved data-governance policies.
              Where specific retention periods have not yet been formalised in
              the approved policy, information will be retained only as long as
              necessary for the purposes described in this notice.
            </p>
          </section>

          <Separator />

          {/* 11 — Contact */}
          <section>
            <SectionHeading id="contact">11. Contact</SectionHeading>
            <p>
              For privacy-related queries, requests or concerns, contact Ayot
              Health Solutions Limited:
            </p>

            <div className="mt-4 rounded-lg border bg-muted/30 px-5 py-4 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <BuildingIcon className="size-4 shrink-0 text-primary" />
                <span className="font-semibold">Ayot Health Solutions Limited</span>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MailIcon className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
                <a
                  href="mailto:info@ayothealthsolutions.ke"
                  className="hover:text-primary transition-colors"
                >
                  info@ayothealthsolutions.ke
                </a>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <ShieldCheckIcon className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
                <span>
                  Western Heights, 8th Floor, Westlands, Nairobi
                </span>
              </div>
              <p className="text-xs text-muted-foreground/70 pt-1">
                A dedicated privacy contact address will be provided when the
                platform&apos;s formal data-governance arrangements are finalised.
              </p>
            </div>
          </section>

          <Separator />

          {/* 12 — Updates */}
          <section>
            <SectionHeading id="updates">12. Updates to this Notice</SectionHeading>
            <p>
              This privacy notice may be updated from time to time to reflect
              changes in the SafeSport platform, applicable legal requirements,
              or approved data-governance policies. Where material changes are
              made, SafeSport will take reasonable steps to inform affected users.
            </p>
            <p className="mt-3 text-muted-foreground text-xs">
              This notice reflects the SafeSport platform as currently described
              in the approved project documentation. A formal effective date will
              be displayed when the notice is formally adopted as approved policy
              by Ayot Health Solutions Limited.
            </p>
          </section>

          {/* Back to top / sign in */}
          <div className="pt-4 flex items-center gap-4 text-sm">
            <Link
              href="/account/signin"
              className="text-primary hover:underline underline-offset-2"
            >
              ← Back to Sign In
            </Link>
            <span className="text-muted-foreground">·</span>
            <a
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to top ↑
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
