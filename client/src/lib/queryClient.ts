import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { secureStorage, STORAGE_KEYS } from '@/utils/secure-storage';
import { apiUrl } from '@/utils/api-config';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get JWT token from secure storage
  const token = await secureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  
  // Build proper URL for environment (relative for web, absolute for mobile)
  const fullUrl = apiUrl(url);
  
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Build proper URL for environment (relative for web, absolute for mobile)
    const path = queryKey.join("/") as string;
    const fullUrl = apiUrl(path);
    
    // Get JWT token for mobile auth support
    const token = await secureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
