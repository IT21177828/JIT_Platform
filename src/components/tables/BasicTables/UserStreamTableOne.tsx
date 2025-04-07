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
// Add React Icons
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

  // Fetch streams with status filter
  const fetchStreams = async (email: string, statusFilter: string) => {
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

  // Filter records based on search term
  const filteredRecords =
    searchTerm && groupedData[0]?.records
      ? groupedData[0].records.filter((record) =>
          record.Record_ID.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : groupedData[0]?.records || [];

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Change records per page
  const handleRecordsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing records per page
  };

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Table Controls - Search, Filter and Records per page */}
      <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 dark:border-white/[0.05]">
        <div className="flex items-center">
          <span className="text-gray-500 dark:text-gray-400 mr-2">Show</span>
          <select
            value={recordsPerPage}
            onChange={handleRecordsPerPageChange}
            className="mx-1 rounded-md border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-gray-200 px-8 py-1 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-gray-500 dark:text-gray-400 mr-6">entries</span>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchOutline className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-3 py-1.5 block w-full rounded-md border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all sm:text-sm"
              placeholder="Search record ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-white/20">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                statusFilter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-white/5 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.08]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("INPROGRESS")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                statusFilter === "INPROGRESS"
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-white/5 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.08]"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter("CLOSED")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                statusFilter === "CLOSED"
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-white/5 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.08]"
              }`}
            >
              Closed
            </button>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              fetchStreams(email || "", statusFilter);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 dark:border-white/20 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
          >
            <IoRefreshCircleOutline className="h-5 w-5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
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
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300"
                >
                  <div className="flex items-center gap-1">
                    <IoIdCardOutline className="h-4 w-4" />
                    <span>Record ID</span>
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300"
                >
                  <div className="flex items-center gap-1">
                    <IoCalendarOutline className="h-4 w-4" />
                    <span>Created Time</span>
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300"
                >
                  <div className="flex items-center gap-1">
                    <IoTimeOutline className="h-4 w-4" />
                    <span>Start Time</span>
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300"
                >
                  <div className="flex items-center gap-1">
                    <IoTimeOutline className="h-4 w-4" />
                    <span>End Time</span>
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-300"
                >
                  <div className="flex items-center gap-1">
                    <IoTicketOutline className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center dark:text-gray-300"
                  >
                    <div className="flex flex-col justify-center items-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
                      <span>Loading stream records...</span>
                    </div>
                  </td>
                </TableRow>
              ) : currentRecords.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {searchTerm ? (
                      <div className="flex flex-col items-center">
                        <IoSearchOutline className="h-8 w-8 mb-2 text-gray-400" />
                        <span>
                          No matching records found for "{searchTerm}"
                        </span>
                        <button
                          className="mt-2 text-blue-500 hover:underline"
                          onClick={() => setSearchTerm("")}
                        >
                          Clear search
                        </button>
                      </div>
                    ) : statusFilter !== "all" ? (
                      <div className="flex flex-col items-center">
                        <span>
                          No {statusFilter.toLowerCase()} records found
                        </span>
                        <button
                          className="mt-2 text-blue-500 hover:underline"
                          onClick={() => setStatusFilter("all")}
                        >
                          Show all records
                        </button>
                      </div>
                    ) : (
                      <span>No records found</span>
                    )}
                  </td>
                </TableRow>
              ) : (
                currentRecords.map((record) => (
                  <TableRow
                    key={record.Record_ID}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <TableCell className="px-5 py-4 sm:px-6 text-start cursor-pointer">
                      <div
                        className="flex items-center gap-3"
                        onClick={() =>
                          handleEmailClick(email || "", record.Record_ID)
                        }
                      >
                        <Badge size="sm" color="primary">
                          {record.Record_ID}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {new Date(record.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {new Date(record.start_time).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {new Date(record.end_time).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex justify-between items-center">
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
                        <button
                          className="text-blue-500 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          onClick={() =>
                            handleEmailClick(email || "", record.Record_ID)
                          }
                          aria-label="View details"
                        >
                          <IoEllipsisHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="px-5 py-3 flex items-center justify-between border-t border-gray-100 dark:border-white/[0.05]">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredRecords.length > 0 ? (
            <>
              Showing{" "}
              <span className="font-medium">{indexOfFirstRecord + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastRecord, filteredRecords.length)}
              </span>{" "}
              of <span className="font-medium">{filteredRecords.length}</span>{" "}
              entries
              {searchTerm && (
                <>
                  {" "}
                  (filtered from {groupedData[0]?.records.length || 0} total
                  entries)
                </>
              )}
            </>
          ) : (
            <>No entries to show</>
          )}
        </div>

        {totalPages > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-1.5 rounded-md border border-gray-200 dark:border-white/20 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
            >
              <IoChevronBack className="h-4 w-4 mr-1" />
              <span>Previous</span>
            </button>

            <div className="flex gap-1">
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
                  <button
                    key={i}
                    onClick={() => paginate(pageNum)}
                    className={`min-w-[36px] px-3 py-1.5 rounded-md transition-colors ${
                      currentPage === pageNum
                        ? "bg-blue-500 text-white dark:bg-blue-600 font-medium"
                        : "border border-gray-200 dark:border-white/20 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="flex items-center justify-center min-w-[36px] px-3 py-1.5 dark:text-gray-400">
                    <IoEllipsisHorizontal className="h-4 w-4" />
                  </span>
                  <button
                    onClick={() => paginate(totalPages)}
                    className={`min-w-[36px] px-3 py-1.5 rounded-md border border-gray-200 dark:border-white/20 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center px-3 py-1.5 rounded-md border border-gray-200 dark:border-white/20 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
            >
              <span>Next</span>
              <IoChevronForward className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
