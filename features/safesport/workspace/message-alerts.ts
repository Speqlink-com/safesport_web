import { create } from "zustand";
import type { ConversationItem, MessageItem, MessagingWorkspacePayload } from "@/features/auth/api";

interface MessageAlertState {
  hasUnread: boolean;
  unreadConversationIds: string[];
  knownMessageIds: string[];
  initialized: boolean;
  markRead: () => void;
  markConversationRead: (conversationId: string) => void;
  reset: () => void;
  ingestWorkspace: (payload: MessagingWorkspacePayload, options?: { suppressUnread?: boolean; suppressSound?: boolean }) => void;
  ingestMessage: (message: MessageItem, currentUserId?: string, options?: { suppressUnread?: boolean; suppressSound?: boolean }) => void;
}

function collectMessages(conversations: ConversationItem[]): MessageItem[] {
  return conversations.flatMap((conversation) => conversation.messages);
}

function playNotificationSound() {
  if (typeof window === "undefined") return;
  const audio = new Audio("/notification.mp3");
  audio.volume = 0.75;
  audio.play().catch(() => undefined);
}

export const useMessageAlertStore = create<MessageAlertState>((set, get) => ({
  hasUnread: false,
  unreadConversationIds: [],
  knownMessageIds: [],
  initialized: false,
  markRead: () => set({ hasUnread: false, unreadConversationIds: [] }),
  markConversationRead: (conversationId) =>
    set((state) => {
      const unreadConversationIds = state.unreadConversationIds.filter((id) => id !== conversationId);
      return { unreadConversationIds, hasUnread: unreadConversationIds.length > 0 };
    }),
  reset: () => set({ hasUnread: false, unreadConversationIds: [], knownMessageIds: [], initialized: false }),
  ingestWorkspace: (payload, options) => {
    const state = get();
    const known = new Set(state.knownMessageIds);
    const messages = collectMessages(payload.conversations);
    const newIncoming = messages.filter(
      (message) => !known.has(message.id) && message.sender.id !== payload.current_user.id,
    );
    const incomingConversationIds = payload.conversations
      .filter((conversation) => conversation.messages.some((message) => newIncoming.some((incoming) => incoming.id === message.id)))
      .map((conversation) => conversation.id);
    const nextKnown = Array.from(new Set([...state.knownMessageIds, ...messages.map((message) => message.id)])).slice(-500);
    const hasNewIncoming = state.initialized && newIncoming.length > 0;
    const shouldMarkUnread = hasNewIncoming && !options?.suppressUnread;
    const shouldPlaySound = hasNewIncoming && !options?.suppressSound;
    const unreadConversationIds = shouldMarkUnread
      ? Array.from(new Set([...state.unreadConversationIds, ...incomingConversationIds]))
      : state.unreadConversationIds;
    set({
      knownMessageIds: nextKnown,
      initialized: true,
      unreadConversationIds,
      hasUnread: unreadConversationIds.length > 0 || state.hasUnread,
    });
    if (shouldPlaySound) playNotificationSound();
  },
  ingestMessage: (message, currentUserId, options) => {
    const state = get();
    if (state.knownMessageIds.includes(message.id)) return;
    const isIncoming = message.sender.id !== currentUserId;
    const hasNewIncoming = state.initialized && isIncoming;
    const shouldMarkUnread = hasNewIncoming && !options?.suppressUnread;
    const shouldPlaySound = hasNewIncoming && !options?.suppressSound;
    const unreadConversationIds = shouldMarkUnread
      ? Array.from(new Set([...state.unreadConversationIds, message.conversation_id]))
      : state.unreadConversationIds;
    set({
      knownMessageIds: [...state.knownMessageIds, message.id].slice(-500),
      initialized: true,
      unreadConversationIds,
      hasUnread: unreadConversationIds.length > 0 || state.hasUnread,
    });
    if (shouldPlaySound) playNotificationSound();
  },
}));
