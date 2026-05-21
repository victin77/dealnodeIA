import type {
  Folder,
  FolderDetail,
  Health,
  Insights,
  MeetingDetail,
  MeetingSummary,
  Stats,
  User,
} from "./types";

const TOKEN_KEY = "dealnote_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; isForm?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.isForm) {
    body = options.body as FormData;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const res = await fetch(`/api${path}`, {
    method: options.method ?? "GET",
    headers,
    body,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error ?? "Erro na requisicao.");
  }
  return data as T;
}

export const api = {
  // --- auth ---
  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: { name, email, password },
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  googleLogin: (credential: string) =>
    request<{ token: string; user: User }>("/auth/google", {
      method: "POST",
      body: { credential },
    }),
  me: () => request<{ user: User }>("/auth/me"),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: boolean }>("/auth/password", {
      method: "PUT",
      body: { currentPassword, newPassword },
    }),

  // --- meetings ---
  listMeetings: () => request<{ meetings: MeetingSummary[] }>("/meetings"),
  getStats: () => request<Stats>("/meetings/stats"),
  getInsights: () => request<Insights>("/meetings/insights"),
  getHealth: () => request<Health>("/health"),
  getMeeting: (id: string) =>
    request<{ meeting: MeetingDetail }>(`/meetings/${id}`),
  createMeeting: (form: FormData) =>
    request<{ id: string; status: string }>("/meetings", {
      method: "POST",
      body: form,
      isForm: true,
    }),
  moveMeeting: (id: string, folderId: string | null) =>
    request<{ ok: boolean }>(`/meetings/${id}`, {
      method: "PATCH",
      body: { folderId },
    }),
  deleteMeeting: (id: string) =>
    request<void>(`/meetings/${id}`, { method: "DELETE" }),

  // --- folders ---
  listFolders: () => request<{ folders: Folder[] }>("/folders"),
  getFolder: (id: string) => request<FolderDetail>(`/folders/${id}`),
  createFolder: (name: string) =>
    request<{ id: string; name: string }>("/folders", {
      method: "POST",
      body: { name },
    }),
  renameFolder: (id: string, name: string) =>
    request<{ ok: boolean }>(`/folders/${id}`, {
      method: "PATCH",
      body: { name },
    }),
  deleteFolder: (id: string) =>
    request<void>(`/folders/${id}`, { method: "DELETE" }),
};

export { ApiError };
