import { useEffect, useState, useRef, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface Session {
  sessionID: string;
  Record_ID: string;
  createdTime: string;
  activatedTime?: string;
  endedTime?: string;
  duration?: string;
  session_status: string;
  email: string;
}

export default function UserSessionTableOne() {
  const { email, recordID } = useParams<{ email: string; recordID: string }>();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [userSessions, setUserSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchController = useRef<AbortController | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  console.log("Params object:", useParams());
  console.log("Email from params:", email);
  console.log("Record ID from params:", recordID);

  const fetchUserSessions = async (
    recordId: string | undefined,
    status: string
  ) => {
    if (fetchController.current) {
      fetchController.current.abort();
    }
    fetchController.current = new AbortController();
    const { signal } = fetchController.current;

    try {
      const params: {
        searchColumn: string;
        searchValue: string;
        sortColumn: string;
        sortOrder: string;
        session_status?: string;
      } = {
        searchColumn: "Record_ID",
        searchValue: recordId || "",
        sortColumn: "createdTime",
        sortOrder: "DESC",
      };

      if (status !== "all") {
        params.session_status = status;
      }

      const response = await axios.get(
        "https://pdadd4zki6.execute-api.ap-south-1.amazonaws.com/dev/user-session",
        { params, signal }
      );

      console.log("API response:", response);
      const data = response.data.body?.data || response.data.data || []; // Handle different response structures
      return Array.isArray(data) ? data : [];
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Previous request canceled", err.message);
      } else {
        console.error("Error fetching user sessions:", err);
      }
      return [];
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const sessions = await fetchUserSessions(recordID, statusFilter);
    setUserSessions(sessions);
    setLoading(false);
  }, [recordID, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateDuration = (session: Session) => {
    if (
      session.session_status?.toLowerCase() === "inactive" &&
      session.activatedTime &&
      session.endedTime
    ) {
      const activatedTime = new Date(session.activatedTime);
      const endedTime = new Date(session.endedTime);
      const duration = (endedTime.getTime() - activatedTime.getTime()) / 1000; // duration in seconds

      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = Math.floor(duration % 60);

      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else {
        return `${minutes}m ${seconds}s`;
      }
    }
    return session.duration ? session.duration : "N/A";
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-end p-4 space-x-2">
        <button
          onClick={() => handleStatusFilterChange("all")}
          className={`px-3 py-1 rounded ${
            statusFilter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleStatusFilterChange("ACTIVE")}
          className={`px-3 py-1 rounded ${
            statusFilter === "ACTIVE" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => handleStatusFilterChange("INACTIVE")}
          className={`px-3 py-1 rounded ${
            statusFilter === "INACTIVE"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Inactive
        </button>
        <button
          onClick={() => handleStatusFilterChange("NOTSTARTED")}
          className={`px-3 py-1 rounded ${
            statusFilter === "NOTSTARTED"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Not Started
        </button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          {loading ? (
            <div className="p-5 text-center">Loading...</div>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Session ID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Created Time
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Duration
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {userSessions
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((session) => (
                    <TableRow key={session.sessionID || session.Record_ID}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div
                            className="cursor-pointer"
                            onClick={() =>
                              navigate(
                                `/stream-records/${email}/${recordID}/${session.sessionID}`
                              )
                            }
                          >
                            <Badge size="sm" color="primary">
                              {session.sessionID}
                            </Badge>
                          </div>
                          <button
                            className="dark:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(
                                session.sessionID || session.Record_ID || ""
                              );
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {new Date(session.createdTime).toLocaleString(
                              "en-US",
                              {
                                timeZone: "Asia/Colombo",
                              }
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {calculateDuration(session)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={
                            session.session_status?.toLowerCase() === "active"
                              ? "success"
                              : session.session_status?.toLowerCase() ===
                                "inactive"
                              ? "warning"
                              : session.session_status?.toLowerCase() ===
                                "notstarted"
                              ? "info"
                              : "error"
                          }
                        >
                          {session.session_status?.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Simple pagination */}
      <div className="flex justify-between items-center p-4">
        <div>
          <span className="dark:text-white/90 text-gray-800">
            Showing{" "}
            {Math.min((currentPage - 1) * pageSize + 1, userSessions.length)} to{" "}
            {Math.min(currentPage * pageSize, userSessions.length)} of{" "}
            {userSessions.length} entries
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-blue-500 text-white"
            }`}
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) =>
                prev * pageSize < userSessions.length ? prev + 1 : prev
              )
            }
            disabled={currentPage * pageSize >= userSessions.length}
            className={`px-3 py-1 rounded ${
              currentPage * pageSize >= userSessions.length
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-blue-500 text-white"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
