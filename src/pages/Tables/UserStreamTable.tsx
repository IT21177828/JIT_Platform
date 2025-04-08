import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import UserStreamTableOne from "../../components/tables/BasicTables/UserStreamTableOne";

export default function UserStreamTable() {
  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Users Records" />
      <div className="space-y-6">
        <div style={{ height: "650px" }}>
          <UserStreamTableOne />
        </div>
      </div>
    </>
  );
}
