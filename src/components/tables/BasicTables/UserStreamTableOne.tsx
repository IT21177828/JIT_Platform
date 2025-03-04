import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { useNavigate } from "react-router";

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
  const [groupedData, setGroupedData] = useState<GroupedRecords[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      "https://pdadd4zki6.execute-api.ap-south-1.amazonaws.com/dev/stream-records"
    )
      .then((response) => response.json())
      .then((data) => {
        const records: Record[] = data.body.data;
        const grouped = records.reduce(
          (acc: { [key: string]: Record[] }, record) => {
            if (!acc[record.email]) {
              acc[record.email] = [];
            }
            acc[record.email].push(record);
            return acc;
          },
          {}
        );

        const groupedArray = Object.keys(grouped).map((email) => ({
          email,
          records: grouped[email],
        }));

        setGroupedData(groupedArray);
      });
  }, []);

  const handleEmailClick = (email: string) => {
    navigate(`/session-records/${email}`);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Records
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {groupedData.map((group) => (
                <TableRow key={group.email}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => handleEmailClick(group.email)}
                    >
                      <Badge color="primary" size="md">
                        {group.email}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {group.records.length} Records
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
