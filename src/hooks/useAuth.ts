import { useMsal } from "@azure/msal-react";
import { AccountInfo } from "@azure/msal-browser";
import { useEffect, useState } from "react";
import axios from "axios";
import { msalInstance } from "../authConfig";

export const useAuth = () => {
  const { accounts, instance } = useMsal();

  const [user, setUser] = useState<AccountInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Track loading MSAL + Admin

  // Handle MSAL redirect and get user info
  useEffect(() => {
    const handleAuth = async () => {
      setIsLoading(true);
      try {
        const response = await msalInstance.handleRedirectPromise();

        const account =
          response?.account || msalInstance.getActiveAccount() || accounts[0];

        if (account) {
          msalInstance.setActiveAccount(account);
          setUser(account);
          setIsAuthenticated(true);
          await checkAdminStatus(account);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error during MSAL redirect handling:", error);
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [accounts]);

  // API to check if user is admin
  const checkAdminStatus = async (user: AccountInfo) => {
    if (!user?.username) {
      setIsAdmin(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://kecsb4zutd.execute-api.ap-south-1.amazonaws.com/dev/as-user?userId=${user.username}`
      );
      if (response.status === 200 && response.data) {
        setIsAdmin(response.data.isAdmin === true);
        console.log("Admin status:", response.data.isAdmin);
      } else {
        console.warn("Unexpected response from admin API:", response);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  return {
    user,
    instance,
    isAuthenticated,
    isAdmin,
    isLoading, // <-- Use this to wait before rendering app
  };
};
