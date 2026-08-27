import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage } from "@/lib/types";

export interface ChatSession {
  id: string;
  title: string;
  mode: string;
  updated_at: string;
}

export function useChatSessions() {
  return useQuery({
    queryKey: ["chat-sessions"],
    queryFn: async (): Promise<ChatSession[]> => {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("id, title, mode, updated_at")
        .order("updated_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as ChatSession[];
    },
  });
}

export function useChatMessages(sessionId: string | null) {
  return useQuery({
    queryKey: ["chat-messages", sessionId],
    enabled: !!sessionId,
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, role, content, sources, confidence, created_at")
        .eq("session_id", sessionId!)
        .order("created_at");
      if (error) throw error;
      return (data ?? []).map((m): ChatMessage => {
        const base: ChatMessage = {
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          created_at: m.created_at,
        };
        if (typeof m.confidence === "number") base.confidence = m.confidence;
        if (Array.isArray(m.sources)) base.sources = m.sources as string[];
        return base;
      });
    },
  });
}

export function useChatInvalidator() {
  const qc = useQueryClient();
  return (sessionId?: string | null) => {
    qc.invalidateQueries({ queryKey: ["chat-sessions"] });
    if (sessionId) qc.invalidateQueries({ queryKey: ["chat-messages", sessionId] });
  };
}
