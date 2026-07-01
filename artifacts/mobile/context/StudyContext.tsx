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

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  createdAt: number;
  carriedOver: boolean;
}

interface StudyContextType {
  sessions: StudySession[];
  allowedApps: AllowedApp[];
  todos: TodoItem[];
  studentName: string;
  nameLoaded: boolean;
  addSession: (session: StudySession) => void;
  addAllowedApp: (app: AllowedApp) => void;
  removeAllowedApp: (id: string) => void;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  editTodo: (id: string, text: string) => void;
  deleteTodo: (id: string) => void;
  transferTomorrow: (id: string) => void;
  setStudentName: (name: string) => void;
  todayStudyMinutes: number;
  streak: number;
  weeklyMinutes: number[];
}

const StudyContext = createContext<StudyContextType | null>(null);

const SESSIONS_KEY = "studylock_sessions";
const APPS_KEY = "studylock_apps";
const TODOS_KEY = "studylock_todos";
const NAME_KEY = "studylock_name";

const DEFAULT_APPS: AllowedApp[] = [
  { id: "1", name: "Calculator", iconName: "calculator", category: "Tools" },
  { id: "2", name: "Notes", iconName: "file-text", category: "Productivity" },
  { id: "3", name: "Dictionary", iconName: "book-open", category: "Education" },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function persist(key: string, value: unknown) {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
}

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [allowedApps, setAllowedApps] = useState<AllowedApp[]>(DEFAULT_APPS);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [studentName, setStudentNameState] = useState("");
  const [nameLoaded, setNameLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [savedSessions, savedApps, savedTodos, savedName] = await Promise.all([
          AsyncStorage.getItem(SESSIONS_KEY),
          AsyncStorage.getItem(APPS_KEY),
          AsyncStorage.getItem(TODOS_KEY),
          AsyncStorage.getItem(NAME_KEY),
        ]);
        if (savedSessions) setSessions(JSON.parse(savedSessions));
        if (savedApps) setAllowedApps(JSON.parse(savedApps));
        if (savedTodos) setTodos(JSON.parse(savedTodos));
        if (savedName) setStudentNameState(JSON.parse(savedName));
      } catch {}
      setNameLoaded(true);
    })();
  }, []);

  const setStudentName = useCallback((name: string) => {
    setStudentNameState(name);
    AsyncStorage.setItem(NAME_KEY, JSON.stringify(name)).catch(() => {});
  }, []);

  const addSession = useCallback((session: StudySession) => {
    setSessions((prev) => {
      const next = [session, ...prev];
      persist(SESSIONS_KEY, next);
      return next;
    });
  }, []);

  const addAllowedApp = useCallback((app: AllowedApp) => {
    setAllowedApps((prev) => {
      if (prev.find((a) => a.id === app.id)) return prev;
      const next = [...prev, app];
      persist(APPS_KEY, next);
      return next;
    });
  }, []);

  const removeAllowedApp = useCallback((id: string) => {
    setAllowedApps((prev) => {
      const next = prev.filter((a) => a.id !== id);
      persist(APPS_KEY, next);
      return next;
    });
  }, []);

  const addTodo = useCallback((text: string) => {
    const item: TodoItem = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      text: text.trim(),
      completed: false,
      date: todayStr(),
      createdAt: Date.now(),
      carriedOver: false,
    };
    setTodos((prev) => {
      const next = [...prev, item];
      persist(TODOS_KEY, next);
      return next;
    });
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) => {
      const next = prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t);
      persist(TODOS_KEY, next);
      return next;
    });
  }, []);

  const editTodo = useCallback((id: string, text: string) => {
    setTodos((prev) => {
      const next = prev.map((t) => t.id === id ? { ...t, text: text.trim() } : t);
      persist(TODOS_KEY, next);
      return next;
    });
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => {
      const next = prev.filter((t) => t.id !== id);
      persist(TODOS_KEY, next);
      return next;
    });
  }, []);

  const transferTomorrow = useCallback((id: string) => {
    setTodos((prev) => {
      const next = prev.map((t) => t.id === id ? { ...t, date: tomorrowStr(), carriedOver: true, completed: false } : t);
      persist(TODOS_KEY, next);
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
      if (hasSession) count++;
      else if (i > 0) break;
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
      value={{
        sessions, allowedApps, todos, studentName, nameLoaded,
        addSession, addAllowedApp, removeAllowedApp,
        addTodo, toggleTodo, editTodo, deleteTodo, transferTomorrow,
        setStudentName,
        todayStudyMinutes, streak, weeklyMinutes,
      }}
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
