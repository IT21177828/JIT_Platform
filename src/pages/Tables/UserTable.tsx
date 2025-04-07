import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import UserTableOne from "../../components/tables/BasicTables/UserTableOne";
import { IoStatsChart } from "react-icons/io5";

export default function UserTable() {
  return (
    <>
      <PageMeta
        title="User Stream Records | JIT Platform"
        description="View and manage user stream records"
      />
      <PageBreadcrumb pageTitle="User Streams" />
      <div className="space-y-6">
        <ComponentCard
          title="User Stream Records"
          icon={<IoStatsChart className="h-5 w-5 text-blue-500" />}
        >
          <div style={{ height: "650px" }}>
            <UserTableOne />
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
