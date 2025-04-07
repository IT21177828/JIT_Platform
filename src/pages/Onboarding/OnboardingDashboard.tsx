import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
const getRemainingTime = (endDate: Date) => {
  const now = new Date().getTime();
  const timeLeft = endDate.getTime() - now;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);

  return { days, hours, minutes };
};

const OnboardingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sessionPending, setSessionPending] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [name, setName] = useState<string | null | undefined>(null);
  const [email, setEmail] = useState<string | null | undefined>(null);
  const [error, setError] = useState<any>(null);
  const { user, isAdmin } = useAuth(); // You might need to implement this with your authentication service

  useEffect(() => {
    if (user) {
      setName(user.name);
      console.log("user%%%%%%", user);
      setEmail(user.username);
      // setProfilePic(image);
    } else {
      setName(null);
      setEmail(null);
    }
  }, [user]);

  // Calculate session progress based on API response
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [daysPassed, setDaysPassed] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  // Session End Date from API response
  const [sessionEndDate, setSessionEndDate] = useState(new Date());

  const [remainingTime, setRemainingTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    // Update the session end date when response data changes
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
            // Session is available
            setSessionPending(false);

            // Calculate progress
            const startDate = new Date(response.data.start_time);
            const endDate = new Date(response.data.end_time);
            const currentDate = new Date(response.data.now_time);

            // Update session end date for countdown
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
    }, 60000); // update every minute

    return () => clearInterval(timer);
  }, [email, name]);

  // Force an immediate update of the countdown timer (not waiting for the interval)
  useEffect(() => {
    const updateTimer = () => {
      setRemainingTime(getRemainingTime(sessionEndDate));
    };

    updateTimer(); // Update immediately

    const timer = setInterval(updateTimer, 1000); // Update every second for smoother countdown

    return () => clearInterval(timer);
  }, [sessionEndDate]);

  const handleRedirectToAppStream = () => {
    if (name && email) {
      // Call the API to get the stream URL
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

  return (
    <div className="p-6 md:p-10 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-all">
      <h1 className="text-3xl font-bold mb-6">
        🎉 Welcome to Your Onboarding Dashboard
      </h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
          <p className="font-bold">Error</p>
          <p>{error.message || "An unknown error occurred."}</p>
        </div>
      )}

      {/* Progress & Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Session Progress</h2>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {daysPassed} out of {totalDuration} days completed (
            {Math.round(progressPercentage)}%)
          </p>
        </div>

        {/* Countdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {sessionPending
              ? "⏳ Time Until Session Starts"
              : "⏳ Time Remaining"}
          </h2>
          <div className="flex gap-4 text-center text-lg font-bold">
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
              <div className="text-3xl">{remainingTime.days}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">
                Days
              </div>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
              <div className="text-3xl">{remainingTime.hours}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">
                Hours
              </div>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
              <div className="text-3xl">{remainingTime.minutes}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">
                Minutes
              </div>
            </div>
          </div>
          {sessionPending && responseData && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Your session will start on{" "}
              {new Date(responseData.start_time).toLocaleString()}
            </p>
          )}
          {!sessionPending && responseData && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Your session will end on{" "}
              {new Date(responseData.end_time).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* AppStream Button */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mb-8 flex flex-col items-start md:items-center md:flex-row justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Start Your AppStream Session
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-0">
            {sessionPending
              ? "Your session is not yet available. Please wait until the scheduled time."
              : "Click the button below to open your cloud-based environment."}
          </p>
        </div>
        <button
          onClick={handleRedirectToAppStream}
          className={`${
            sessionPending
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white px-6 py-3 rounded-xl font-semibold transition-all`}
          disabled={sessionPending}
        >
          🚀 Launch AppStream
        </button>
      </div>

      {/* Extra Info */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">📌 Useful Tips</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            Ensure you've completed your daily tasks before the session ends.
          </li>
          <li>Check the documentation section for helpful guides.</li>
          <li>
            Reach out to your onboarding mentor via Teams if you face issues.
          </li>
          <li>Use the feedback form to share your onboarding experience.</li>
        </ul>
      </div>
    </div>
  );
};

export default OnboardingDashboard;
