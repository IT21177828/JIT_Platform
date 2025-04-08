import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoChevronBack,
  IoChevronForward,
  IoRefreshCircleOutline,
  IoSearchOutline,
  IoEllipsisHorizontal,
  IoCalendarOutline,
  IoTicketOutline,
  IoIdCardOutline,
  IoTimeOutline,
} from "react-icons/io5";

interface Record {
  createdAt: string;
  start_time: string;
  Record_ID: string;
  end_time: string;
  email: string;
  ticket_status: string;
}

interface GroupedRecords {
  email: string;
  records: Record[];
}

export default function UserStreamTableOne() {
  const navigate = useNavigate();
  const params = useParams<{ email: string }>();
  const email = params.email;
  const [groupedData, setGroupedData] = useState<GroupedRecords[]>([]);
  const fetchController = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStreams = async (email: string, statusFilter: string) => {
    if (fetchController.current) {
      fetchController.current.abort();
    }
    fetchController.current = new AbortController();
    const { signal } = fetchController.current;

    setIsRefreshing(true);
    try {
      const params: {
        searchColumn: string;
        searchValue: string;
        sortColumn: string;
        sortOrder: string;
        ticket_status?: string;
      } = {
        searchColumn: "email",
        searchValue: email,
        sortColumn: "createdAt",
        sortOrder: "DESC",
      };

      if (statusFilter !== "all") {
        params.ticket_status = statusFilter;
      }

      const response = await axios.get(
        "https://pdadd4zki6.execute-api.ap-south-1.amazonaws.com/dev/stream-records",
        { params, signal }
      );

      const data = response.data.body.data;
      setGroupedData([{ email, records: Array.isArray(data) ? data : [] }]);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Previous request canceled", err.message);
      } else {
        console.error("Error fetching streams:", err);
      }
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  useEffect(() => {
    if (email) {
      setLoading(true);
      fetchStreams(email, statusFilter);
    }
  }, [email, statusFilter]);

  const handleEmailClick = (email: string, recordId: string) => {
    navigate(`/stream-records/${email}/${recordId}`);
  };

  const filteredRecords =
    searchTerm && groupedData[0]?.records
      ? groupedData[0].records.filter((record) =>
          record.Record_ID.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : groupedData[0]?.records || [];

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleRecordsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-indigo-900 dark:border-white/[0.05] shadow-sm"
    >
      <div className="flex justify-between items-center px-5 py-4 border-b border-blue-100 dark:border-white/[0.05]">
        <div className="flex items-center">
          <span className="text-gray-500 dark:text-gray-300 mr-2 text-sm font-medium">
            Show
          </span>
          <div className="relative">
            <motion.select
              whileTap={{ scale: 0.97 }}
              value={recordsPerPage}
              onChange={handleRecordsPerPageChange}
              className="mx-1 appearance-none rounded-lg border border-blue-200 dark:border-blue-800/30 dark:bg-white/5 dark:text-gray-200 px-8 py-2 pr-10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm bg-transparent"
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
          <span className="text-gray-500 dark:text-gray-300 mr-6 text-sm font-medium">
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
              className="pl-10 pr-3 py-2.5 block w-full rounded-lg border border-blue-200 dark:border-blue-800/30 dark:bg-white/5 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-sm"
              placeholder="Search record ID..."
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
            className="flex rounded-lg overflow-hidden border border-blue-200 shadow-sm dark:border-blue-800/30"
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
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white dark:from-blue-600 dark:to-purple-700"
                  : "bg-white dark:bg-white/5 dark:text-gray-300 hover:bg-blue-50/50 dark:hover:bg-white/[0.08]"
              }`}
            >
              All
            </motion.button>
            <motion.button
              whileHover={{
                backgroundColor:
                  statusFilter !== "INPROGRESS"
                    ? "rgba(59, 130, 246, 0.1)"
                    : undefined,
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatusFilter("INPROGRESS")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                statusFilter === "INPROGRESS"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white dark:from-blue-600 dark:to-purple-700"
                  : "bg-white dark:bg-white/5 dark:text-gray-300 hover:bg-blue-50/50 dark:hover:bg-white/[0.08]"
              }`}
            >
              In Progress
            </motion.button>
            <motion.button
              whileHover={{
                backgroundColor:
                  statusFilter !== "CLOSED"
                    ? "rgba(59, 130, 246, 0.1)"
                    : undefined,
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatusFilter("CLOSED")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                statusFilter === "CLOSED"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white dark:from-blue-600 dark:to-purple-700"
                  : "bg-white dark:bg-white/5 dark:text-gray-300 hover:bg-blue-50/50 dark:hover:bg-white/[0.08]"
              }`}
            >
              Closed
            </motion.button>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setLoading(true);
              fetchStreams(email || "", statusFilter);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-blue-500/30 transition-all font-medium"
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
              <IoRefreshCircleOutline className="h-6 w-6" />
            </motion.div>
            <span>Refresh</span>
          </motion.button>
        </div>
      </div>

      <div
        className="flex-grow overflow-auto"
        style={{ maxHeight: "calc(100% - 120px)" }}
      >
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 z-10">
              <TableRow className="border-b border-blue-100 dark:border-white/[0.05]">
                <TableCell
                  isHeader
                  className="px-5 py-4 font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400 text-start text-theme-xs"
                >
                  <motion.div
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50">
                      <IoIdCardOutline className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <span className="font-semibold">Record ID</span>
                  </motion.div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400 text-start text-theme-xs"
                >
                  <motion.div
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="p-1.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50">
                      <IoCalendarOutline className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                    </div>
                    <span className="font-semibold">Created Time</span>
                  </motion.div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400 text-start text-theme-xs"
                >
                  <motion.div
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="p-1.5 rounded-full bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50">
                      <IoTimeOutline className="h-4 w-4 text-green-600 dark:text-green-300" />
                    </div>
                    <span className="font-semibold">Start Time</span>
                  </motion.div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400 text-start text-theme-xs"
                >
                  <motion.div
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="p-1.5 rounded-full bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50">
                      <IoTimeOutline className="h-4 w-4 text-red-600 dark:text-red-300" />
                    </div>
                    <span className="font-semibold">End Time</span>
                  </motion.div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-4 font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400 text-start text-theme-xs"
                >
                  <motion.div
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="p-1.5 rounded-full bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50">
                      <IoTicketOutline className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                    </div>
                    <span className="font-semibold">Status</span>
                  </motion.div>
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-blue-100 dark:divide-white/[0.05]">
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
                          className="text-base font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400"
                        >
                          Loading stream records...
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
                              No matching records found for "{searchTerm}"
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400 hover:underline font-medium"
                              onClick={() => setSearchTerm("")}
                            >
                              Clear search
                            </motion.button>
                          </div>
                        ) : statusFilter !== "all" ? (
                          <div className="flex flex-col items-center">
                            <span>
                              No {statusFilter.toLowerCase()} records found
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400 hover:underline font-medium"
                              onClick={() => setStatusFilter("all")}
                            >
                              Show all records
                            </motion.button>
                          </div>
                        ) : (
                          <span>No records found</span>
                        )}
                      </motion.div>
                    </td>
                  </TableRow>
                ) : (
                  currentRecords.map((record, index) => (
                    <motion.tr
                      key={record.Record_ID}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.05,
                        ease: "easeOut",
                      }}
                      className="hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-purple-50/70 dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
                      onClick={() =>
                        handleEmailClick(email || "", record.Record_ID)
                      }
                    >
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <motion.div
                          whileHover={{ x: 3 }}
                          className="flex items-center gap-3"
                        >
                          <Badge
                            size="sm"
                            color="table"
                            className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40"
                          >
                            {record.Record_ID}
                          </Badge>
                        </motion.div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <motion.div whileHover={{ y: -1 }}>
                          <span className="block font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400 text-theme-sm">
                            {new Date(record.createdAt).toLocaleString()}
                          </span>
                        </motion.div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <motion.div whileHover={{ y: -1 }}>
                          <span className="block font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400 text-theme-sm">
                            {new Date(record.start_time).toLocaleString()}
                          </span>
                        </motion.div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <motion.div whileHover={{ y: -1 }}>
                          <span className="block font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400 text-theme-sm">
                            {new Date(record.end_time).toLocaleString()}
                          </span>
                        </motion.div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex justify-between items-center">
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Badge
                              size="sm"
                              color={
                                record.ticket_status === "INPROGRESS"
                                  ? "success"
                                  : record.ticket_status === "CLOSED"
                                  ? "warning"
                                  : "error"
                              }
                            >
                              {record.ticket_status}
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

      <div className="px-5 py-4 flex items-center justify-between border-t border-blue-100 dark:border-white/[0.05]">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {filteredRecords.length > 0 ? (
            <>
              Showing{" "}
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400">
                {indexOfFirstRecord + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400">
                {Math.min(indexOfLastRecord, filteredRecords.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400">
                {filteredRecords.length}
              </span>{" "}
              entries
              {searchTerm && (
                <>
                  {" "}
                  (filtered from{" "}
                  <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-300 dark:to-purple-400">
                    {groupedData[0]?.records.length || 0}
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
              className="flex items-center gap-1 px-3.5 py-2 rounded-lg border border-blue-200 dark:border-blue-800/30 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm"
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
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white dark:from-blue-600 dark:to-purple-700 font-medium shadow-md"
                        : "border border-blue-200 dark:border-blue-800/30 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-sm"
                    }`}
                  >
                    {currentPage === pageNum && (
                      <motion.div
                        layoutId="activeStreamPage"
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-600 dark:to-purple-700 shadow-md"
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
                    className="min-w-[40px] h-[40px] px-3 py-2 flex items-center justify-center rounded-lg border border-blue-200 dark:border-blue-800/30 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm"
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
              className="flex items-center gap-1 px-3.5 py-2 rounded-lg border border-blue-200 dark:border-blue-800/30 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm"
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
