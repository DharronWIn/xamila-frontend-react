import { useState, useEffect, useCallback } from "react";
import { ZodSchema } from "zod";
import { apiClient, ApiError, HttpMethod } from "./apiClient";

interface UseApiOptions<TBody = any> {
  body?: TBody;
  schema?: ZodSchema;
  immediate?: boolean;
  isPublicRoute?: boolean;
}

function useApiBase<TResponse = any, TBody = any>(
  url: string,
  method: HttpMethod,
  options: UseApiOptions<TBody> = {}
) {
  const { body, schema, immediate = method === "GET", isPublicRoute = false } = options;

  const [data, setData] = useState<TResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);

  const execute = useCallback(
    async (overrideBody?: TBody) => {
      // Type guard to ensure url is a string
      if (typeof url !== 'string') {
        const errorMsg = `useApiBase received non-string url: ${typeof url}`;
        console.error(errorMsg, url);
        const apiError = new ApiError(400, errorMsg);
        setError(apiError);
        throw apiError;
      }
      
      setLoading(true);
      setError(null);
      try {
        const result = await apiClient<TResponse, TBody>(url, method, {
          body: overrideBody ?? body,
          schema,
          isPublicRoute,
        });
        setData(result);
        return result;
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url, method, body, schema, isPublicRoute]
  );

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { data, error, loading, execute };
}

// 🔹 Hooks spécialisés
export const useGet = <T>(url: string, options?: { schema?: ZodSchema; isPublicRoute?: boolean }) =>
  useApiBase<T>(url, "GET", { schema: options?.schema, immediate: true, isPublicRoute: options?.isPublicRoute });

export const usePost = <T, B = any>(url: string, options?: { schema?: ZodSchema; body?: B; isPublicRoute?: boolean }) =>
  useApiBase<T, B>(url, "POST", { schema: options?.schema, body: options?.body, immediate: false, isPublicRoute: options?.isPublicRoute });

export const usePut = <T, B = any>(url: string, options?: { schema?: ZodSchema; body?: B; isPublicRoute?: boolean }) =>
  useApiBase<T, B>(url, "PUT", { schema: options?.schema, body: options?.body, immediate: false, isPublicRoute: options?.isPublicRoute });

export const usePatch = <T, B = any>(url: string, options?: { schema?: ZodSchema; body?: B; isPublicRoute?: boolean }) =>
  useApiBase<T, B>(url, "PATCH", { schema: options?.schema, body: options?.body, immediate: false, isPublicRoute: options?.isPublicRoute });

export const useDelete = <T>(url: string, options?: { schema?: ZodSchema; isPublicRoute?: boolean }) =>
  useApiBase<T>(url, "DELETE", { schema: options?.schema, immediate: false, isPublicRoute: options?.isPublicRoute });

// ==================== LEGACY COMPATIBILITY ====================
// Keep the old hooks for backward compatibility
export { useApiBase as useApi };