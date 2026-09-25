"use client";
import { Security } from '@/features/safesport/workspace/people';
export function ProfileSecurityTab({athleteEmail}: {athleteEmail: string}) { return <section aria-label={`Security for ${athleteEmail}`}><Security/></section>; }
