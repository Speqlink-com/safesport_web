"use client";
import Image from "next/image";
import { useState } from "react";
import { Send, Paperclip, CheckCheck, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { identities, href, type Role } from "./catalog";
import { useWorkspace, newId, type Message } from "./store";
import { PageHeading, Panel, Empty, Go, Choice, Status } from "./ui";
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
        description={`${identities[role].title} · Updates from your local demo workflows.`}
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
            description="New updates will appear when relevant demo records change."
          />
        )}
      </Panel>
    </>
  );
}
export function Messages({ role }: { role: Role }) {
  const { state, setState } = useWorkspace();
  const [recipient, setRecipient] = useState<Role>(contacts[role][0]);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const thread = [role, recipient].sort().join(":");
  const messages = state.messages.filter(
    (m) => m.thread === thread && (m.sender === role || m.recipient === role),
  );
  const clearFile = () => {
    if (attachment) URL.revokeObjectURL(attachment.url);
    setAttachment(null);
    setFileKey((k) => k + 1);
  };
  function send() {
    if (!text.trim() && !attachment) return;
    const date = new Date().toISOString();
    const id = newId("msg");
    const message: Message = {
      id,
      thread,
      sender: role,
      recipient,
      text: text.trim(),
      date,
      file: attachment?.url,
      fileName: attachment?.name,
      fileType: attachment?.type,
    };
    setState((s) => ({
      ...s,
      messages: [...s.messages, message],
      notices:
        s.preferences[`${recipient}-messages`] === false
          ? s.notices
          : [
              {
                id: `notice-${id}`,
                role: recipient,
                title: `New message from ${s.accounts[role]?.name || identities[role].name}`,
                path: "messages",
                read: false,
                date,
              },
              ...s.notices,
            ],
    }));
    setText("");
    setAttachment(null);
    setFileKey((k) => k + 1);
    toast.success("Message added to the local conversation");
  }
  return (
    <>
      <PageHeading
        title="Messages"
        description="Private demo conversations with your connected team. Messages are local to this tab and are never sent externally."
      />
      <div className="grid min-h-[600px] gap-5 lg:grid-cols-[260px_1fr]">
        <Panel title="Conversations">
          <Input
            aria-label="Search contacts"
            placeholder="Search contacts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="space-y-2">
            {contacts[role]
              .filter((r) =>
                `${identities[r].name} ${identities[r].title}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((r) => (
                <Button
                  key={r}
                  variant="ghost"
                  aria-pressed={recipient === r}
                  className="h-auto w-full justify-start gap-3 whitespace-normal py-3 text-left aria-pressed:bg-primary/10 aria-pressed:ring-1 aria-pressed:ring-primary/20"
                  onClick={() => {
                    setRecipient(r);
                    setText("");
                    clearFile();
                  }}
                >
                  <MessageSquare />
                  <span>
                    {state.accounts[r]?.name || identities[r].name}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {identities[r].title}
                    </span>
                  </span>
                </Button>
              ))}
          </div>
        </Panel>
        <Panel
          title={state.accounts[recipient]?.name || identities[recipient].name}
          description={`${identities[recipient].title} · Demo conversation`}
        >
          <div
            className="flex h-80 flex-col gap-4 overflow-y-auto bg-muted/20 p-3 sm:h-96"
            aria-label="Conversation history"
            aria-live="polite"
          >
            {!messages.length && (
              <Empty
                title="Start a conversation"
                description="Send a message or attach a file to this local conversation."
              />
            )}
            {messages.map((m) => (
              <article
                key={m.id}
                className={`max-w-[90%] rounded-xl border p-3 sm:max-w-[80%] ${m.sender === role ? "self-end bg-primary/10" : "self-start bg-background"}`}
              >
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  {state.accounts[m.sender]?.name || identities[m.sender].name}
                </p>
                {m.text && (
                  <p className="whitespace-pre-wrap break-words text-sm leading-6">
                    {m.text}
                  </p>
                )}
                {m.file && (
                  <Attachment
                    url={m.file}
                    name={m.fileName || "Attachment"}
                    type={m.fileType || ""}
                  />
                )}
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {m.date.slice(0, 16).replace("T", " · ")} · Local
                </p>
              </article>
            ))}
          </div>
          <form
            className="space-y-3 border-t border-border/50 pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <Label htmlFor="message-text">Message</Label>
            <Textarea
              id="message-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a message…"
              maxLength={5000}
            />
            {attachment && (
              <div className="rounded-lg border p-3">
                <Attachment
                  url={attachment.url}
                  name={attachment.name}
                  type={attachment.type}
                />
                <Button variant="ghost" onClick={clearFile}>
                  <X />
                  Remove attachment
                </Button>
              </div>
            )}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="max-w-xs space-y-2">
                <Label htmlFor="message-file">
                  <Paperclip className="size-3" />
                  Attachment · up to 10 MB
                </Label>
                <Input
                  key={fileKey}
                  id="message-file"
                  type="file"
                  accept="image/*,video/*,application/pdf,text/plain"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (
                      f.size > 10 * 1024 * 1024 ||
                      !(
                        /^(image|video)\//.test(f.type) ||
                        ["application/pdf", "text/plain"].includes(f.type)
                      )
                    ) {
                      toast.error(
                        "Choose an image, video, PDF or text file up to 10 MB.",
                      );
                      return;
                    }
                    if (attachment) URL.revokeObjectURL(attachment.url);
                    setAttachment({
                      url: URL.createObjectURL(f),
                      name: f.name,
                      type: f.type,
                    });
                  }}
                />
              </div>
              <Button type="submit" disabled={!text.trim() && !attachment}>
                <Send />
                Send locally
              </Button>
            </div>
          </form>
          <p className="text-xs text-muted-foreground">
            Switch demo roles to view the recipient’s conversation. Clinical
            information must stay within the authorized care relationship.
          </p>
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
