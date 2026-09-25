// Athlete Navigation Configuration for SafeSport™

// Athlete Navigation Configuration for SafeSport™
import { UserIcon, HeartPulseIcon, FileTextIcon, AwardIcon, BellIcon, MessageSquareIcon } from "lucide-react";

export const athleteNavData = {
  user: {
    name: "Brian Otieno",
    email: "b.otieno@athlete.safesport.com",
    avatar: "/avatars/athlete.jpg",
  },
  navMain: [
    {
      title: "My SafeSport",
      url: "#",
      icon: <UserIcon />,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/safesport/athlete",
        },
        {
          title: "My Profile",
          url: "/safesport/athlete/profile",
        },
      ],
    },
    {
      title: "Health & Safety",
      url: "#",
      icon: <HeartPulseIcon />,
      items: [
        {
          title: "My Health",
          url: "/safesport/athlete/health",
        },
        {
          title: "My Screening",
          url: "/safesport/athlete/screening",
        },
      ],
    },
  ],
  communications: [
    {
      name: "Notifications",
      url: "/safesport/athlete/notifications",
      icon: <BellIcon />,
    },
    {
      name: "Messages",
      url: "/safesport/athlete/messages",
      icon: <MessageSquareIcon />,
    },
  ],
  records: [
    {
      name: "Certificates",
      url: "/safesport/athlete/certificates",
      icon: <AwardIcon />,
    },
    {
      name: "Reports",
      url: "/safesport/athlete/reports",
      icon: <FileTextIcon />,
    },
  ],
};
