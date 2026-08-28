import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Page, PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useChatInvalidator, useChatMessages, useChatSessions } from "@/hooks/use-chat";
import { useSubjects } from "@/hooks/use-data";
import { askTutor } from "@/lib/tutor.functions";
import type { TutorMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tutor")({
  head: () => ({
    meta: [
      { title: "AI Tutor · ExamSense" },
      {
        name: "description",
        content: "Ask questions about your own notes and get answers with citations in simple, exam or deep mode.",
      },
      { property: "og:title", content: "AI Tutor · ExamSense" },
      { property: "og:description", content: "Retrieval-augmented tutoring grounded in your study material." },
    ],
  }),
  component: TutorPage,
});

const MODES: { value: TutorMode; label: string }[] = [
  { value: "simple", label: "Simple explanation" },
  { value: "exam", label: "Exam answer" },
  { value: "deep", label: "Deep explanation" },
];

function TutorPage() {
  const { data: subjects } = useSubjects();
  const { data: sessions } = useChatSessions();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { data: messages } = useChatMessages(sessionId);
  const invalidate = useChatInvalidator();
  const ask = useServerFn(askTutor);

  const [mode, setMode] = useState<TutorMode>("simple");
  const [subjectId, setSubjectId] = useState("all");
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (question.length < 2) return;
    setInput("");
    setPending(true);
    try {
      const res = await ask({
        data: {
          question,
          mode,
          sessionId,
          subjectId: subjectId === "all" ? null : subjectId,
        },
      });
      setSessionId(res.sessionId);
      invalidate(res.sessionId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The tutor could not answer");
      setInput(question);
    } finally {
      setPending(false);
    }
  }

  return (
    <Page>
      <PageHeader
        title="AI Tutor"
        description="Answers are grounded in the documents you uploaded, with citations you can verify."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="rounded-2xl lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="font-display text-base">History</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSessionId(null)}>
              New
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {(sessions ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
              (sessions ?? []).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSessionId(s.id)}
                  className={cn(
                    "w-full truncate rounded-xl px-3 py-2 text-left text-sm transition-colors",
                    sessionId === s.id ? "bg-primary/10 text-primary" : "hover:bg-muted",
                  )}
                >
                  {s.title || "Untitled"}
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="flex min-h-[60vh] flex-col rounded-2xl lg:col-span-3">
          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4">
            <ScrollArea className="min-h-0 flex-1 pr-2">
              <div className="space-y-4">
                {(messages ?? []).length === 0 ? (
                  <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    <Sparkles className="mx-auto mb-2 size-5 text-primary" />
                    Ask anything from your syllabus, notes or past papers.
                  </div>
                ) : (
                  (messages ?? []).map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                        m.role === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      {m.role === "assistant" && m.sources?.length ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {m.sources.map((s) => (
                            <Badge key={s} variant="outline" className="text-[11px]">
                              {s}
                            </Badge>
                          ))}
                          {typeof m.confidence === "number" ? (
                            <Badge variant="secondary" className="text-[11px]">
                              {m.confidence}% confidence
                            </Badge>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
                {pending ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Searching your material…
                  </div>
                ) : null}
              </div>
            </ScrollArea>

            <form className="space-y-2" onSubmit={send}>
              <div className="flex flex-wrap gap-2">
                <Select value={mode} onValueChange={(v) => setMode(v as TutorMode)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subjects</SelectItem>
                    {(subjects ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Explain normalization with an example…"
                  rows={2}
                  className="resize-none"
                />
                <Button type="submit" size="icon" className="h-auto" disabled={pending}>
                  {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
