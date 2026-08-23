/**
 * ExamSense domain models.
 *
 * These interfaces mirror the database schema (see the initial migration) and
 * the service layer contracts. Phase 2 wires profiles/subjects/units/topics/
 * study tasks to the live database; the remaining models are served by mock
 * services (src/lib/mock-data.ts) behind the same shapes so real services can
 * drop in later without touching the UI.
 */

export type Priority = "high" | "medium" | "low";
export type TopicStatus = "not_started" | "in_progress" | "completed" | "review";
export type WeakPriority = "critical" | "high" | "medium";
export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "mcq" | "short" | "long" | "application";
export type TutorMode = "simple" | "exam" | "deep";

export interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  college: string | null;
  course: string | null;
  year: number | null;
  semester: number | null;
  preferred_study_duration: number;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  code: string;
  description: string | null;
  exam_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  order_index: number;
  created_at: string;
}

export interface Topic {
  id: string;
  user_id: string;
  subject_id: string;
  unit_id: string | null;
  title: string;
  priority: Priority;
  status: TopicStatus;
  mastery: number;
  order_index: number;
  last_studied_at: string | null;
  created_at: string;
  updated_at: string;
}

export type DocumentStatus = "uploaded" | "processing" | "processed" | "failed";
export type DocumentType = "note" | "pdf" | "material";

export interface StudyDocument {
  id: string;
  filename: string;
  doc_type: DocumentType;
  subject: string;
  status: DocumentStatus;
  page_count: number;
  size_label: string;
  uploaded_at: string;
}

export type PaperStatus = "uploaded" | "analyzing" | "analyzed";

export interface QuestionPaper {
  id: string;
  subject: string;
  university: string;
  exam_name: string;
  academic_year: string;
  semester: string;
  status: PaperStatus;
  uploaded_at: string;
}

export interface Question {
  id: string;
  subject: string;
  topic: string;
  question_text: string;
  question_type: QuestionType;
  difficulty: Difficulty;
  options?: string[];
  correct_answer: string;
  explanation?: string;
}

export interface MockTestConfig {
  subject: string;
  questionCount: number;
  durationMinutes: number;
}

export interface TestResult {
  score: number;
  total: number;
  percentage: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  topicPerformance: { topic: string; correct: number; total: number }[];
  answers: { questionId: string; selected: string | null }[];
}

export type TaskStatus = "pending" | "completed" | "skipped";

export interface StudyTask {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  task_date: string;
  estimated_minutes: number;
  status: TaskStatus;
  source: "manual" | "ai";
  created_at: string;
  updated_at: string;
}

export interface WeakTopicItem {
  id: string;
  topic: string;
  subject: string;
  mastery: number;
  previous_score: number | null;
  priority: WeakPriority;
  recommended_minutes: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  confidence?: number;
  sources?: string[];
}

export interface ProgressRecord {
  date: string;
  study_minutes: number;
  questions_attempted: number;
  questions_correct: number;
}

export interface MistakeExplanation {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  whyWrong: string;
  conceptToReview: string;
  recommendedPractice: string;
}
