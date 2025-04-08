import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { motion } from "framer-motion";

const getRemainingTime = (endDate: Date) => {
  const now = new Date().getTime();
  const timeLeft = endDate.getTime() - now;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);

  return { days, hours, minutes };
};

const OnboardingDashboard: React.FC = () => {
  const [sessionPending, setSessionPending] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [name, setName] = useState<string | null | undefined>(null);
  const [email, setEmail] = useState<string | null | undefined>(null);
  const [error, setError] = useState<any>(null);
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

  const [progressPercentage, setProgressPercentage] = useState(0);
  const [daysPassed, setDaysPassed] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [sessionEndDate, setSessionEndDate] = useState(new Date());
  const [remainingTime, setRemainingTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    if (responseData) {
      const endDate = new Date(responseData.end_time);
      setSessionEndDate(endDate);
      setRemainingTime(getRemainingTime(endDate));
    }
  }, [responseData]);

  useEffect(() => {
    const fetchStreamDetails = async () => {
      if (name && email) {
        try {
          const response = await axios.get(
            `https://kecsb4zutd.execute-api.ap-south-1.amazonaws.com/dev/as-user?userId=${email}`
          );

          setResponseData(response.data);

          if (response.data.stream_url) {
            setSessionPending(false);

            const startDate = new Date(response.data.start_time);
            const endDate = new Date(response.data.end_time);
            const currentDate = new Date(response.data.now_time);

            setSessionEndDate(endDate);
            setRemainingTime(getRemainingTime(endDate));

            const totalDurationMs = endDate.getTime() - startDate.getTime();
            const totalDurationDays = Math.ceil(
              totalDurationMs / (1000 * 60 * 60 * 24)
            );

            const passedDurationMs =
              currentDate.getTime() - startDate.getTime();
            const passedDurationDays = Math.ceil(
              passedDurationMs / (1000 * 60 * 60 * 24)
            );

            const progress = (passedDurationMs / totalDurationMs) * 100;

            setProgressPercentage(Math.min(Math.max(progress, 0), 100));
            setDaysPassed(Math.max(passedDurationDays, 0));
            setTotalDuration(totalDurationDays);
          } else if (
            response.data.statusCode === 403 &&
            response.data.message === "User should wait until session starts"
          ) {
            setSessionPending(true);
          } else {
            setError(response.data);
          }
        } catch (error) {
          console.error("Error fetching stream URL:", error);
          if (axios.isAxiosError(error) && error.response?.data) {
            setError(error.response.data);
          } else {
            setError({ message: "An error occurred." });
          }
        }
      }
    };

    fetchStreamDetails();

    const timer = setInterval(() => {
      setRemainingTime(getRemainingTime(sessionEndDate));
    }, 60000);

    return () => clearInterval(timer);
  }, [email, name]);

  useEffect(() => {
    const updateTimer = () => {
      setRemainingTime(getRemainingTime(sessionEndDate));
    };

    updateTimer();

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [sessionEndDate]);

  const handleRedirectToAppStream = () => {
    if (name && email) {
      axios
        .get(
          `https://kecsb4zutd.execute-api.ap-south-1.amazonaws.com/dev/as-user?userId=${email}`
        )
        .then((response) => {
          if (response.data.stream_url) {
            window.location.href = response.data.stream_url;
          } else {
            setError(response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching stream URL:", error);
          setError(error.response?.data || { message: "An error occurred." });
        });
    } else {
      setError({ message: "User email not available." });
    }
  };

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
        🎉 Welcome to Your Onboarding Dashboard
      </motion.h1>

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
            📊 Session Progress
          </h2>
          <div className="w-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-full h-6 p-1 shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full shadow-md"
              custom={progressPercentage}
              variants={progressVariants}
            ></motion.div>
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
              {daysPassed} out of {totalDuration} days completed
            </motion.span>
            <motion.span
              className="ml-2 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-lg text-purple-600 dark:text-purple-300"
              whileHover={{ scale: 1.05 }}
            >
              {Math.round(progressPercentage)}% complete
            </motion.span>
          </motion.p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-indigo-900 p-6 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-900"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400">
            {sessionPending
              ? "⏳ Time Until Session Starts"
              : "⏳ Time Remaining"}
          </h2>
          <div className="flex gap-4 text-center text-lg font-bold">
            <motion.div
              className="flex-1 bg-gradient-to-b from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-xl p-4 shadow-md"
              whileHover={{ scale: 1.1, rotate: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="text-3xl text-blue-700 dark:text-blue-200">
                {remainingTime.days}
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
                {remainingTime.hours}
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
                {remainingTime.minutes}
              </div>
              <div className="text-sm text-indigo-500 dark:text-indigo-300">
                Minutes
              </div>
            </motion.div>
          </div>
          {sessionPending && responseData && (
            <motion.p
              className="mt-4 text-sm text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Your session will start on{" "}
              <span className="font-medium">
                {new Date(responseData.start_time).toLocaleString()}
              </span>
            </motion.p>
          )}
          {!sessionPending && responseData && (
            <motion.p
              className="mt-4 text-sm font-semibold bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg text-purple-600 dark:text-purple-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Your session will end on{" "}
              <span>{new Date(responseData.end_time).toLocaleString()}</span>
            </motion.p>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-indigo-900 p-6 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-900 mb-8 flex flex-col items-start md:items-center md:flex-row justify-between"
        variants={itemVariants}
        whileHover={{ boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)" }}
      >
        <div>
          <h2 className="text-xl font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400">
            Start Your AppStream Session
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-0">
            {sessionPending
              ? "Your session is not yet available. Please wait until the scheduled time."
              : "Click the button below to open your cloud-based environment."}
          </p>
        </div>
        <motion.button
          onClick={handleRedirectToAppStream}
          className={`${
            sessionPending
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/30"
          } text-white px-6 py-3 rounded-xl font-semibold transition-all`}
          disabled={sessionPending}
          whileHover={!sessionPending ? { scale: 1.05 } : {}}
          whileTap={!sessionPending ? { scale: 0.95 } : {}}
        >
          🚀 Launch AppStream
        </motion.button>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-indigo-900 p-6 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-900"
        variants={itemVariants}
      >
        <h2 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400">
          📌 Useful Tips
        </h2>
        <motion.ul
          className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <motion.li
            variants={{
              hidden: { opacity: 0, x: -10 },
              visible: { opacity: 1, x: 0 },
            }}
          >
            Ensure you've completed your daily tasks before the session ends.
          </motion.li>
          <motion.li
            variants={{
              hidden: { opacity: 0, x: -10 },
              visible: { opacity: 1, x: 0 },
            }}
          >
            Check the documentation section for helpful guides.
          </motion.li>
          <motion.li
            variants={{
              hidden: { opacity: 0, x: -10 },
              visible: { opacity: 1, x: 0 },
            }}
          >
            Reach out to your onboarding mentor via Teams if you face issues.
          </motion.li>
          <motion.li
            variants={{
              hidden: { opacity: 0, x: -10 },
              visible: { opacity: 1, x: 0 },
            }}
          >
            Use the feedback form to share your onboarding experience.
          </motion.li>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingDashboard;
