import { useMsal } from "@azure/msal-react";
import { AccountInfo } from "@azure/msal-browser";
import { useEffect, useState } from "react";
import { msalInstance } from "../authConfig";

export const useAuth = () => {
  const { accounts, instance } = useMsal();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const [user, setUser] = useState<AccountInfo | null>(null);

  useEffect(() => {
    // Handle MSAL redirect (only needed on initial page load)
    msalInstance.handleRedirectPromise().then((response) => {
      const account =
        response?.account || msalInstance.getActiveAccount() || accounts[0];

      if (account) {
        msalInstance.setActiveAccount(account); // Good practice
        setUser(account);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false); 
    });
  }, [accounts]);

  return { isAuthenticated, isLoading, user, instance };
};
