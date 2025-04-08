import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

// Define session type for better type safety
interface Session {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: "upcoming" | "active" | "completed";
  progress_percent: number;
  days_completed: number;
  total_days: number;
}

export default function OnboardingMySessions() {
  const [sessionPending, setSessionPending] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [name, setName] = useState<string | null | undefined>(null);
  const [email, setEmail] = useState<string | null | undefined>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.username);
    } else {
      setName(null);
      setEmail(null);
    }
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: (custom: number) => ({
      width: `${custom}%`,
      transition: { duration: 1.5, ease: "easeOut" },
    }),
  };

  // Mock function to fetch sessions - in a real app, this would be an API call
  const fetchUserSessions = async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock data - this would come from an actual API in production
      const mockSessions: Session[]

      setSessions(mockSessions);

      // Find active session if exists
      const active = mockSessions.find((s) => s.status === "active");
      if (active) {
        setCurrentSession(active);
        setResponseData(active);
        setSessionPending(false);
      } else {
        // Find next upcoming session
        const upcoming = mockSessions.find((s) => s.status === "upcoming");
        if (upcoming) {
          setCurrentSession(upcoming);
          setResponseData(upcoming);
          setSessionPending(true);
        }
      }

      if (user) {
        setName(user.name);
        setEmail(user.name);
      }
    } catch (err) {
      setError(err);
      console.error("Error fetching sessions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSessions();
  }, [user]);

  // Calculate time remaining for countdown display
  const calculateTimeRemaining = () => {
    if (!currentSession) return { days: 0, hours: 0, minutes: 0 };

    const targetDate = new Date(
      sessionPending ? currentSession.start_time : currentSession.end_time
    );
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();

    if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0 };

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  const timeRemaining = calculateTimeRemaining();

  // Function to render status badge with appropriate styling
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
            Active
          </span>
        );
      case "upcoming":
        return (
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
            Upcoming
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
            Unknown
          </span>
        );
    }
  };

  return (
    <motion.div
      className="p-6 md:p-10 min-h-screen text-gray-900 dark:text-white transition-all"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1
        className="text-3xl font-bold mb-6 bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400"
        variants={itemVariants}
      >
        My Sessions
      </motion.h1>

      {isLoading && (
        <motion.div
          className="flex justify-center items-center h-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </motion.div>
      )}

      {error && (
        <motion.div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-bold">Error</p>
          <p>{error.message || "An unknown error occurred."}</p>
        </motion.div>
      )}

      {!isLoading && currentSession && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          variants={itemVariants}
        >
          <motion.div
            className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-indigo-900 p-6 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-900"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400">
              📊 Current Session - {currentSession.title}
            </h2>

            <div className="mt-2 mb-4">
              {renderStatusBadge(currentSession.status)}
            </div>

            <div className="w-full h-4 bg-gray-200 rounded-full mt-4">
              <motion.div
                className="h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                custom={currentSession.progress_percent}
                variants={progressVariants}
                initial="hidden"
                animate="visible"
              />
            </div>

            <motion.p
              className="mt-4 text-sm bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <motion.span
                className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg text-purple-600 dark:text-purple-300"
                whileHover={{ scale: 1.05 }}
              >
                {currentSession.days_completed} days completed
              </motion.span>
              <motion.span
                className="ml-2 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-lg text-purple-600 dark:text-purple-300"
                whileHover={{ scale: 1.05 }}
              >
                {currentSession.progress_percent}% complete
              </motion.span>
            </motion.p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-indigo-900 p-6 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-900"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400">
              ⏳ All Sessions
            </h2>
            <div className="flex gap-4 text-center text-lg font-bold">
              <motion.div
                className="flex-1 bg-gradient-to-b from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-xl p-4 shadow-md"
                whileHover={{ scale: 1.1, rotate: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="text-3xl text-blue-700 dark:text-blue-200">
                  {timeRemaining.days}
                </div>
                <div className="text-sm text-blue-500 dark:text-blue-300">
                  Days
                </div>
              </motion.div>
              <motion.div
                className="flex-1 bg-gradient-to-b from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-xl p-4 shadow-md"
                whileHover={{ scale: 1.1, rotate: -1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="text-3xl text-purple-700 dark:text-purple-200">
                  {timeRemaining.hours}
                </div>
                <div className="text-sm text-purple-500 dark:text-purple-300">
                  Hours
                </div>
              </motion.div>
              <motion.div
                className="flex-1 bg-gradient-to-b from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900 rounded-xl p-4 shadow-md"
                whileHover={{ scale: 1.1, rotate: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="text-3xl text-indigo-700 dark:text-indigo-200">
                  {timeRemaining.minutes}
                </div>
                <div className="text-sm text-indigo-500 dark:text-indigo-300">
                  Minutes
                </div>
              </motion.div>
            </div>
            {sessionPending && currentSession && (
              <motion.p
                className="mt-4 text-sm text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Your session will start on{" "}
                <span className="font-medium">
                  {new Date(currentSession.start_time).toLocaleString()}
                </span>
              </motion.p>
            )}
            {!sessionPending && currentSession && (
              <motion.p
                className="mt-4 text-sm font-semibold bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg text-purple-600 dark:text-purple-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Your session will end on{" "}
                <span>
                  {new Date(currentSession.end_time).toLocaleString()}
                </span>
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Sessions Table */}
      <motion.div
        className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-indigo-900 p-6 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-900 mb-8"
        variants={itemVariants}
      >
        <h2 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400">
          📋 All My Sessions
        </h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            No sessions found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    Start Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    End Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    Progress
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800">
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      session.status === "active"
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {session.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(session.start_time).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(session.end_time).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full"
                          style={{ width: `${session.progress_percent}%` }}
                        ></div>
                      </div>
                      <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                        {session.progress_percent}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(session.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      
    </motion.div>
  );
}
