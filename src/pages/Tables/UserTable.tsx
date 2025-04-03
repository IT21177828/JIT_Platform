import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import UserTableOne from "../../components/tables/BasicTables/UserTableOne";

export default function UserTable() {
  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="User Streams" />
      <div className="space-y-6">
        <ComponentCard title="User Stream Records">
          <UserTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
