import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  loginRequest,
  registerRequest,
  type LoginPayload,
  type RegisterPayload,
} from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const storageKey = "native-crm-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { token: string; user: AuthUser };
        setToken(parsed.token);
        setUser(parsed.user);
      } catch (error) {
        console.error("Failed to parse auth session", error);
        window.localStorage.removeItem(storageKey);
      }
    }
    setLoading(false);
  }, []);

  const persistSession = useCallback((session: { token: string; user: AuthUser }) => {
    setToken(session.token);
    setUser(session.user);
    window.localStorage.setItem(storageKey, JSON.stringify(session));
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginRequest(payload);
      persistSession({
        token: response.token,
        user: {
          id: response.userId,
          email: response.email,
          fullName: response.fullName,
          role: response.role,
        },
      });
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await registerRequest({ ...payload, role: payload.role ?? "User" });
      await login({ email: payload.email, password: payload.password });
    },
    [login],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(storageKey);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
