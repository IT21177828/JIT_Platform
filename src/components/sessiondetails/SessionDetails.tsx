import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

interface VideoRecord {
  fileName: string;
  url: string;
}

export default function SessionDetails() {
  const params = useParams<{ sessionID: string }>();
  const sessionId = params.sessionID;
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null);

  console.log(sessionId);

  const fetchSessionRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://pdadd4zki6.execute-api.ap-south-1.amazonaws.com/dev/session-records/${sessionId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log(response.data);

      if (!response.data || !response.data.videos) {
        throw new Error("Invalid response format");
      }

      const videoRecords = response.data.videos
        .slice(2)
        .filter(
          (video: VideoRecord) =>
            video.fileName.endsWith(".mp4") ||
            video.fileName.endsWith(".webm") ||
            video.fileName.endsWith(".mov")
        );

      if (videoRecords.length === 0) {
        alert("No video files found for this session");
        return;
      }

      setVideos(videoRecords);
    } catch (error: any) {
      console.error("Error fetching session records:", error);
      setError(
        error.response?.data?.message ||
          "Failed to fetch session records. Please try again later."
      );
      alert("Failed to load session records");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchSessionRecords();
    }
  }, [fetchSessionRecords]);

  const handleVideoSelect = (video: VideoRecord) => {
    setSelectedVideo(video);
  };

  const renderVideoPlayer = () => {
    if (!selectedVideo) return null;

    return (
      <div className="flex flex-col items-center w-full  p-4 rounded-lg">
        <video
          controls
          src={selectedVideo.url}
          className="w-2/3 max-w-4xl h-auto"
          onError={(e) => {
            console.error("Video loading error:", e);
            alert("Error loading video");
          }}
        />
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          {selectedVideo.fileName}
        </p>
      </div>
    );
  };

  const handleRetry = () => {
    alert("Retrying...");
    fetchSessionRecords();
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center"
        style={{ maxHeight: "75vh" }}
      >
        <div className="loading-spinner dark:text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen dark:bg-gray-800">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleRetry}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className="overflow-auto overflow-x-hidden  dark:text-white"
      style={{ maxHeight: "75vh" }}
    >
      <div className="mb-6">
        <div className="bg-white dark:bg-transparent shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Session Records for {sessionId}
          </h2>

          <div className="flex flex-col md:flex-row overflow-hidden">
            {/* Video List Section */}
            <div className="w-full md:w-1/3 p-4 overflow-hidden flex flex-col">
              <div
                className="overflow-y-auto flex-1"
                style={{ maxHeight: "55vh" }}
              >
                {videos.map((video, index) => (
                  <div
                    key={index}
                    onClick={() => handleVideoSelect(video)}
                    className={`cursor-pointer mb-3 mr-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 ${
                      selectedVideo?.fileName === video.fileName
                        ? "border-blue-500 border-2"
                        : "border-gray-200 dark:border-gray-600"
                    } dark:bg-gray-800`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span
                          role="img"
                          aria-label="video"
                          className="text-2xl"
                        >
                          🎥
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate dark:text-white">
                          {video.fileName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                          Click to play
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Player Section */}
            <div className="flex-1 p-4 overflow-y-auto ">
              {renderVideoPlayer()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
