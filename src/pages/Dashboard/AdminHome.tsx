import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";

import adminList from "../../adminList";
import image from "../../assets/images/LST.png";
import { useEffect } from "react";
import StatisticsChart from "../../components/statistics/StatisticsChart";
import EcommerceMetrics from "../../components/statistics/EcommerceMetrics";
import BarChartOne from "../../components/charts/bar/BarChartOne";
import LineChartOne from "../../components/charts/line/LineChartOne";

export function AdminHome() {
  const { instance, accounts } = useMsal();
  const isAdmin = accounts[0] && adminList.includes(accounts[0]?.username);
  console.log(instance);

  // **Preload the Image Before Rendering**
  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      console.log("Image preloaded successfully!");
    };
  }, []);

  return (
    <>
      <AuthenticatedTemplate>
        <div>
          <EcommerceMetrics />
        </div>
        <div>
          <StatisticsChart />
        </div>
        <LineChartOne />
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate></UnauthenticatedTemplate>
    </>
  );
}
