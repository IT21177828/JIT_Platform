import { Routes, Route, useNavigate } from "react-router";
import { MsalProvider } from "@azure/msal-react";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import UserStreamTable from "./pages/Tables/UserStreamTable";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { PublicClientApplication } from "@azure/msal-browser";
import { CustomNavigationClient } from "./utils/NacigationClient";
import { AuthHome } from "./pages/Dashboard/AuthHome";
import UserTable from "./pages/Tables/UserTable";
import UserSessionTable from "./pages/Tables/UserSessionTable";
import ProtectedRoute from "./pages/ProtectedRoute/ProtectedRoute";
import SessionRecords from "./pages/SessionRecords/SessionRecords";


interface AppProps {
  pca: PublicClientApplication;
}

export default function App({ pca }: AppProps) {
  const navigate = useNavigate();
  const navigationClient = new CustomNavigationClient(navigate);
  pca.setNavigationClient(navigationClient);
  return (
    <MsalProvider instance={pca}>
      <ScrollToTop />
      <Routes>
        {/* Authentication Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Dashboard Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index path="/" element={<AuthHome />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />


            {/* Tables */}
            <Route path="/stream-records" element={<UserStreamTable />} />
            <Route
              path="/session-records/:email"
              element={<UserSessionTable />}
            />
          {/* Tables */}
          <Route path="/stream-records" element={<UserTable />} />
          <Route path="/stream-records/:email" element={<UserStreamTable />} />
          <Route
            path="/stream-records/:email/:recordID"
            element={<UserSessionTable />}
          />
          <Route
            path="/stream-records/:email/:recordID/:sessionID"
            element={<SessionRecords />}
          />


            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MsalProvider>
  );
}
