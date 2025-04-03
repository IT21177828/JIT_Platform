import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../ui/button/Button";
import { useMsal } from "@azure/msal-react";
import adminList from "../../adminList";
import { loginRequest } from "../../authConfig";
import { motion } from "framer-motion";

const redirectUri: string =
  import.meta.env.VITE_AZURE_AD_CLIENT_ID || "http://localhost:3000";

export default function SignInForm() {
  const { instance, accounts } = useMsal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accounts.length > 0) {
      const username = accounts[0]?.username;
      if (adminList.includes(username)) {
        setLoading(false);
        navigate("/");
      } else {
        console.warn("Not an admin user");
        setLoading(false);
      }
    }
  }, [accounts, navigate]);

  const handleLogin = async (loginType: string) => {
    try {
      setLoading(true);
      if (loginType === "popup") {
        await instance.loginPopup({
          ...loginRequest,
          redirectUri: redirectUri,
        });
      } else if (loginType === "redirect") {
        await instance.loginRedirect(loginRequest);
      }
    } catch (error) {
      console.error("Error during login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="flex flex-col flex-1  px-4 py-12 bg-gray-50 dark:bg-gray-900 sm:px-6 lg:px-8">
            <div className="w-full max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="mb-6 text-3xl font-bold leading-9 text-gray-900 dark:text-white sm:text-4xl">
                  Sign in to your account
                </h2>
                <p className="mb-8 text-sm text-gray-600 dark:text-gray-400">
                  Use your Microsoft account to continue
                </p>

                <Button
                  className="w-full"
                  size="sm"
                  disabled={loading}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogin("redirect");
                  }}
                  startIcon={
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M2 3h9v9H2V3zm11 0h9v9h-9V3zM2 14h9v9H2v-9zm11 0h9v9h-9v-9z" />
                    </svg>
                  }
                >
                  {loading ? (
                    <div className="flex flex-row items-end gap-2">
                      Signing in{" "}
                      <motion.div
                        className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"
                        style={{ borderTopColor: "currentColor" }}
                      />{" "}
                    </div>
                  ) : (
                    "Sign in with Microsoft"
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
