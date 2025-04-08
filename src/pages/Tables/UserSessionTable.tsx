import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import UserSessionTableOne from "../../components/tables/BasicTables/UserSessionTableOne";

export default function UserSessionTable() {
  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="User Session" />
      <div className="space-y-6">
        <div style={{ height: "650px" }}>
          <UserSessionTableOne />
        </div>
      </div>
    </>
  );
}
