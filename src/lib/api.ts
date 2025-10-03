interface ErrorWithStatus extends Error {
  status?: number;
}

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const resolveApiBaseUrls = (): string[] => {
  const urls: string[] = [];
  const seen = new Set<string>();

  const addUrl = (value?: string | null) => {
    if (typeof value !== "string") return;
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      if (!seen.has("")) {
        seen.add("");
        urls.push("");
      }
      return;
    }

    const normalized = normalizeBaseUrl(trimmed);
    if (seen.has(normalized)) return;

    seen.add(normalized);
    urls.push(normalized);
  };

  addUrl(import.meta.env.VITE_API_URL);

  const globalLocation = (() => {
    if (typeof window !== "undefined" && typeof window.location !== "undefined") {
      return window.location;
    }

    if (typeof globalThis !== "undefined" && "location" in globalThis) {
      const candidate = (globalThis as { location?: Location }).location;
      if (candidate) {
        return candidate;
      }
    }

    return null;
  })();

  if (globalLocation) {
    const { hostname, origin, protocol, port } = globalLocation;
    const isLocalHost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".localhost");

    if (isLocalHost) {
      const httpsPorts = new Set<number>([5001, 443]);
      const httpPorts = new Set<number>([5000, 80]);
      const numericPort = Number.parseInt(port ?? "", 10);

      if (!Number.isNaN(numericPort)) {
        if (protocol === "https:") {
          httpsPorts.add(numericPort);
          if (numericPort >= 7000) {
            httpPorts.add(numericPort - 2000);
          }
        } else if (protocol === "http:") {
          httpPorts.add(numericPort);
          if (numericPort >= 5000) {
            httpsPorts.add(numericPort + 2000);
          }
        }
      }

      httpsPorts.forEach((httpsPort) => addUrl(`https://${hostname}:${httpsPort}`));
      httpPorts.forEach((httpPort) => addUrl(`http://${hostname}:${httpPort}`));
    } else {
      addUrl(origin);
    }

    // Always include same-origin as a fallback for reverse proxies or unified deployments.
    addUrl(origin);
  }

  // Final fallback to same-origin relative requests (supports custom dev proxies).
  addUrl("");

  return urls;
};

const API_BASE_URLS: string[] = resolveApiBaseUrls();

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let lastError: Error | null = null;

  for (let index = 0; index < API_BASE_URLS.length; index += 1) {
    const baseUrl = API_BASE_URLS[index];
    const isLastAttempt = index === API_BASE_URLS.length - 1;
    const url = baseUrl ? `${baseUrl}${path}` : path;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get("Content-Type");
      const isJson = contentType?.includes("application/json");
      const payload = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const message =
          typeof payload === "string"
            ? payload || response.statusText || "Request failed"
            : payload?.message ?? response.statusText ?? "Request failed";

        const error: ErrorWithStatus = new Error(message);
        error.status = response.status;
        lastError = error;

        if (response.status === 404 && !isLastAttempt) {
          continue;
        }

        throw error;
      }

      return payload as T;
    } catch (error) {
      const isNetworkError = error instanceof TypeError;
      const status = (error as ErrorWithStatus)?.status;

      if ((status === 404 || isNetworkError) && !isLastAttempt) {
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }

      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error("Request failed");
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthSuccessResponse {
  token: string;
  expiresAt: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export const loginRequest = (payload: LoginPayload) =>
  request<AuthSuccessResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  organizationId?: string;
}

export const registerRequest = (payload: RegisterPayload) =>
  request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organizationId?: string | null;
  isTwoFactorEnabled: boolean;
  createdAt: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  role?: string | null;
  organizationId?: string | null;
}

export interface UpdateUserPayload {
  fullName?: string;
  role?: string | null;
  twoFactorEnabled?: boolean;
}

export const fetchUsers = (token: string) =>
  request<AdminUser[]>("/api/users", {
    method: "GET",
    token,
  });

export const createUser = (token: string, payload: CreateUserPayload) =>
  request<AdminUser>("/api/users", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });

export const updateUser = (token: string, userId: string, payload: UpdateUserPayload) =>
  request<AdminUser>(`/api/users/${userId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });

export const deleteUser = (token: string, userId: string) =>
  request<void>(`/api/users/${userId}`, {
    method: "DELETE",
    token,
  });

export interface TaskInput {
  projectId?: string | null;
  title: string;
  description?: string;
  assigneeId?: string | null;
  dueAt?: string | null;
  status?: string | null;
  priority?: string | null;
}

export interface TaskItem {
  id: string;
  projectId?: string | null;
  ownerId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeId?: string | null;
  dueAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export const fetchMyTasks = (token: string, params?: { status?: string; dueBefore?: string }) => {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.dueBefore) search.set("dueBefore", params.dueBefore);
  const query = search.size > 0 ? `?${search.toString()}` : "";
  return request<TaskItem[]>(`/api/task/mine${query}`, {
    method: "GET",
    token,
  });
};

export const createTask = (token: string, payload: TaskInput) =>
  request<TaskItem>("/api/task", {
    method: "POST",
    token,
    body: JSON.stringify({
      ...payload,
      projectId: payload.projectId ?? null,
    }),
  });

export interface CalendarSummary {
  id: string;
  name: string;
  visibility: "Private" | "Shared" | "Public";
  ownerId: string;
  sharedUserIds: string[];
}

export const fetchCalendars = (token: string) =>
  request<CalendarSummary[]>("/api/calendar", {
    method: "GET",
    token,
  });

export interface CalendarInput {
  name: string;
  visibility: "Private" | "Shared" | "Public";
  sharedUserIds?: string[];
}

export const createCalendar = (token: string, payload: CalendarInput) =>
  request<CalendarSummary>("/api/calendar", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });

export const updateCalendar = (token: string, calendarId: string, payload: CalendarInput) =>
  request<CalendarSummary>(`/api/calendar/${calendarId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });

export const deleteCalendar = (token: string, calendarId: string) =>
  request<void>(`/api/calendar/${calendarId}`, {
    method: "DELETE",
    token,
  });

export interface CalendarEventInput {
  id?: string;
  calendarId: string;
  taskId?: string | null;
  title: string;
  location?: string | null;
  start: string;
  end: string;
  isAllDay?: boolean;
  provider?: string | null;
  externalEventId?: string | null;
}

export interface CalendarEvent {
  id: string;
  calendarId: string;
  taskId?: string | null;
  title: string;
  location?: string | null;
  start: string;
  end: string;
  isAllDay: boolean;
  provider: string;
  externalEventId: string;
  createdById: string;
}

export const fetchCalendarEvents = (
  token: string,
  calendarId: string,
  params?: { start?: string; end?: string },
) => {
  const search = new URLSearchParams();
  if (params?.start) search.set("start", params.start);
  if (params?.end) search.set("end", params.end);
  const query = search.size > 0 ? `?${search.toString()}` : "";

  return request<CalendarEvent[]>(`/api/calendar/${calendarId}/events${query}`, {
    method: "GET",
    token,
  });
};

export const upsertCalendarEvent = (token: string, payload: CalendarEventInput) =>
  request<CalendarEvent>(`/api/calendar/${payload.calendarId}/events`, {
    method: "POST",
    token,
    body: JSON.stringify({
      ...payload,
      isAllDay: payload.isAllDay ?? false,
      taskId: payload.taskId ?? null,
      location: payload.location ?? null,
      provider: payload.provider ?? null,
      externalEventId: payload.externalEventId ?? null,
    }),
  });

export const deleteCalendarEvent = (token: string, calendarId: string, eventId: string) =>
  request<void>(`/api/calendar/${calendarId}/events/${eventId}`, {
    method: "DELETE",
    token,
  });

export interface UserLookupItem {
  id: string;
  email: string;
  fullName: string;
}

export const fetchUsersLookup = (token: string) =>
  request<UserLookupItem[]>("/api/users/lookup", {
    method: "GET",
    token,
  });

export interface DropboxStatus {
  isConfigured: boolean;
  isConnected: boolean;
  authorizationUrl?: string | null;
  state?: string | null;
  connectedAt?: string | null;
  accountId?: string | null;
}

export interface DropboxConnectPayload {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  accountId?: string;
}

export const fetchDropboxStatus = (token: string) =>
  request<DropboxStatus>("/api/integrations/dropbox/status", {
    method: "GET",
    token,
  });

export const connectDropbox = (token: string, payload: DropboxConnectPayload) =>
  request<{ connected: boolean; connectedAt: string; accountId?: string | null }>("/api/integrations/dropbox/connect", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });

export const disconnectDropbox = (token: string) =>
  request<void>("/api/integrations/dropbox/connect", {
    method: "DELETE",
    token,
  });
