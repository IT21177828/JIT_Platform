import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  // Example: Assume total session duration = 10 days, and 4 days passed
  const totalDuration = 10; // in days
  const daysPassed = 4;
  const progressPercentage = (daysPassed / totalDuration) * 100;

  // Session End Date (replace this with actual session end)
  const sessionEndDate = new Date();
  sessionEndDate.setDate(sessionEndDate.getDate() + (totalDuration - daysPassed));

  const [remainingTime, setRemainingTime] = useState(() =>
    getRemainingTime(sessionEndDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(getRemainingTime(sessionEndDate));
    }, 60000); // update every minute
    return () => clearInterval(timer);
  }, [sessionEndDate]);

  const handleRedirectToAppStream = () => {
    // Replace with your actual AppStream session URL
    window.location.href = "https://appstream2.aws.amazon.com/example-session-url";
  };

  return (
    <div className="p-6 md:p-10 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-all">
      <h1 className="text-3xl font-bold mb-6">🎉 Welcome to Your Onboarding Dashboard</h1>

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
            {daysPassed} out of {totalDuration} days completed ({Math.round(progressPercentage)}%)
          </p>
        </div>

        {/* Countdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">⏳ Time Remaining</h2>
          <div className="flex gap-4 text-center text-lg font-bold">
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
              <div className="text-3xl">{remainingTime.days}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">Days</div>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
              <div className="text-3xl">{remainingTime.hours}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">Hours</div>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
              <div className="text-3xl">{remainingTime.minutes}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">Minutes</div>
            </div>
          </div>
        </div>
      </div>

      {/* AppStream Button */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mb-8 flex flex-col items-start md:items-center md:flex-row justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Start Your AppStream Session</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-0">
            Click the button below to open your cloud-based environment.
          </p>
        </div>
        <button
          onClick={handleRedirectToAppStream}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
        >
          🚀 Launch AppStream
        </button>
      </div>

      {/* Extra Info */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">📌 Useful Tips</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>Ensure you’ve completed your daily tasks before the session ends.</li>
          <li>Check the documentation section for helpful guides.</li>
          <li>Reach out to your onboarding mentor via Teams if you face issues.</li>
          <li>Use the feedback form to share your onboarding experience.</li>
        </ul>
      </div>
    </div>
  );
};

export default OnboardingDashboard;
