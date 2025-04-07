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
import { motion, AnimatePresence } from "framer-motion";
import {
  IoChevronBack,
  IoChevronForward,
  IoRefreshCircleOutline,
  IoSearchOutline,
  IoEllipsisHorizontal,
  IoCalendarOutline,
  IoStopwatchOutline,
  IoTicketOutline,
  IoIdCardOutline,
  IoClipboardOutline,
} from "react-icons/io5";
import { TbDeviceIpadHorizontal } from "react-icons/tb";

interface Session {
  sessionID: string;
  Record_ID: string;
  ipAddress: string;
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
  const [recordsPerPage, setRecordsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

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

      const data = response.data.body?.data || response.data.data || [];
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
    setIsRefreshing(true);
    const sessions = await fetchUserSessions(recordID, statusFilter);
    setUserSessions(sessions);
    setLoading(false);
    setTimeout(() => setIsRefreshing(false), 600);
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
      const duration = (endedTime.getTime() - activatedTime.getTime()) / 1000;

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

  const filteredSessions = searchTerm
    ? userSessions.filter((session) =>
        session.sessionID.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : userSessions;

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSessions.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredSessions.length / recordsPerPage);

  const handleRecordsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm"
    >
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-white/[0.05]">
        <div className="flex items-center">
          <span className="text-gray-500 dark:text-gray-400 mr-2 text-sm font-medium">
            Show
          </span>
          <div className="relative">
            <motion.select
              whileTap={{ scale: 0.97 }}
              value={recordsPerPage}
              onChange={handleRecordsPerPageChange}
              className="mx-1 appearance-none rounded-lg border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-gray-200 px-8 py-2 pr-10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm bg-transparent"
            >
              <option value={5} className="dark:text-black">
                5
              </option>
              <option value={10} className="dark:text-black">
                10
              </option>
              <option value={20} className="dark:text-black">
                20
              </option>
              <option value={50} className="dark:text-black">
                50
              </option>
            </motion.select>
          </div>
          <span className="text-gray-500 dark:text-gray-400 mr-6 text-sm font-medium">
            entries
          </span>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchOutline className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
            </div>
            <motion.input
              initial={{ width: "200px" }}
              whileFocus={{
                width: "280px",
                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)",
              }}
              transition={{ duration: 0.3 }}
              type="text"
              className="pl-10 pr-3 py-2.5 block w-full rounded-lg border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-sm"
              placeholder="Search session ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                onClick={() => setSearchTerm("")}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 1 }}
            className="flex rounded-lg overflow-hidden border border-gray-200 shadow-sm dark:border-white/20"
          >
            <motion.button
              whileHover={{
                backgroundColor:
                  statusFilter !== "all"
                    ? "rgba(59, 130, 246, 0.1)"
                    : undefined,
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-700"
                  : "bg-white dark:bg-white/5 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.08]"
              }`}
            >
              All
            </motion.button>
            <motion.button
              whileHover={{
                backgroundColor:
                  statusFilter !== "ACTIVE"
                    ? "rgba(59, 130, 246, 0.1)"
                    : undefined,
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                statusFilter === "ACTIVE"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-700"
                  : "bg-white dark:bg-white/5 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.08]"
              }`}
            >
              Active
            </motion.button>
            <motion.button
              whileHover={{
                backgroundColor:
                  statusFilter !== "INACTIVE"
                    ? "rgba(59, 130, 246, 0.1)"
                    : undefined,
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatusFilter("INACTIVE")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                statusFilter === "INACTIVE"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-700"
                  : "bg-white dark:bg-white/5 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.08]"
              }`}
            >
              Inactive
            </motion.button>
            <motion.button
              whileHover={{
                backgroundColor:
                  statusFilter !== "NOTSTARTED"
                    ? "rgba(59, 130, 246, 0.1)"
                    : undefined,
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatusFilter("NOTSTARTED")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                statusFilter === "NOTSTARTED"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-700"
                  : "bg-white dark:bg-white/5 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.08]"
              }`}
            >
              Not Started
            </motion.button>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-all font-medium"
            disabled={isRefreshing}
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={{
                duration: 1,
                repeat: isRefreshing ? Infinity : 0,
                ease: "linear",
              }}
            >
              <IoRefreshCircleOutline className="h-7 w-6" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      <div
        className="flex-grow overflow-auto"
        style={{ maxHeight: "calc(100% - 120px)" }}
      >
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white dark:bg-neutral-800/95 z-10">
              <TableRow className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableCell
                  isHeader
                  className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300"
                >
                  <motion.div
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20">
                      <IoIdCardOutline className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <span className="font-semibold">Session ID</span>
                  </motion.div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300"
                >
                  <motion.div
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="p-1.5 rounded-full bg-green-50 dark:bg-green-900/20">
                      <TbDeviceIpadHorizontal className="h-4 w-4 text-green-600 dark:text-green-300" />
                    </div>
                    <span className="font-semibold">Ip Address</span>
                  </motion.div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300"
                >
                  <motion.div
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="p-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20">
                      <IoCalendarOutline className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                    </div>
                    <span className="font-semibold">Created Time</span>
                  </motion.div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300"
                >
                  <motion.div
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="p-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20">
                      <IoStopwatchOutline className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                    </div>
                    <span className="font-semibold">Duration</span>
                  </motion.div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300"
                >
                  <motion.div
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="p-1.5 rounded-full bg-pink-50 dark:bg-pink-900/20">
                      <IoTicketOutline className="h-4 w-4 text-pink-600 dark:text-pink-300" />
                    </div>
                    <span className="font-semibold">Status</span>
                  </motion.div>
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              <AnimatePresence mode="wait">
                {loading ? (
                  <TableRow key="loading">
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center dark:text-gray-300"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col justify-center items-center space-y-4"
                      >
                        <svg className="w-16 h-16" viewBox="0 0 50 50">
                          <motion.circle
                            cx="25"
                            cy="25"
                            r="20"
                            stroke="url(#gradient)"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{
                              pathLength: 1,
                              rotate: 360,
                            }}
                            transition={{
                              duration: 1.5,
                              ease: "easeInOut",
                              repeat: Infinity,
                              repeatType: "loop",
                            }}
                          />
                          <defs>
                            <linearGradient
                              id="gradient"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <motion.span
                          animate={{
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-base font-medium"
                        >
                          Loading session data...
                        </motion.span>
                      </motion.div>
                    </td>
                  </TableRow>
                ) : currentRecords.length === 0 ? (
                  <TableRow key="no-records">
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {searchTerm ? (
                          <div className="flex flex-col items-center">
                            <IoSearchOutline className="h-8 w-8 mb-2 text-gray-400" />
                            <span>
                              No matching sessions found for "{searchTerm}"
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="mt-2 text-blue-500 hover:underline"
                              onClick={() => setSearchTerm("")}
                            >
                              Clear search
                            </motion.button>
                          </div>
                        ) : statusFilter !== "all" ? (
                          <div className="flex flex-col items-center">
                            <span>
                              No {statusFilter.toLowerCase()} sessions found
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="mt-2 text-blue-500 hover:underline"
                              onClick={() => setStatusFilter("all")}
                            >
                              Show all sessions
                            </motion.button>
                          </div>
                        ) : (
                          <span>No sessions found</span>
                        )}
                      </motion.div>
                    </td>
                  </TableRow>
                ) : (
                  currentRecords.map((session, index) => (
                    <motion.tr
                      key={session.sessionID || session.Record_ID || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.05,
                        ease: "easeOut",
                      }}
                      className="hover:bg-gray-50/70 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <motion.div
                          className="flex items-center gap-3"
                          whileHover={{ x: 2 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/stream-records/${email}/${recordID}/${session.sessionID}`
                              );
                            }}
                          >
                            <Badge size="sm" color="table">
                              {session.sessionID}
                            </Badge>
                          </motion.div>
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-500 dark:text-gray-400 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(
                                session.sessionID || session.Record_ID || ""
                              );
                            }}
                            title="Copy to clipboard"
                          >
                            <IoClipboardOutline className="h-4 w-4" />
                          </motion.button>
                        </motion.div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          {Array.isArray(session.ipAddress) &&
                          session.ipAddress.length > 0 ? (
                            session.ipAddress.map((ip, index) => (
                              <motion.div
                                key={index}
                                className="flex items-center"
                                whileHover={{
                                  backgroundColor: "rgba(59, 130, 246, 0.05)",
                                }}
                                style={{
                                  borderRadius: "4px",
                                  padding: "2px 4px",
                                }}
                              >
                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                  {ip.trim()}
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="ml-1 text-gray-500 dark:text-gray-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                  onClick={() =>
                                    navigator.clipboard.writeText(ip.trim())
                                  }
                                  title="Copy IP to clipboard"
                                >
                                  <IoClipboardOutline className="h-4 w-4" />
                                </motion.button>
                                {index < session.ipAddress.length - 1 && (
                                  <span className="mx-1 text-gray-500 dark:text-gray-400">
                                    |
                                  </span>
                                )}
                              </motion.div>
                            ))
                          ) : (
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-gray-400">
                              N/A
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <motion.div whileHover={{ y: -1 }}>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {new Date(session.createdTime).toLocaleString(
                              "en-US",
                              {
                                timeZone: "Asia/Colombo",
                              }
                            )}
                          </span>
                        </motion.div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <motion.div whileHover={{ y: -1 }}>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {calculateDuration(session)}
                          </span>
                        </motion.div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex justify-between items-center">
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Badge
                              size="sm"
                              color={
                                session.session_status?.toLowerCase() ===
                                "active"
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
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            transition={{ duration: 0.3 }}
                            className="text-blue-500 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            aria-label="View details"
                          >
                            <IoEllipsisHorizontal className="h-5 w-5" />
                          </motion.div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100 dark:border-white/[0.05]">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {filteredSessions.length > 0 ? (
            <>
              Showing{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {indexOfFirstRecord + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {Math.min(indexOfLastRecord, filteredSessions.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {filteredSessions.length}
              </span>{" "}
              entries
              {searchTerm && (
                <>
                  (filtered from{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {userSessions.length}
                  </span>{" "}
                  total)
                </>
              )}
            </>
          ) : (
            <>No entries to show</>
          )}
        </div>

        {totalPages > 0 && (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-white/20 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all shadow-sm"
            >
              <IoChevronBack className="h-4 w-4 mr-1" />
              <span>Prev</span>
            </motion.button>

            <div className="flex gap-1.5">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(pageNum)}
                    className={`relative min-w-[40px] h-[40px] px-3 py-2 flex items-center justify-center rounded-lg transition-all ${
                      currentPage === pageNum
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white dark:from-blue-600 dark:to-blue-700 font-medium shadow-md"
                        : "border border-gray-200 dark:border-white/20 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.05] shadow-sm"
                    }`}
                  >
                    {currentPage === pageNum && (
                      <motion.div
                        layoutId="activeSessionPage"
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 shadow-md"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">{pageNum}</span>
                  </motion.button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="flex items-center justify-center min-w-[40px] px-3 py-2 dark:text-gray-400">
                    <IoEllipsisHorizontal className="h-4 w-4" />
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(totalPages)}
                    className="min-w-[40px] h-[40px] px-3 py-2 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/20 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all shadow-sm"
                  >
                    {totalPages}
                  </motion.button>
                </>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center gap-1 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-white/20 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all shadow-sm"
            >
              <span>Next</span>
              <IoChevronForward className="h-4 w-4 ml-1" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
