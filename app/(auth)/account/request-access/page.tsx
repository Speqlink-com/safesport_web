import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  BuildingIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowLeftIcon,
} from "lucide-react";

export default function RequestAccessPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <BuildingIcon className="size-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Request Institutional Access</h1>
        <p className="text-muted-foreground">
          Access to the SafeSport™ portal is provisioned for verified schools,
          sports clubs, clinics, and authorised practitioners. To request
          access for your organisation, contact our team directly.
        </p>
      </div>

      <Separator />

      {/* Contact details */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Get in touch
        </h2>

        <div className="space-y-3">
          <a
            href="mailto:info@ayothealthsolutions.ke"
            className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
          >
            <MailIcon className="size-4 shrink-0 text-muted-foreground" />
            <span>info@ayothealthsolutions.ke</span>
          </a>

          <a
            href="tel:+254141205267"
            className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
          >
            <PhoneIcon className="size-4 shrink-0 text-muted-foreground" />
            <span>+254 141 205 267</span>
          </a>

          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <MapPinIcon className="size-4 shrink-0 mt-0.5" />
            <span>
              Western Heights, 8th Floor<br />
              Westlands, Nairobi
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* CTA */}
      <div className="space-y-3">
        <a
          href="mailto:info@ayothealthsolutions.ke?subject=Institutional Access Request – SafeSport™"
          className={cn(buttonVariants(), "w-full h-12 text-base justify-center")}
        >
          Send Access Request
        </a>

        <p className="text-center text-xs text-muted-foreground">
          We aim to respond within one business day.
        </p>
      </div>

      {/* Back link */}
      <Link
        href="/account/signin"
        className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to sign in
      </Link>
    </div>
  );
}
