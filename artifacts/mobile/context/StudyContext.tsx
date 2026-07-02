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

export interface AppUser {
  firstName: string;
  lastName: string;
  examCategoryId: string;
  examCategoryLabel: string;
  examId: string;
  examName: string;
  boardName?: string;
  className?: string;
  setupComplete: boolean;
}

interface StudyContextType {
  user: AppUser | null;
  isAuthLoading: boolean;
  loginWithName: (firstName: string, lastName: string) => void;
  updateUserProfile: (profile: Partial<AppUser>) => Promise<void>;
  logout: () => void;
  sessions: StudySession[];
  allowedApps: AllowedApp[];
  todos: TodoItem[];
  addSession: (session: StudySession) => void;
  addAllowedApp: (app: AllowedApp) => void;
  removeAllowedApp: (id: string) => void;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  editTodo: (id: string, text: string) => void;
  deleteTodo: (id: string) => void;
  transferTomorrow: (id: string) => void;
  todayStudyMinutes: number;
  streak: number;
  weeklyMinutes: number[];
  studyCoins: number;
  // legacy compat
  studentName: string;
  nameLoaded: boolean;
}

const StudyContext = createContext<StudyContextType | null>(null);

const SESSIONS_KEY = "studylock_sessions";
const APPS_KEY = "studylock_apps";
const TODOS_KEY = "studylock_todos";
const USER_KEY = "studylock_user";

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
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [allowedApps, setAllowedApps] = useState<AllowedApp[]>(DEFAULT_APPS);
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [savedSessions, savedApps, savedTodos, savedUser] = await Promise.all([
          AsyncStorage.getItem(SESSIONS_KEY),
          AsyncStorage.getItem(APPS_KEY),
          AsyncStorage.getItem(TODOS_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (savedSessions) setSessions(JSON.parse(savedSessions));
        if (savedApps) setAllowedApps(JSON.parse(savedApps));
        if (savedTodos) setTodos(JSON.parse(savedTodos));
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch {}
      setIsAuthLoading(false);
    })();
  }, []);

  const loginWithName = useCallback((firstName: string, lastName: string) => {
    const newUser: AppUser = {
      firstName,
      lastName,
      examCategoryId: "",
      examCategoryLabel: "",
      examId: "",
      examName: "",
      setupComplete: false,
    };
    setUser(newUser);
    persist(USER_KEY, newUser);
  }, []);

  const updateUserProfile = useCallback(async (profile: Partial<AppUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...profile };
      persist(USER_KEY, next);
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    AsyncStorage.removeItem(USER_KEY).catch(() => {});
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
      const next = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      persist(TODOS_KEY, next);
      return next;
    });
  }, []);

  const editTodo = useCallback((id: string, text: string) => {
    setTodos((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, text: text.trim() } : t));
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
      const next = prev.map((t) =>
        t.id === id ? { ...t, date: tomorrowStr(), carriedOver: true, completed: false } : t
      );
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

  const studyCoins = React.useMemo(() => {
    return Math.floor(
      sessions.filter((s) => s.completed).reduce((sum, s) => sum + s.duration, 0)
    );
  }, [sessions]);

  return (
    <StudyContext.Provider
      value={{
        user, isAuthLoading,
        loginWithName, updateUserProfile, logout,
        sessions, allowedApps, todos,
        addSession, addAllowedApp, removeAllowedApp,
        addTodo, toggleTodo, editTodo, deleteTodo, transferTomorrow,
        todayStudyMinutes, streak, weeklyMinutes, studyCoins,
        // legacy compat for home screen
        studentName: user?.firstName ?? "",
        nameLoaded: !isAuthLoading,
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
