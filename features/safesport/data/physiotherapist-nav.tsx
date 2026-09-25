// Physiotherapist Navigation Configuration for SafeSport™

// Physiotherapist Navigation Configuration for SafeSport™
import { ClipboardListIcon, TrendingUpIcon, HeartPulseIcon, ArrowRightLeftIcon, BellIcon, MessageSquareIcon } from "lucide-react";

export const physiotherapistNavData = {
  user: {
    name: "James Ochieng",
    email: "j.ochieng@safesport.com",
    avatar: "/avatars/physio.jpg",
  },
  navMain: [
    {
      title: "My Work",
      url: "#",
      icon: <ClipboardListIcon />,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/safesport/physiotherapist",
        },
        {
          title: "Assigned Athletes",
          url: "/safesport/physiotherapist/athletes",
        },
      ],
    },
    {
      title: "Movement",
      url: "#",
      icon: <TrendingUpIcon />,
      items: [
        {
          title: "Screenings",
          url: "/safesport/physiotherapist/screenings",
        },
        {
          title: "AI Reviews",
          url: "/safesport/physiotherapist/ai-reviews",
        },
      ],
    },
    {
      title: "Rehabilitation",
      url: "/safesport/physiotherapist/rehabilitation",
      icon: <HeartPulseIcon />,
    },
    {
      title: "Referrals",
      url: "#",
      icon: <ArrowRightLeftIcon />,
      items: [
        {
          title: "Incoming Referrals",
          url: "/safesport/physiotherapist/referrals/incoming",
        },
        {
          title: "My Referrals",
          url: "/safesport/physiotherapist/referrals/mine",
        },
        {
          title: "Completed",
          url: "/safesport/physiotherapist/referrals/completed",
        },
      ],
    },
  ],
  communications: [
    {
      name: "Messages",
      url: "/safesport/messages",
      icon: <MessageSquareIcon />,
    },
    {
      name: "Notifications",
      url: "/safesport/notifications",
      icon: <BellIcon />,
    },
  ],
};
