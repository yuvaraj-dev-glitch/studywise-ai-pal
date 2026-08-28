import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, Library } from "lucide-react";

import { Page, PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { topicStats, useSubject, useTopics, useUnits } from "@/hooks/use-data";
import { formatBytes, useDocuments, usePapers } from "@/hooks/use-materials";

export const Route = createFileRoute("/_authenticated/subjects/$subjectId")({
  head: () => ({
    meta: [
      { title: "Subject Details · ExamSense" },
      {
        name: "description",
        content: "Overview, syllabus, notes, previous papers, practice and analytics for a single subject.",
      },
      { property: "og:title", content: "Subject Details · ExamSense" },
      { property: "og:description", content: "Everything about one subject in one place." },
    ],
  }),
  component: SubjectDetail,
});

function SubjectDetail() {
  const { subjectId } = Route.useParams();
  const { data: subject } = useSubject(subjectId);
  const { data: units } = useUnits(subjectId);
  const { data: topics } = useTopics(subjectId);
  const { data: docs } = useDocuments(subjectId);
  const { data: papers } = usePapers(subjectId);

  const stats = topicStats(topics, subjectId);

  return (
    <Page>
      <Button asChild variant="ghost" size="sm" className="mb-2">
        <Link to="/subjects">
          <ArrowLeft className="size-4" /> All subjects
        </Link>
      </Button>

      <PageHeader
        title={subject?.name ?? "Subject"}
        description={subject?.description ?? subject?.code ?? ""}
        action={
          <Button asChild>
            <Link to="/tutor">Ask the tutor</Link>
          </Button>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="papers">Papers</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card className="rounded-2xl">
            <CardContent className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
              <Stat label="Units" value={units?.length ?? 0} />
              <Stat label="Topics" value={stats.total} />
              <Stat label="Completed" value={stats.completed} />
              <Stat label="Exam date" value={subject?.exam_date ?? "—"} />
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="font-display text-base">Syllabus progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={stats.progress} className="h-2" />
              <p className="mt-2 text-sm text-muted-foreground">{stats.progress}% complete</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="syllabus" className="mt-4 space-y-3">
          {(units ?? []).length === 0 ? (
            <Empty text="No units yet — add them in the Syllabus Manager." />
          ) : (
            (units ?? []).map((u) => (
              <Card key={u.id} className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="font-display text-base">{u.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(topics ?? [])
                    .filter((t) => t.unit_id === u.id)
                    .map((t) => (
                      <div key={t.id} className="flex items-center gap-3 rounded-xl border p-3 text-sm">
                        <span className="min-w-0 flex-1 truncate">{t.title}</span>
                        <Badge variant="secondary">{t.status.replace("_", " ")}</Badge>
                        <Badge variant="outline">{t.mastery}%</Badge>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))
          )}
          <Button asChild variant="outline">
            <Link to="/syllabus">Open Syllabus Manager</Link>
          </Button>
        </TabsContent>

        <TabsContent value="notes" className="mt-4 space-y-3">
          {(docs ?? []).length === 0 ? (
            <Empty text="No documents for this subject yet." />
          ) : (
            (docs ?? []).map((d) => (
              <Card key={d.id} className="rounded-2xl">
                <CardContent className="flex items-center gap-3 p-4">
                  <FileText className="size-5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{d.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(d.size_bytes)} · {d.chunk_count} chunks
                    </p>
                  </div>
                  <Badge variant="outline">{d.status}</Badge>
                </CardContent>
              </Card>
            ))
          )}
          <Button asChild variant="outline">
            <Link to="/notes">Upload material</Link>
          </Button>
        </TabsContent>

        <TabsContent value="papers" className="mt-4 space-y-3">
          {(papers ?? []).length === 0 ? (
            <Empty text="No previous papers for this subject yet." />
          ) : (
            (papers ?? []).map((p) => (
              <Card key={p.id} className="rounded-2xl">
                <CardContent className="flex items-center gap-3 p-4">
                  <Library className="size-5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.filename ?? "Question paper"}</p>
                    <p className="text-xs text-muted-foreground">
                      {[p.university, p.academic_year].filter(Boolean).join(" · ") || "No metadata"}
                    </p>
                  </div>
                  <Badge variant="outline">{p.status}</Badge>
                </CardContent>
              </Card>
            ))
          )}
          <Button asChild variant="outline">
            <Link to="/papers">Upload paper</Link>
          </Button>
        </TabsContent>

        <TabsContent value="practice" className="mt-4 space-y-3">
          <Card className="rounded-2xl">
            <CardContent className="flex flex-wrap gap-2 p-4">
              <Button asChild>
                <Link to="/questions">Generate questions</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/test">Take a mock test</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/mistakes">Explain a mistake</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 space-y-3">
          <Card className="rounded-2xl">
            <CardContent className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
              <Stat label="Progress" value={`${stats.progress}%`} />
              <Stat label="Review" value={stats.review} />
              <Stat label="Weak" value={stats.weak} />
              <Stat
                label="Last studied"
                value={stats.lastStudied ? new Date(stats.lastStudied).toLocaleDateString() : "—"}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Page>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold">{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-8 text-center text-sm text-muted-foreground">{text}</CardContent>
    </Card>
  );
}
