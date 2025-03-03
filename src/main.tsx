import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import App from "./App";
import { AppWrapper } from "./components/common/PageMeta";
import { ThemeProvider } from "./context/ThemeContext";

// MSAL imports
import {
  PublicClientApplication,
  EventType,
  AccountInfo,
} from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

// Initialize MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.initialize().then(() => {
  // Set the first available account as the active account if none is active
  if (
    !msalInstance.getActiveAccount() &&
    msalInstance.getAllAccounts().length > 0
  ) {
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
  }

  // Enable storage event listener to handle account changes across tabs
  msalInstance.enableAccountStorageEvents();

  // Add event listener for login success
  msalInstance.addEventCallback((event) => {
    if (
      event.eventType === EventType.LOGIN_SUCCESS &&
      event.payload &&
      "account" in event.payload
    ) {
      const account = event.payload.account as AccountInfo;
      msalInstance.setActiveAccount(account);
    }
  });

  // Render the app
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <ThemeProvider>
          <AppWrapper>
            <Router>
              <App pca={msalInstance} />
            </Router>
          </AppWrapper>
        </ThemeProvider>
      </StrictMode>
    );
  }
});
