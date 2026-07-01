import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface StudySession {
  id: string;
  duration: number;
  startTime: number;
  endTime: number;
  completed: boolean;
  type: "deep" | "pomodoro" | "light";
}

export interface AllowedApp {
  id: string;
  name: string;
  iconName: string;
  category: string;
}

interface StudyContextType {
  sessions: StudySession[];
  allowedApps: AllowedApp[];
  addSession: (session: StudySession) => void;
  addAllowedApp: (app: AllowedApp) => void;
  removeAllowedApp: (id: string) => void;
  todayStudyMinutes: number;
  streak: number;
  weeklyMinutes: number[];
}

const StudyContext = createContext<StudyContextType | null>(null);

const SESSIONS_KEY = "studylock_sessions";
const APPS_KEY = "studylock_apps";

const DEFAULT_APPS: AllowedApp[] = [
  { id: "1", name: "Calculator", iconName: "calculator", category: "Tools" },
  { id: "2", name: "Notes", iconName: "file-text", category: "Productivity" },
  { id: "3", name: "Dictionary", iconName: "book-open", category: "Education" },
];

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [allowedApps, setAllowedApps] = useState<AllowedApp[]>(DEFAULT_APPS);

  useEffect(() => {
    (async () => {
      try {
        const [savedSessions, savedApps] = await Promise.all([
          AsyncStorage.getItem(SESSIONS_KEY),
          AsyncStorage.getItem(APPS_KEY),
        ]);
        if (savedSessions) setSessions(JSON.parse(savedSessions));
        if (savedApps) setAllowedApps(JSON.parse(savedApps));
      } catch {}
    })();
  }, []);

  const addSession = useCallback(async (session: StudySession) => {
    setSessions((prev) => {
      const next = [session, ...prev];
      AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addAllowedApp = useCallback(async (app: AllowedApp) => {
    setAllowedApps((prev) => {
      if (prev.find((a) => a.id === app.id)) return prev;
      const next = [...prev, app];
      AsyncStorage.setItem(APPS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const removeAllowedApp = useCallback(async (id: string) => {
    setAllowedApps((prev) => {
      const next = prev.filter((a) => a.id !== id);
      AsyncStorage.setItem(APPS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const todayStudyMinutes = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions
      .filter((s) => s.completed && s.startTime >= today.getTime())
      .reduce((sum, s) => sum + s.duration, 0);
  }, [sessions]);

  const streak = React.useMemo(() => {
    if (sessions.length === 0) return 0;
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const day = new Date(today.getTime() - i * 86400000);
      const dayEnd = new Date(day.getTime() + 86400000);
      const hasSession = sessions.some(
        (s) => s.completed && s.startTime >= day.getTime() && s.startTime < dayEnd.getTime()
      );
      if (hasSession) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  }, [sessions]);

  const weeklyMinutes = React.useMemo(() => {
    const result = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(today.getTime() - i * 86400000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      result[6 - i] = sessions
        .filter((s) => s.completed && s.startTime >= dayStart.getTime() && s.startTime < dayEnd.getTime())
        .reduce((sum, s) => sum + s.duration, 0);
    }
    return result;
  }, [sessions]);

  return (
    <StudyContext.Provider
      value={{ sessions, allowedApps, addSession, addAllowedApp, removeAllowedApp, todayStudyMinutes, streak, weeklyMinutes }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used inside StudyProvider");
  return ctx;
}
