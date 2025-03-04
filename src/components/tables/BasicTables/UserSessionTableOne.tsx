import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { useParams } from "react-router";
import axios from "axios";

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

export default function UserSessionTableOne() {
  const params = useParams<{ email: string }>();
  const email = params.email;
  const [groupedData, setGroupedData] = useState<GroupedRecords[]>([]);
  const fetchController = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);

  console.log("Params object:", params);
  console.log("Email from params:", email);

  const fetchStreams = async (email: string, statusFilter: string) => {
    console.log(
      "Fetching streams for email:",
      email,
      "with status filter:",
      statusFilter
    );
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

      console.log("API response:", response);
      const data = response.data.body.data; // Access the data array

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
      fetchStreams(email, "all");
      console.log("Email from params:", email);
    }
  }, [email]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Record ID
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
                    Start Time
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    End Time
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
                {groupedData.map((group) =>
                  group.records.map((record) => (
                    <TableRow key={record.Record_ID}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {record.Record_ID}
                            </span>
                          </div>
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
