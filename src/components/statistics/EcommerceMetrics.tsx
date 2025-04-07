import { useEffect, useState } from "react";
import { BoltIcon, TimeIcon, PlugInIcon, GroupIcon } from "../../icons";
import UserMetrics from "../metrics/UserMetrics";
import axios from "axios";
import { useNavigate } from "react-router";
import fakeData from "./fakeval";

export default function EcommerceMetrics() {
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [deactiveCount, setDeactiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // const response = await axios.get(
        //   "https://pdadd4zki6.execute-api.ap-south-1.amazonaws.com/dev/user-session?sortColumn=createdTime&sortOrder=DESC"
        // );
        const response = fakeData;
        const data = response.data;

        console.log("ddddddddd" + response.data);

        const uniqueUsers: { [key: string]: any } = {};
        data.forEach((item: any) => {
          if (!uniqueUsers[item.email as string]) {
            uniqueUsers[item.email as string] = item;
          }
        });

        const uniqueUserData = Object.values(uniqueUsers);

        setTotalCount(uniqueUserData.length);
        setActiveCount(
          data.filter(
            (item: any) => item.session_status.toLowerCase() === "active"
          ).length
        );
        setDeactiveCount(
          data.filter(
            (item: any) => item.session_status.toLowerCase() === "inactive"
          ).length
        );
        setInactiveCount(
          data.filter(
            (item: any) => item.session_status.toLowerCase() === "notstarted"
          ).length
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const count = [
    {
      metricName: "Total Users",
      metricValue: totalCount,
      icon: GroupIcon,
      batchColor: "success" as const,
      onClick: () => navigate("/stream"),
    },
    {
      metricName: "Active Sessions",
      metricValue: activeCount,
      icon: BoltIcon,
      batchColor: "success" as const,
      onClick: () => navigate("/sessions?status=active"),
    },
    {
      metricName: "Inactive Sessions",
      metricValue: deactiveCount,
      icon: PlugInIcon,
      batchColor: "success" as const,

      onClick: () => navigate("/sessions?status=inactive"),
    },
    {
      metricName: "Not Started Sessions",
      metricValue: inactiveCount,
      icon: TimeIcon,
      batchColor: "success" as const,
      onClick: () => navigate("/sessions?status=notstarted"),
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:gap-6">
      {count.map((item, index) => (
        <UserMetrics
          key={index}
          icon={item.icon}
          batchColor={item.batchColor}
          iconType="ArrowUpIcon"
          metricType={item.metricName}
          metricValue={item.metricValue}
        />
      ))}
    </div>
  );
}
