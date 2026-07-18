import { config } from "./config";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  accessToken?: string | null;
};

export type AuthChallenge = {
  nonce: string;
  expiresAt: string;
  message: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; walletAddress: string };
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, accessToken, headers, signal, ...init } = options;
  const response = await fetch(`${config.backendUrl}/v1${path}`, {
    ...init,
    signal,
    headers: {
      accept: "application/json",
      ...(body === undefined ? {} : { "content-type": "application/json" }),
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => undefined);
  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message)
        : `Backend request failed (${response.status})`;
    throw new ApiError(message, response.status, payload);
  }
  return payload as T;
}

export const api = {
  request,
  health: (signal?: AbortSignal) =>
    request<{ status: string; service: string; time: string }>("/health", { signal }),
  auth: {
    challenge: (walletAddress: string, signal?: AbortSignal) =>
      request<AuthChallenge>("/auth/challenge", {
        method: "POST",
        body: { walletAddress },
        signal,
      }),
    verify: (
      input: { walletAddress: string; nonce: string; signature: string },
      signal?: AbortSignal,
    ) => request<AuthSession>("/auth/verify", { method: "POST", body: input, signal }),
  },
  agreements: {
    create: <TInput, TResponse>(input: TInput, signal?: AbortSignal) =>
      request<TResponse>("/agreements", { method: "POST", body: input, signal }),
    prepare: <TInput, TResponse>(input: TInput, signal?: AbortSignal) =>
      request<TResponse>("/agreements/prepare", { method: "POST", body: input, signal }),
    update: <TInput, TResponse>(id: string, input: TInput, signal?: AbortSignal) =>
      request<TResponse>(`/agreements/${id}`, { method: "PATCH", body: input, signal }),
    list: <T>(params: { cursor?: string; status?: string; signal?: AbortSignal } = {}) => {
      const query = new URLSearchParams();
      if (params.cursor) query.set("cursor", params.cursor);
      if (params.status) query.set("status", params.status);
      const suffix = query.size ? `?${query}` : "";
      return request<T>(`/agreements${suffix}`, { signal: params.signal });
    },
    get: <T>(id: string, signal?: AbortSignal) => request<T>(`/agreements/${id}`, { signal }),
  },
  dashboard: {
    get: <T>(params: { walletAddress?: string; signal?: AbortSignal } = {}) => {
      const query = new URLSearchParams();
      if (params.walletAddress) query.set("walletAddress", params.walletAddress);
      const suffix = query.size ? `?${query}` : "";
      return request<T>(`/dashboard${suffix}`, { signal: params.signal });
    },
  },
  activity: {
    list: <T>(params: { cursor?: string; agreementId?: string; walletAddress?: string; signal?: AbortSignal } = {}) => {
      const query = new URLSearchParams();
      if (params.cursor) query.set("cursor", params.cursor);
      if (params.agreementId) query.set("agreementId", params.agreementId);
      if (params.walletAddress) query.set("walletAddress", params.walletAddress);
      const suffix = query.size ? `?${query}` : "";
      return request<T>(`/activity${suffix}`, { signal: params.signal });
    },
  },
  blockchain: {
    simulate: <TResponse>(transactionXdr: string, signal?: AbortSignal) =>
      request<TResponse>("/blockchain/simulate", { method: "POST", body: { transactionXdr }, signal }),
    submit: <TResponse>(transactionXdr: string, signal?: AbortSignal) =>
      request<TResponse>("/blockchain/submit", { method: "POST", body: { transactionXdr }, signal }),
    getTransaction: <TResponse>(hash: string, signal?: AbortSignal) =>
      request<TResponse>(`/blockchain/transaction/${hash}`, { signal }),
  },
  templates: {
    create: <TInput, TResponse>(input: TInput, signal?: AbortSignal) =>
      request<TResponse>("/templates", { method: "POST", body: input, signal }),
    list: <T>(category?: string, signal?: AbortSignal) =>
      request<T>(`/templates${category ? `?category=${encodeURIComponent(category)}` : ""}`, {
        signal,
      }),
  },
  notifications: {
    list: <T>(userId: string, accessToken: string, signal?: AbortSignal) =>
      request<T>(`/notifications/${userId}`, { accessToken, signal }),
    markRead: <T>(id: string, accessToken: string, signal?: AbortSignal) =>
      request<T>(`/notifications/${id}/read`, { method: "PATCH", accessToken, signal }),
  },
};
