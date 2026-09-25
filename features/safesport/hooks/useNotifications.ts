"use client";

import { useState, useEffect, useMemo } from "react";
import type {
  SafeSportNotification,
  NotificationFilters,
  NotificationStats,
  SafeSportRole,
} from "../types/notifications";

// ==================================================
// SHARED NOTIFICATION STATE
// ==================================================

// Singleton notification store for prototype
let globalNotifications: SafeSportNotification[] = [];
const globalListeners: Set<() => void> = new Set();

// Notify all listeners of state change
function notifyListeners() {
  globalListeners.forEach((listener) => listener());
}

// ==================================================
// NOTIFICATION STORE API
// ==================================================

export const NotificationStore = {
  getAll: (): SafeSportNotification[] => globalNotifications,
  
  getByRole: (role: SafeSportRole): SafeSportNotification[] => {
    return globalNotifications.filter((n) => n.role === role);
  },
  
  setNotifications: (notifications: SafeSportNotification[]) => {
    globalNotifications = notifications;
    notifyListeners();
  },
  
  markAsRead: (id: string) => {
    const notification = globalNotifications.find((n) => n.id === id);
    if (notification && notification.status === "unread") {
      notification.status = "read";
      notification.readAt = new Date().toISOString();
      notifyListeners();
    }
  },
  
  markAllAsRead: (role: SafeSportRole) => {
    let changed = false;
    globalNotifications.forEach((n) => {
      if (n.role === role && n.status === "unread") {
        n.status = "read";
        n.readAt = new Date().toISOString();
        changed = true;
      }
    });
    if (changed) {
      notifyListeners();
    }
  },
  
  addNotification: (notification: SafeSportNotification) => {
    globalNotifications = [notification, ...globalNotifications];
    notifyListeners();
  },
  
  subscribe: (listener: () => void) => {
    globalListeners.add(listener);
    return () => globalListeners.delete(listener);
  },
};

// ==================================================
// USE NOTIFICATIONS HOOK
// ==================================================

export function useNotifications(role: SafeSportRole, filters?: NotificationFilters) {
  const [, forceUpdate] = useState(0);

  // Subscribe to notification changes
  useEffect(() => {
    const unsubscribe = NotificationStore.subscribe(() => {
      forceUpdate(v => v + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Get role-specific notifications
  const allNotifications = NotificationStore.getByRole(role);

  // Apply filters
  const filteredNotifications = useMemo(() => {
    let filtered = [...allNotifications];

    // Status filter
    if (filters?.status === "unread") {
      filtered = filtered.filter((n) => n.status === "unread");
    } else if (filters?.status === "important") {
      filtered = filtered.filter(
        (n) => n.priority === "important" || n.priority === "urgent"
      );
    }

    // Category filter
    if (filters?.category) {
      filtered = filtered.filter((n) => n.category === filters.category);
    }

    // Search filter
    if (filters?.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchLower) ||
          n.description.toLowerCase().includes(searchLower) ||
          n.relatedAthleteName?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [allNotifications, filters]);

  // Calculate stats
  const stats: NotificationStats = useMemo(() => {
    return {
      total: allNotifications.length,
      unread: allNotifications.filter((n) => n.status === "unread").length,
      important: allNotifications.filter(
        (n) => n.priority === "important" || n.priority === "urgent"
      ).length,
      urgent: allNotifications.filter((n) => n.priority === "urgent").length,
    };
  }, [allNotifications]);

  return {
    notifications: filteredNotifications,
    stats,
    markAsRead: NotificationStore.markAsRead,
    markAllAsRead: () => NotificationStore.markAllAsRead(role),
  };
}

// ==================================================
// USE NOTIFICATION STATS HOOK (for badges)
// ==================================================

export function useNotificationStats(role: SafeSportRole): NotificationStats {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = NotificationStore.subscribe(() => {
      forceUpdate({});
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const notifications = NotificationStore.getByRole(role);

  return {
    total: notifications.length,
    unread: notifications.filter((n) => n.status === "unread").length,
    important: notifications.filter(
      (n) => n.priority === "important" || n.priority === "urgent"
    ).length,
    urgent: notifications.filter((n) => n.priority === "urgent").length,
  };
}
