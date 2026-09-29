"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Send, Paperclip, CheckCheck, MessageSquare, X, Users, Smile } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { identities, href, type Role } from "./catalog";
import { useWorkspace } from "./store";
import { PageHeading, Panel, Empty, Go, Choice, Status } from "./ui";
import { messagingApi, type ConversationItem, type MessageItem, type MessageUser } from "@/features/auth/api";
import { useMessageAlertStore } from "./message-alerts";
import { useTheme } from "next-themes";
import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";
const contacts: Record<Role, Role[]> = {
  athlete: ["clinician", "physiotherapist", "coach"],
  guardian: ["clinician", "physiotherapist", "operations"],
  clinician: ["athlete", "guardian", "physiotherapist", "operations"],
  physiotherapist: ["athlete", "guardian", "clinician", "operations"],
  coach: ["athlete", "institution", "operations"],
  institution: ["coach", "operations", "sys-admin"],
  operations: [
    "guardian",
    "clinician",
    "physiotherapist",
    "coach",
    "institution",
  ],
  "sys-admin": ["institution"],
};
export function Notifications({ role }: { role: Role }) {
  const { state, setState } = useWorkspace();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const records = state.notices.filter(
    (n) =>
      n.role === role &&
      (filter !== "unread" || !n.read) &&
      n.title.toLowerCase().includes(search.toLowerCase()),
  );
  const mark = (id?: string) =>
    setState((s) => ({
      ...s,
      notices: s.notices.map((n) =>
        n.role === role && (!id || n.id === id) ? { ...n, read: true } : n,
      ),
    }));
  return (
    <>
      <PageHeading
        title="Notifications"
        description={`${identities[role].title} · Updates from your SafeSport care workflows.`}
      >
        <Button
          variant="outline"
          disabled={!state.notices.some((n) => n.role === role && !n.read)}
          onClick={() => mark()}
        >
          <CheckCheck />
          Mark all read
        </Button>
      </PageHeading>
      <Panel title="Your updates">
        <div className="flex flex-wrap items-end gap-3">
          <Input
            className="min-w-44 flex-1"
            aria-label="Search notifications"
            placeholder="Search notifications…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Choice
            label="Show"
            value={filter}
            onChange={setFilter}
            options={["all", "unread"]}
          />
        </div>
        {records.length ? (
          records.map((n) => (
            <article
              key={n.id}
              className={`flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-2 py-5 ${n.read ? "" : "bg-primary/5"}`}
            >
              <div className="min-w-0 space-y-2">
                <Status value={n.read ? "read" : "unread"} />
                <h2 className="break-words text-sm font-medium">{n.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {n.date.slice(0, 10)}
                </p>
              </div>
              <div className="flex gap-2">
                <Go to={href(role, n.path)} secondary>
                  View
                </Go>
                {!n.read && (
                  <Button variant="ghost" onClick={() => mark(n.id)}>
                    Mark read
                  </Button>
                )}
              </div>
            </article>
          ))
        ) : (
          <Empty
            title={search ? "No matching notifications" : "You’re up to date"}
            description="New updates will appear when relevant care records change."
          />
        )}
      </Panel>
    </>
  );
}
export function Messages({ role }: { role: Role }) {
  const [workspace, setWorkspace] = useState<{
    current_user: MessageUser;
    people: MessageUser[];
    conversations: ConversationItem[];
  } | null>(null);
  const [activeId, setActiveId] = useState("");
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<{ file: File; url: string; name: string; type: string } | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<MessageItem | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const ingestWorkspace = useMessageAlertStore((state) => state.ingestWorkspace);
  const ingestMessage = useMessageAlertStore((state) => state.ingestMessage);
  const markMessagesRead = useMessageAlertStore((state) => state.markRead);

  const mergeWorkspace = (payload: { current_user: MessageUser; people: MessageUser[]; conversations: ConversationItem[] }, keepActive = true) => {
    ingestWorkspace(payload, { suppressUnread: true, suppressSound: true });
    markMessagesRead();
    setWorkspace(payload);
    setActiveId((current) =>
      keepActive && current && payload.conversations.some((conversation) => conversation.id === current)
        ? current
        : payload.conversations[0]?.id || "",
    );
  };

  useEffect(() => {
    let active = true;
    void messagingApi.workspace()
      .then((payload) => {
        if (!active) return;
        mergeWorkspace(payload, false);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load messages"));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void messagingApi.workspace()
        .then((payload) => mergeWorkspace(payload))
        .catch(() => undefined);
    }, 3000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const ws = new WebSocket(messagingApi.wsUrl(activeId));
    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { type?: string; message?: MessageItem };
      if (payload.type !== "message" || !payload.message) return;
      const incoming = payload.message;
      setWorkspace((current) => current ? {
        ...current,
        conversations: current.conversations.map((conversation) =>
          conversation.id === activeId && !conversation.messages.some((message) => message.id === incoming.id)
            ? { ...conversation, messages: [...conversation.messages, incoming] }
            : conversation,
        ),
      } : current);
      ingestMessage(incoming, workspace?.current_user.id, { suppressUnread: true });
      markMessagesRead();
    };
    return () => ws.close();
  }, [activeId, ingestMessage, markMessagesRead, workspace?.current_user.id]);

  const conversations = workspace?.conversations ?? [];
  const active = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0];
  const people = workspace?.people.filter((person) => `${person.name} ${person.role}`.toLowerCase().includes(search.toLowerCase())) ?? [];
  const globalMessaging = role === "clinician" || role === "physiotherapist" || role === "sys-admin";
  const conversationLabel = (conversation: ConversationItem) =>
    conversation.kind === "institution_group"
      ? globalMessaging
        ? conversation.title
        : "Institution family group"
      : conversation.title;
  const conversationDescription = (conversation: ConversationItem) =>
    conversation.kind === "institution_group"
      ? globalMessaging
        ? "Institution group"
        : "Your one institution group"
      : `${conversation.members.length} member${conversation.members.length === 1 ? "" : "s"}`;

  useEffect(() => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
  }, [active?.id, active?.messages.length]);

  const addEmoji = (emoji: EmojiClickData) => {
    setText((current) => `${current}${emoji.emoji}`);
    setEmojiOpen(false);
  };

  const clearFile = () => {
    if (attachment) URL.revokeObjectURL(attachment.url);
    setAttachment(null);
    setFileKey((k) => k + 1);
  };
  const startDirect = async (person: MessageUser) => {
    try {
      const conversation = await messagingApi.startDirect(person.id);
      setWorkspace((current) => {
        if (!current) return current;
        return {
          ...current,
          conversations: [conversation, ...current.conversations.filter((item) => item.id !== conversation.id)],
        };
      });
      setActiveId(conversation.id);
      setText("");
      setReplyTo(null);
      setEmojiOpen(false);
      clearFile();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to open conversation");
    }
  };
  const send = async () => {
    if (!active || (!text.trim() && !attachment)) return;
    setSending(true);
    try {
      const replyPrefix = replyTo ? `Replying to ${replyTo.sender.name}: ${(replyTo.body || replyTo.attachment_name || "attachment").slice(0, 120)}\n\n` : "";
      const message = await messagingApi.sendMessage(active.id, `${replyPrefix}${text.trim()}`, attachment?.file);
      setWorkspace((current) => current ? {
        ...current,
        conversations: current.conversations.map((conversation) =>
          conversation.id === active.id && !conversation.messages.some((item) => item.id === message.id)
            ? { ...conversation, messages: [...conversation.messages, message] }
            : conversation,
        ),
      } : current);
      setText("");
      setReplyTo(null);
      setEmojiOpen(false);
      clearFile();
      toast.success("Message sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeading
        title="Messages"
        description={globalMessaging ? "Realtime institution groups across all institutions." : "Institution-bounded realtime conversations with your institution and care team."}
      />
      <div className="grid min-h-[600px] gap-5 lg:grid-cols-[300px_1fr]">
        <Panel title="Conversations">
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant="ghost"
                aria-pressed={active?.id === conversation.id}
                className="h-auto w-full justify-start gap-3 whitespace-normal py-3 text-left aria-pressed:bg-primary/10 aria-pressed:ring-1 aria-pressed:ring-primary/20"
                onClick={() => setActiveId(conversation.id)}
              >
                {conversation.kind === "institution_group" ? <Users /> : <MessageSquare />}
                <span>
                  {conversationLabel(conversation)}
                  <span className="block text-xs font-normal text-muted-foreground">
                    {conversationDescription(conversation)}
                  </span>
                </span>
              </Button>
            ))}
          </div>
          {!globalMessaging && (
            <div className="mt-5 space-y-3 border-t pt-4">
              <Input aria-label="Search contacts" placeholder="Search people…" value={search} onChange={(e) => setSearch(e.target.value)} />
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {people.map((person) => (
                  <Button key={person.id} variant="outline" className="h-auto w-full justify-start gap-3 whitespace-normal py-3 text-left" onClick={() => startDirect(person)}>
                    <MessageSquare />
                    <span>
                      {person.name}
                      <span className="block text-xs font-normal text-muted-foreground capitalize">{person.role.replaceAll("-", " ")}</span>
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Panel>
        <Panel title={active ? conversationLabel(active) : "Messages"} description={active ? `${active.kind.replaceAll("_", " ")} · realtime · double-click a message to reply` : "Select a conversation"}>
          <div className="flex h-80 flex-col gap-4 overflow-y-auto bg-muted/20 p-3 [scrollbar-color:hsl(var(--primary))_transparent] [scrollbar-width:thin] sm:h-96 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/60 hover:[&::-webkit-scrollbar-thumb]:bg-primary" aria-label="Conversation history" aria-live="polite">
            {!active?.messages.length && <Empty title="Start a conversation" description="Send a message or attach a file." />}
            {active?.messages.map((m) => (
              <article key={m.id} onDoubleClick={() => setReplyTo(m)} className={`max-w-[90%] cursor-pointer rounded-xl border p-3 sm:max-w-[80%] ${m.sender.id === workspace?.current_user.id ? "self-end bg-primary/10" : "self-start bg-background"}`}>
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-medium text-muted-foreground">{m.sender.name}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                    {m.sender.role.replaceAll("-", " ")}
                  </span>
                </div>
                {m.body && <p className="whitespace-pre-wrap break-words text-sm leading-6">{m.body}</p>}
                {m.attachment_url && <Attachment url={m.attachment_url} name={m.attachment_name || "Attachment"} type={m.attachment_type || ""} />}
                <p className="mt-2 text-[10px] text-muted-foreground">{m.created_at.slice(0, 16).replace("T", " · ")}</p>
              </article>
            ))}
            <div ref={bottomRef} />
          </div>
          <form className="space-y-3 border-t border-border/50 pt-4" onSubmit={(e) => { e.preventDefault(); void send(); }}>
            {replyTo && (
              <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted/40 p-3 text-sm">
                <div>
                  <p className="font-medium">Replying to {replyTo.sender.name}</p>
                  <p className="line-clamp-2 text-muted-foreground">{replyTo.body || replyTo.attachment_name || "Attachment"}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setReplyTo(null)}>Cancel</Button>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="message-text">Message</Label>
              <div className="relative">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEmojiOpen((open) => !open)} aria-label="Open emoji picker">
                  <Smile />
                  Emoji
                </Button>
                {emojiOpen && (
                  <div className="absolute bottom-full right-0 z-50 mb-2 overflow-hidden rounded-xl border bg-background shadow-xl">
                    <EmojiPicker
                      onEmojiClick={addEmoji}
                      theme={resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT}
                      width={320}
                      height={380}
                      lazyLoadEmojis
                    />
                  </div>
                )}
              </div>
            </div>
            <Textarea
              id="message-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
                e.preventDefault();
                void send();
              }}
              placeholder={replyTo ? "Write your reply…" : "Write a message…"}
              maxLength={5000}
            />
            {attachment && (
              <div className="rounded-lg border p-3">
                <Attachment url={attachment.url} name={attachment.name} type={attachment.type} />
                <Button type="button" variant="ghost" onClick={clearFile}><X />Remove attachment</Button>
              </div>
            )}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="max-w-xs space-y-2">
                <Label htmlFor="message-file"><Paperclip className="size-3" />Attachment · up to 10 MB</Label>
                <Input key={fileKey} id="message-file" type="file" accept="image/*,video/*,application/pdf,text/plain" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 10 * 1024 * 1024 || !(/^(image|video)\//.test(f.type) || ["application/pdf", "text/plain"].includes(f.type))) {
                    toast.error("Choose an image, video, PDF or text file up to 10 MB.");
                    return;
                  }
                  if (attachment) URL.revokeObjectURL(attachment.url);
                  setAttachment({ file: f, url: URL.createObjectURL(f), name: f.name, type: f.type });
                }} />
              </div>
              <Button type="submit" disabled={sending || !active || (!text.trim() && !attachment)}><Send />Send</Button>
            </div>
          </form>
        </Panel>
      </div>
    </>
  );
}

function Attachment({
  url,
  name,
  type,
}: {
  url: string;
  name: string;
  type: string;
}) {
  return (
    <div className="my-2 space-y-2">
      {type.startsWith("image/") ? (
        <Image
          src={url}
          width={320}
          height={240}
          unoptimized
          className="max-h-52 w-auto max-w-full rounded-lg object-contain"
          alt={name}
        />
      ) : type.startsWith("video/") ? (
        <video
          src={url}
          controls
          className="max-h-52 max-w-full rounded-lg"
          aria-label={name}
        />
      ) : null}
      <a
        href={url}
        download={name}
        className="block break-all text-xs underline"
      >
        {name}
      </a>
    </div>
  );
}
