import React from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";

import App from "./App.tsx";
import "./index.css";

const authConfig = {
  authority: import.meta.env.VITE_AUTH_AUTHORITY,
  client_id: import.meta.env.VITE_AUTH_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_AUTH_REDIRECT_URI,
  response_type: import.meta.env.VITE_AUTH_RESPONSE_TYPE,
  response_mode: import.meta.env.VITE_AUTH_RESPONSE_MODE,
  scope: import.meta.env.VITE_AUTH_SCOPE,
  post_logout_redirect_uri: import.meta.env.VITE_AUTH_LOGOUT_URI,
  automaticSilentRenew: true,
  accessTokenExpiringNotificationTime: 300, // 5 minutes before expiry
  silentRequestTimeout: 10000, // 10 second timeout for silent renewal
  includeIdTokenInSilentRenew: true,
  revokeAccessTokenOnSignout: true,
  monitorSession: false, // Disable automatic session monitoring to reduce unnecessary checks
  metadata: {
    token_endpoint: `${import.meta.env.VITE_API_BASE_URL}/auth/token`,
    authorization_endpoint: import.meta.env.VITE_AUTH_AUTHORIZATION_ENDPOINT,
    end_session_endpoint: `${import.meta.env.VITE_AUTH_LOGOUT_DOMAIN}/logout`,
  },
};

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider {...authConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
