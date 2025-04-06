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
import { EventType, AccountInfo } from "@azure/msal-browser";
import { msalInstance } from "./authConfig";

// Initialize MSAL instance
msalInstance
  .initialize()
  .then(() => {
    console.log("MSAL initialized");
    const accounts = msalInstance.getAllAccounts();

    // Default to using the first account if no account is active on page load
    if (!msalInstance.getActiveAccount() && accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
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
    console.log("Rendering the app");
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
  })
  .catch((error) => {
    console.error("MSAL initialization failed", error);
  });
