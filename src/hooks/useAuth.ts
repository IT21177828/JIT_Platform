import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const { accounts, instance } = useMsal();
  const [isLoading, setIsLoading] = useState(true);
  const user = accounts.length > 0 ? accounts[0] : null;

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, [user]);

  return { isAuthenticated, isLoading, user, instance };
};
