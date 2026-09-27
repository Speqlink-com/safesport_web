// System Admin Navigation Configuration for SafeSport™

import {
  SettingsIcon,
  ShieldIcon,
  ServerIcon,
  LifeBuoyIcon,
  UsersIcon,
  BellIcon,
  MessageSquareIcon,
} from "lucide-react";

export const sysAdminNavData = {
  user: {
    name: "System Administrator",
    email: "admin@safesport.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Administration",
      url: "#",
      icon: <UsersIcon />,
      isActive: true,
      items: [
        {
          title: "Users",
          url: "/dashboard/safesport/sys-admin/users",
        },
        {
          title: "Roles & Permissions",
          url: "/dashboard/safesport/sys-admin/roles",
        },
        {
          title: "Organizations",
          url: "/dashboard/safesport/sys-admin/organizations",
        },
      ],
    },
    {
      title: "Configuration",
      url: "#",
      icon: <SettingsIcon />,
      items: [
        {
          title: "Sports",
          url: "/dashboard/safesport/sys-admin/config/sports",
        },
        {
          title: "Assessment Configuration",
          url: "/dashboard/safesport/sys-admin/config/assessments",
        },
        {
          title: "Workflow Configuration",
          url: "/dashboard/safesport/sys-admin/config/workflows",
        },
        {
          title: "Notification Settings",
          url: "/dashboard/safesport/sys-admin/config/notifications",
        },
      ],
    },
    {
      title: "Security",
      url: "#",
      icon: <ShieldIcon />,
      items: [
        {
          title: "Access Logs",
          url: "/dashboard/safesport/sys-admin/security/access",
        },
        {
          title: "Audit Logs",
          url: "/dashboard/safesport/sys-admin/security/audit",
        },
        {
          title: "Sessions",
          url: "/dashboard/safesport/sys-admin/security/sessions",
        },
      ],
    },
    {
      title: "System",
      url: "#",
      icon: <ServerIcon />,
      items: [
        {
          title: "System Health",
          url: "/dashboard/safesport/sys-admin/system/health",
        },
        {
          title: "Integrations",
          url: "/dashboard/safesport/sys-admin/system/integrations",
        },
        {
          title: "Storage",
          url: "/dashboard/safesport/sys-admin/system/storage",
        },
        {
          title: "Background Jobs",
          url: "/dashboard/safesport/sys-admin/system/jobs",
        },
      ],
    },
    {
      title: "Support",
      url: "#",
      icon: <LifeBuoyIcon />,
      items: [
        {
          title: "Activity",
          url: "/dashboard/safesport/sys-admin/support/activity",
        },
        {
          title: "Errors",
          url: "/dashboard/safesport/sys-admin/support/errors",
        },
      ],
    },
  ],
  communications: [
    {
      name: "Notifications",
      url: "/safesport/notifications",
      icon: <BellIcon />,
    },
    {
      name: "Messages",
      url: "/safesport/messages",
      icon: <MessageSquareIcon />,
    },
  ],
  records: [],
};
