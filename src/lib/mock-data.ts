import type {
  ChatMessage,
  MistakeExplanation,
  ProgressRecord,
  Question,
  QuestionPaper,
  StudyDocument,
  TutorMode,
  WeakTopicItem,
} from "./types";

/**
 * Mock services for features that are NOT yet backed by real engines
 * (documents, papers, AI tutor, question generation, analytics, weak topics).
 *
 * Each export is deliberately shaped like the future service contract so a
 * real implementation can replace it without changing any UI code.
 */

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

// ---------------------------------------------------------------------------
// Dashboard placeholder stats (streak/progress tracking lands in a later phase)
// ---------------------------------------------------------------------------
export const mockStats = {
  studyStreak: 12,
  todayMinutes: 85,
  todayGoalMinutes: 120,
};

// ---------------------------------------------------------------------------
// Documents (document processing pipeline arrives in a later phase)
// ---------------------------------------------------------------------------
export const mockDocuments: StudyDocument[] = [
  { id: "doc-1", filename: "PE_Unit1_Power_Devices_Notes.pdf", doc_type: "note", subject: "Power Electronics", status: "processed", page_count: 24, size_label: "1.8 MB", uploaded_at: daysAgo(2) },
  { id: "doc-2", filename: "Controlled_Rectifiers_Textbook_Ch4.pdf", doc_type: "pdf", subject: "Power Electronics", status: "processed", page_count: 41, size_label: "5.2 MB", uploaded_at: daysAgo(5) },
  { id: "doc-3", filename: "Signals_and_Systems_Formula_Sheet.pdf", doc_type: "material", subject: "Signals & Systems", status: "processed", page_count: 6, size_label: "0.4 MB", uploaded_at: daysAgo(7) },
  { id: "doc-4", filename: "DSP_Lecture_7_FFT.pdf", doc_type: "pdf", subject: "Digital Signal Processing", status: "processing", page_count: 18, size_label: "2.6 MB", uploaded_at: daysAgo(1) },
  { id: "doc-5", filename: "Control_Systems_Stability_Notes.pdf", doc_type: "note", subject: "Control Systems", status: "uploaded", page_count: 12, size_label: "0.9 MB", uploaded_at: daysAgo(0) },
  { id: "doc-6", filename: "EMFT_Waveguides_Summary.pdf", doc_type: "material", subject: "Electromagnetic Fields", status: "failed", page_count: 9, size_label: "1.1 MB", uploaded_at: daysAgo(9) },
];

// ---------------------------------------------------------------------------
// Previous year papers (analysis engine arrives in a later phase)
// ---------------------------------------------------------------------------
export const mockPapers: QuestionPaper[] = [
  { id: "paper-1", subject: "Power Electronics", university: "Anna University", exam_name: "B.E. EEE Semester V", academic_year: "2024-25", semester: "V", status: "analyzed", uploaded_at: daysAgo(12) },
  { id: "paper-2", subject: "Power Electronics", university: "Anna University", exam_name: "B.E. EEE Semester V", academic_year: "2023-24", semester: "V", status: "analyzed", uploaded_at: daysAgo(12) },
  { id: "paper-3", subject: "Signals & Systems", university: "Anna University", exam_name: "B.E. ECE Semester III", academic_year: "2024-25", semester: "III", status: "analyzing", uploaded_at: daysAgo(3) },
  { id: "paper-4", subject: "Control Systems", university: "JNTU Hyderabad", exam_name: "B.Tech EEE Semester IV", academic_year: "2023-24", semester: "IV", status: "uploaded", uploaded_at: daysAgo(1) },
  { id: "paper-5", subject: "Digital Signal Processing", university: "Anna University", exam_name: "B.E. ECE Semester V", academic_year: "2022-23", semester: "V", status: "analyzed", uploaded_at: daysAgo(20) },
];

// ---------------------------------------------------------------------------
// AI Tutor canned responses (no real model is connected in this phase)
// ---------------------------------------------------------------------------
export const tutorReplies: Record<TutorMode, string> = {
  simple:
    "Here's a simple way to think about it: break the concept into its core idea, one everyday analogy, and one worked example. For this topic, the core idea is energy conversion — the circuit reshapes electrical power using switching devices rather than dissipating it. Remember the switching device as a fast gate that opens and closes to control flow.",
  exam:
    "Exam-style answer (8 marks):\n\n1. Definition — state the concept precisely in one line.\n2. Principle — describe the operating principle with a neat labelled diagram.\n3. Key equations — write the governing expressions and define each symbol.\n4. Working — explain the sequence of operation in numbered steps.\n5. Application & limitation — close with one practical use and one constraint.\n\nTip: examiners award marks for structure, diagrams and correct units.",
  deep:
    "Deep explanation:\n\nStart from first principles — what physical quantity is conserved, and what the device actually does to it. Then look at the assumptions in the standard derivation and where they break down (non-ideal switches, source inductance, load variation). Finally, connect it to the neighbouring topics: this concept is the foundation for the next unit, where the same idea is extended to closed-loop control. Mastery here means being able to predict circuit behaviour before writing any equation.",
};

export const tutorSources = ["PE_Unit1_Power_Devices_Notes.pdf", "Controlled_Rectifiers_Textbook_Ch4.pdf"];

export const initialTutorMessages: ChatMessage[] = [
  {
    id: "msg-welcome",
    role: "assistant",
    content:
      "Hi! I'm your ExamSense tutor. Ask me anything from your syllabus — a concept you're stuck on, an exam-style answer, or a topic you want explained deeply. I'm running in demo mode for now, so my answers are samples until the AI engine is connected.",
    created_at: new Date().toISOString(),
    confidence: 92,
    sources: tutorSources,
  },
];

// ---------------------------------------------------------------------------
// Mock test question bank
// ---------------------------------------------------------------------------
export const mockTestQuestions: Question[] = [
  { id: "q1", subject: "Power Electronics", topic: "Power Semiconductor Devices", question_type: "mcq", difficulty: "easy", question_text: "Which of the following is a fully controlled power semiconductor device?", options: ["Diode", "SCR", "TRIAC", "UJT"], correct_answer: "SCR", explanation: "An SCR can be turned on by a gate pulse and turned off by forced commutation, making it fully controllable in the on-state control sense among the options given." },
  { id: "q2", subject: "Power Electronics", topic: "Power Semiconductor Devices", question_type: "mcq", difficulty: "medium", question_text: "The latching current of an SCR is:", options: ["Less than holding current", "Greater than holding current", "Equal to holding current", "Zero"], correct_answer: "Greater than holding current", explanation: "Latching current is the minimum anode current required to maintain conduction immediately after turn-on; it is typically 2–3× the holding current." },
  { id: "q3", subject: "Power Electronics", topic: "Controlled Rectifiers", question_type: "mcq", difficulty: "medium", question_text: "In a single-phase fully controlled rectifier with R load, the average output voltage is maximum when the firing angle α is:", options: ["0°", "45°", "90°", "180°"], correct_answer: "0°", explanation: "Average output V₀ = (2Vm/π)cosα for continuous conduction, which is maximum at α = 0°." },
  { id: "q4", subject: "Power Electronics", topic: "Controlled Rectifiers", question_type: "mcq", difficulty: "hard", question_text: "For a single-phase full converter feeding a highly inductive load, the output voltage becomes negative when:", options: ["α < 90°", "α > 90°", "α = 0°", "α = 45°"], correct_answer: "α > 90°", explanation: "Beyond 90° the average output voltage reverses polarity and the converter operates in inversion mode." },
  { id: "q5", subject: "Power Electronics", topic: "TRIAC & DIAC", question_type: "mcq", difficulty: "easy", question_text: "A TRIAC can conduct current in:", options: ["One direction only", "Both directions", "Only when gate is negative", "Only above breakdown voltage"], correct_answer: "Both directions", explanation: "A TRIAC is a bidirectional device that conducts in both directions when triggered." },
  { id: "q6", subject: "Power Electronics", topic: "Choppers", question_type: "mcq", difficulty: "medium", question_text: "In a step-down chopper, if the duty cycle is 0.4 and supply is 200 V, the average output voltage is:", options: ["80 V", "120 V", "160 V", "200 V"], correct_answer: "80 V", explanation: "For a step-down (buck) chopper, V₀ = duty cycle × Vs = 0.4 × 200 = 80 V." },
  { id: "q7", subject: "Power Electronics", topic: "Inverters", question_type: "mcq", difficulty: "medium", question_text: "A 120° conduction mode three-phase inverter has, at any instant:", options: ["One device conducting", "Two devices conducting", "Three devices conducting", "All six devices conducting"], correct_answer: "Two devices conducting", explanation: "In 120° mode each device conducts for 120°, so exactly two devices conduct at any instant." },
  { id: "q8", subject: "Power Electronics", topic: "Power Semiconductor Devices", question_type: "mcq", difficulty: "hard", question_text: "The main advantage of an IGBT over a power BJT is:", options: ["Higher on-state loss", "Voltage-controlled gate with low drive power", "Slower switching", "Higher cost"], correct_answer: "Voltage-controlled gate with low drive power", explanation: "IGBTs combine MOSFET-style voltage-driven gates with BJT-like conduction, drastically reducing gate drive power." },
  { id: "q9", subject: "Power Electronics", topic: "Choppers", question_type: "mcq", difficulty: "hard", question_text: "In a boost converter, output voltage is ideally:", options: ["Vs × D", "Vs / (1 − D)", "Vs × (1 − D)", "Vs / D"], correct_answer: "Vs / (1 − D)", explanation: "Volt-second balance on the inductor gives V₀ = Vs/(1 − D) for continuous conduction." },
  { id: "q10", subject: "Power Electronics", topic: "Inverters", question_type: "mcq", difficulty: "easy", question_text: "PWM techniques in inverters are primarily used to:", options: ["Increase switching losses", "Control output voltage and reduce harmonics", "Eliminate the DC source", "Reduce device count"], correct_answer: "Control output voltage and reduce harmonics", explanation: "PWM shapes the output waveform, controlling fundamental amplitude and pushing harmonics to higher, easily filtered frequencies." },
];

// ---------------------------------------------------------------------------
// Question generator placeholder bank
// ---------------------------------------------------------------------------
export function buildGeneratedQuestions(opts: {
  subject: string;
  topic: string;
  type: string;
  difficulty: string;
  count: number;
}): Question[] {
  const stems: Record<string, string[]> = {
    mcq: [
      `Which statement best describes the operating principle of ${opts.topic}?`,
      `In ${opts.topic}, the primary design trade-off is between:`,
      `The most common cause of failure in ${opts.topic} applications is:`,
    ],
    short: [
      `Define ${opts.topic} and state its two most important characteristics.`,
      `List three practical applications of ${opts.topic} and justify one.`,
      `Explain the role of ${opts.topic} within ${opts.subject} in 4–5 lines.`,
    ],
    long: [
      `Explain the working of ${opts.topic} with a neat diagram. Derive the governing equations and discuss two practical limitations.`,
      `Compare the two standard approaches used in ${opts.topic}. Include circuit diagrams, waveforms and a comparative table.`,
    ],
    application: [
      `A practical system using ${opts.topic} fails under overload. Analyse the probable causes and propose a design fix with calculations.`,
      `Design a ${opts.topic}-based solution for a 1 kW application. Justify device selection and estimate efficiency.`,
    ],
  };
  const pool = stems[opts.type] ?? stems.short;
  return Array.from({ length: opts.count }, (_, i) => ({
    id: `gen-${i}`,
    subject: opts.subject,
    topic: opts.topic,
    question_type: opts.type as Question["question_type"],
    difficulty: opts.difficulty as Question["difficulty"],
    question_text: pool[i % pool.length],
    options:
      opts.type === "mcq"
        ? ["Option A — placeholder", "Option B — placeholder", "Option C — placeholder", "Option D — placeholder"]
        : undefined,
    correct_answer: opts.type === "mcq" ? "Option A — placeholder" : "Model answer will be generated by the AI engine.",
    explanation: "Placeholder — the AI generation engine will produce the full answer and explanation in a later phase.",
  }));
}

// ---------------------------------------------------------------------------
// Weak topics
// ---------------------------------------------------------------------------
export const mockWeakTopics: WeakTopicItem[] = [
  { id: "wt-1", topic: "Single-phase Full Converters", subject: "Power Electronics", mastery: 32, previous_score: 40, priority: "critical", recommended_minutes: 45 },
  { id: "wt-2", topic: "Boost Converter Design", subject: "Power Electronics", mastery: 41, previous_score: 55, priority: "high", recommended_minutes: 30 },
  { id: "wt-3", topic: "Z-Transform Properties", subject: "Digital Signal Processing", mastery: 47, previous_score: 50, priority: "high", recommended_minutes: 30 },
  { id: "wt-4", topic: "Routh-Hurwitz Criterion", subject: "Control Systems", mastery: 55, previous_score: 62, priority: "medium", recommended_minutes: 20 },
];

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------
export const weeklyStudyMinutes = [
  { day: "Mon", minutes: 65 },
  { day: "Tue", minutes: 90 },
  { day: "Wed", minutes: 40 },
  { day: "Thu", minutes: 110 },
  { day: "Fri", minutes: 75 },
  { day: "Sat", minutes: 130 },
  { day: "Sun", minutes: 85 },
];

export const testPerformanceSeries = [
  { test: "Test 1", score: 58 },
  { test: "Test 2", score: 64 },
  { test: "Test 3", score: 61 },
  { test: "Test 4", score: 72 },
  { test: "Test 5", score: 78 },
  { test: "Test 6", score: 84 },
];

export const masterySeries: { topic: string; mastery: number }[] = [
  { topic: "Devices", mastery: 78 },
  { topic: "Rectifiers", mastery: 52 },
  { topic: "Choppers", mastery: 44 },
  { topic: "Inverters", mastery: 63 },
  { topic: "AC Control", mastery: 71 },
];

export const recentProgress: ProgressRecord[] = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
  study_minutes: 30 + Math.round(70 * Math.abs(Math.sin(i * 1.3))),
  questions_attempted: 8 + Math.round(12 * Math.abs(Math.sin(i * 0.9))),
  questions_correct: 5 + Math.round(9 * Math.abs(Math.sin(i * 0.9 + 0.5))),
}));

// ---------------------------------------------------------------------------
// Mistake explainer sample
// ---------------------------------------------------------------------------
export const sampleMistake: MistakeExplanation = {
  question: "In a step-down chopper, if the duty cycle is 0.4 and supply is 200 V, the average output voltage is:",
  studentAnswer: "120 V",
  correctAnswer: "80 V",
  whyWrong:
    "You multiplied the supply by (1 − D) instead of D. In a step-down chopper the output is the supply multiplied by the fraction of time the switch is ON — V₀ = D × Vs = 0.4 × 200 = 80 V. The (1 − D) term belongs to the boost converter formula, which is the likely source of confusion.",
  conceptToReview: "Duty cycle and volt-second balance in DC-DC converters",
  recommendedPractice: "Solve 5 numericals on buck and boost converters, writing V₀ symbolically before substituting numbers.",
};
