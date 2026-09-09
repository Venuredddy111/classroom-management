import type { DataProvider } from "@refinedev/core";

const API_URL = import.meta.env.VITE_API_URL;

async function fetchJson(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const message = body?.error || body?.message || `Request failed with status ${res.status}`;
    const error = new Error(message) as Error & { statusCode: number };
    error.statusCode = res.status;
    throw error;
  }

  return body;
}

/**
 * Refine's dataProvider contract, wired up against the shape this API
 * actually returns: { data, pagination: { page, limit, total, totalPages } }
 * for lists, and { data } for single-resource responses.
 */
export const dataProvider: DataProvider = {
  getApiUrl: () => API_URL,

  getList: async ({ resource, pagination, filters }) => {
    const params = new URLSearchParams();

    const current = pagination?.currentPage ?? 1;
    const pageSize = pagination?.pageSize ?? 10;
    params.set("page", String(current));
    params.set("limit", String(pageSize));

    (filters ?? []).forEach((filter) => {
      if ("field" in filter && filter.value !== undefined && filter.value !== "") {
        params.set(filter.field, String(filter.value));
      }
    });

    const json = await fetchJson(`${API_URL}/${resource}?${params.toString()}`);
    return { data: json.data, total: json.pagination?.total ?? json.data.length };
  },

  getOne: async ({ resource, id }) => {
    const json = await fetchJson(`${API_URL}/${resource}/${id}`);
    return { data: json.data };
  },

  getMany: async ({ resource, ids }) => {
    const results = await Promise.all(ids.map((id) => fetchJson(`${API_URL}/${resource}/${id}`)));
    return { data: results.map((r) => r.data) };
  },

  create: async ({ resource, variables }) => {
    const json = await fetchJson(`${API_URL}/${resource}`, {
      method: "POST",
      body: JSON.stringify(variables),
    });
    return { data: json.data };
  },

  update: async ({ resource, id, variables }) => {
    const json = await fetchJson(`${API_URL}/${resource}/${id}`, {
      method: "PUT",
      body: JSON.stringify(variables),
    });
    return { data: json.data };
  },

  deleteOne: async ({ resource, id }) => {
    const json = await fetchJson(`${API_URL}/${resource}/${id}`, { method: "DELETE" });
    return { data: json.data ?? ({ id } as any) };
  },

  // Used by useCustomMutation / useCustom for one-off calls that don't map
  // to a plain CRUD resource — e.g. POST /api/enrollments/join.
  custom: async ({ url, method, payload, query }) => {
    const qs = query ? `?${new URLSearchParams(query as Record<string, string>).toString()}` : "";
    const json = await fetchJson(`${url}${qs}`, {
      method: (method ?? "get").toUpperCase(),
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    });
    return { data: json.data ?? json };
  },
};
