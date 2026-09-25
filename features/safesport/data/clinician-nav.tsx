// Clinician Navigation Configuration for SafeSport™
// Follows the existing app-sidebar pattern

"use client";

import { StethoscopeIcon, CalendarIcon, BellIcon, MessageSquareIcon, FileTextIcon, AwardIcon } from "lucide-react";
import { NotificationBadge } from "../components/notifications/NotificationBadge";
import { useNotificationStats } from "../hooks/useNotifications";

export function useClinicianNavData() {
  const notificationStats = useNotificationStats("clinician");

  return {
    user: {
      name: "Dr. Sarah Ndungu",
      email: "s.ndungu@safesport.com",
      avatar: "/avatars/clinician.jpg",
    },
    navMain: [
      {
        title: "Clinical",
        url: "#",
        icon: <StethoscopeIcon />,
        isActive: true,
        items: [
          {
            title: "Athletes",
            url: "/safesport/clinician/athletes",
          },
          {
            title: "Assessments / PPE",
            url: "/safesport/clinician/assessments",
          },
          {
            title: "Screenings",
            url: "/safesport/clinician/screenings",
          },
          {
            title: "AI Reviews",
            url: "/safesport/clinician/ai-reviews",
          },
          {
            title: "Referrals",
            url: "/safesport/clinician/referrals",
          },
          {
            title: "Incidents",
            url: "/safesport/clinician/incidents",
          },
          {
            title: "Eligibility",
            url: "/safesport/clinician/eligibility",
          },
          {
            title: "Reassessments",
            url: "/safesport/clinician/reassessments",
          },
        ],
      },
      {
        title: "Operations",
        url: "#",
        icon: <CalendarIcon />,
        items: [
          {
            title: "Schedule",
            url: "/safesport/clinician/schedule",
          },
          {
            title: "Events",
            url: "/safesport/clinician/events",
          },
          {
            title: "Tasks",
            url: "/safesport/clinician/tasks",
          },
        ],
      },
    ],
    communications: [
      {
        name: "Messages",
        url: "/safesport/clinician/messages",
        icon: <MessageSquareIcon />,
      },
      {
        name: "Notifications",
        url: "/safesport/clinician/notifications",
        icon: <BellIcon />,
        badge:
          notificationStats.unread > 0 ? (
            <NotificationBadge count={notificationStats.unread} />
          ) : undefined,
      },
    ],
    records: [
      {
        name: "Reports",
        url: "/safesport/clinician/reports",
        icon: <FileTextIcon />,
      },
      {
        name: "Certificates",
        url: "/safesport/clinician/certificates",
        icon: <AwardIcon />,
      },
    ],
  };
}

// Export static version for compatibility (will be updated to use hook in components)
export const clinicianNavData = {
  user: {
    name: "Dr. Sarah Ndungu",
    email: "s.ndungu@safesport.com",
    avatar: "/avatars/clinician.jpg",
  },
  navMain: [
    {
      title: "Clinical",
      url: "#",
      icon: <StethoscopeIcon />,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/safesport/clinician",
        },
        {
          title: "Athletes",
          url: "/safesport/clinician/athletes",
        },
        {
          title: "Assessments / PPE",
          url: "/safesport/clinician/assessments",
        },
        {
          title: "Screenings",
          url: "/safesport/clinician/screenings",
        },
        {
          title: "AI Reviews",
          url: "/safesport/clinician/ai-reviews",
        },
        {
          title: "Referrals",
          url: "/safesport/clinician/referrals",
        },
      ],
    },
  ],
  communications: [
    {
      name: "Messages",
      url: "/safesport/clinician/messages",
      icon: <MessageSquareIcon />,
    },
    {
      name: "Notifications",
      url: "/safesport/clinician/notifications",
      icon: <BellIcon />,
    },
  ],
};
