import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import UserTableOne from "../../components/tables/BasicTables/UserTableOne";

export default function UserTable() {
  return (
    <>
      <PageMeta
        title="User Stream Records | JIT Platform"
        description="View and manage user stream records"
      />
      <PageBreadcrumb pageTitle="User Streams" />

      <div className="space-y-6">
        <div style={{ height: "650px" }}>
          <UserTableOne />
        </div>
      </div>
    </>
  );
}
