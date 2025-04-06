import { Routes, Route, useNavigate } from "react-router";
import { MsalProvider } from "@azure/msal-react";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
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
import { AdminHome } from "./pages/Dashboard/AdminHome";
import UserTable from "./pages/Tables/UserTable";
import UserSessionTable from "./pages/Tables/UserSessionTable";
import ProtectedRoute from "./pages/ProtectedRoute/ProtectedRoute";
import SessionRecords from "./pages/SessionRecords/SessionRecords";
import OnboardingLayout from "./layout/OnboardingLayout";
import OnboardingDashboard from "./pages/Onboarding/OnboardingDashboard";
import OnboardingMySessions from "./pages/Onboarding/OnboardingMySessions";
import OnboardingHelp from "./pages/Onboarding/OnboardingHelp";
import AdminRoute from "./pages/ProtectedRoute/AdminRoute";

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
        <Route path="/signin" element={<SignIn />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<OnboardingLayout />}>
            <Route path="/" element={<OnboardingDashboard />} />
            <Route path="/my-session" element={<OnboardingMySessions />} />
            <Route path="/session-help" element={<OnboardingHelp />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/users" element={<Home />} />
              <Route path="/analytics" element={<AdminHome />} />

              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />

              <Route path="/form-elements" element={<FormElements />} />

              <Route path="/stream-tables" element={<UserStreamTable />} />
              <Route
                path="/session-records/:email"
                element={<UserSessionTable />}
              />
              <Route path="/stream-records" element={<UserTable />} />
              <Route
                path="/stream-records/:email"
                element={<UserStreamTable />}
              />
              <Route
                path="/stream-records/:email/:recordID"
                element={<UserSessionTable />}
              />
              <Route
                path="/stream-records/:email/:recordID/:sessionID"
                element={<SessionRecords />}
              />

              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </MsalProvider>
  );
}
