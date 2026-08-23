import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Priority, StudyTask, Subject, StudentProfile, Topic, TopicStatus, Unit } from "@/lib/types";

/**
 * Live data hooks (Lovable Cloud database). RLS scopes every query to the
 * signed-in student, so these hooks only ever see the current user's rows.
 */

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not authenticated");
  return data.user.id;
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<StudentProfile | null> => {
      const uid = await requireUserId();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();
      if (error) throw error;
      return data as StudentProfile | null;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<StudentProfile>) => {
      const uid = await requireUserId();
      const { error } = await supabase.from("profiles").update(patch).eq("user_id", uid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------
export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async (): Promise<Subject[]> => {
      const { data, error } = await supabase.from("subjects").select("*").order("created_at");
      if (error) throw error;
      return data as Subject[];
    },
  });
}

export function useSubject(subjectId: string) {
  return useQuery({
    queryKey: ["subjects", subjectId],
    queryFn: async (): Promise<Subject | null> => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", subjectId)
        .maybeSingle();
      if (error) throw error;
      return data as Subject | null;
    },
    enabled: !!subjectId,
  });
}

export function useAddSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; code: string; description?: string; exam_date?: string | null }) => {
      const uid = await requireUserId();
      const { error } = await supabase.from("subjects").insert({ ...input, user_id: uid });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string; name?: string; code?: string; description?: string; exam_date?: string | null }) => {
      const { error } = await supabase.from("subjects").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      qc.invalidateQueries({ queryKey: ["units"] });
      qc.invalidateQueries({ queryKey: ["topics"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Units & topics (syllabus)
// ---------------------------------------------------------------------------
export function useUnits(subjectId?: string) {
  return useQuery({
    queryKey: ["units", subjectId ?? "all"],
    queryFn: async (): Promise<Unit[]> => {
      let q = supabase.from("units").select("*").order("order_index").order("created_at");
      if (subjectId) q = q.eq("subject_id", subjectId);
      const { data, error } = await q;
      if (error) throw error;
      return data as Unit[];
    },
  });
}

export function useTopics(subjectId?: string) {
  return useQuery({
    queryKey: ["topics", subjectId ?? "all"],
    queryFn: async (): Promise<Topic[]> => {
      let q = supabase.from("topics").select("*").order("order_index").order("created_at");
      if (subjectId) q = q.eq("subject_id", subjectId);
      const { data, error } = await q;
      if (error) throw error;
      return data as Topic[];
    },
  });
}

export function useAddUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { subject_id: string; title: string }) => {
      const uid = await requireUserId();
      const { error } = await supabase.from("units").insert({ ...input, user_id: uid });
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["units"] });
      qc.invalidateQueries({ queryKey: ["units", v.subject_id] });
    },
  });
}

export function useDeleteUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("units").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["units"] });
      qc.invalidateQueries({ queryKey: ["topics"] });
    },
  });
}

export function useAddTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { subject_id: string; unit_id: string | null; title: string; priority: Priority }) => {
      const uid = await requireUserId();
      const { error } = await supabase.from("topics").insert({ ...input, user_id: uid });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  });
}

export function useUpdateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Partial<Pick<Topic, "title" | "priority" | "status" | "mastery" | "last_studied_at">>) => {
      const { error } = await supabase.from("topics").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  });
}

export function useDeleteTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("topics").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  });
}

// ---------------------------------------------------------------------------
// Study tasks (planner)
// ---------------------------------------------------------------------------
export function useStudyTasks(date?: string) {
  return useQuery({
    queryKey: ["study-tasks", date ?? "all"],
    queryFn: async (): Promise<StudyTask[]> => {
      let q = supabase.from("study_tasks").select("*").order("task_date").order("created_at");
      if (date) q = q.eq("task_date", date);
      const { data, error } = await q;
      if (error) throw error;
      return data as StudyTask[];
    },
  });
}

export function useAddStudyTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; description?: string; task_date: string; estimated_minutes: number; subject_id?: string | null }) => {
      const uid = await requireUserId();
      const { error } = await supabase.from("study_tasks").insert({ ...input, user_id: uid });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["study-tasks"] }),
  });
}

export function useUpdateStudyTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Partial<Pick<StudyTask, "title" | "description" | "task_date" | "estimated_minutes" | "status" | "subject_id">>) => {
      const { error } = await supabase.from("study_tasks").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["study-tasks"] }),
  });
}

export function useDeleteStudyTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("study_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["study-tasks"] }),
  });
}

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------
export function topicStats(topics: Topic[] | undefined, subjectId?: string) {
  const list = (topics ?? []).filter((t) => !subjectId || t.subject_id === subjectId);
  const total = list.length;
  const completed = list.filter((t) => t.status === "completed").length;
  const review = list.filter((t) => t.status === "review").length;
  const weak = list.filter((t) => t.mastery < 50 && t.status !== "completed").length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  const lastStudied = list
    .map((t) => t.last_studied_at)
    .filter(Boolean)
    .sort()
    .at(-1) as string | undefined;
  return { total, completed, review, weak, progress, lastStudied };
}

export function markTopicStatus(topic: Topic, status: TopicStatus) {
  return {
    id: topic.id,
    status,
    last_studied_at: new Date().toISOString(),
    mastery:
      status === "completed" ? Math.max(topic.mastery, 80) : status === "review" ? Math.min(topic.mastery, 45) : topic.mastery,
  };
}
