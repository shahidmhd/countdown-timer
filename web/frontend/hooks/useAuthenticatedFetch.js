import { useCallback } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

export function useAuthenticatedFetch() {
  const app = useAppBridge();

  return useCallback(
    async (uri, options = {}) => {
      const sessionToken = await app.idToken();
      return fetch(uri, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": options.headers?.["Content-Type"] || "application/json",
        },
      });
    },
    [app]
  );
}

export default useAuthenticatedFetch;