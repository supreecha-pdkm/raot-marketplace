import { QueryClient, isServer } from '@tanstack/react-query';

const QUERY_DEFAULTS = {
  staleTime: 60_000,
  gcTime: 600_000,
  retry: 1,
  refetchOnWindowFocus: false,
} as const;

export function makeQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: QUERY_DEFAULTS } });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
