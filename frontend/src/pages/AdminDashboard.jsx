import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import SummaryCard from "../components/ui/SummaryCard";
import PaymentsTable from "../components/tables/PaymentsTable";
import Input from "../components/ui/Input";
import Skeleton from "../components/ui/Skeleton";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // ✅ Get stored token
        const { data } = await axios.get("/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Include token
        });

        setData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPayments = useMemo(() => {
    return data?.payments
      ? data.payments.filter((payment) =>
          payment.user.toLowerCase().includes(search.toLowerCase())
        )
      : [];
  }, [data, search]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          data?.summary && (
            <>
              <SummaryCard title="Total Users" value={data.summary.totalUsers} />
              <SummaryCard title="Total Revenue" value={`$${data.summary.totalRevenue}`} />
              <SummaryCard title="Active Sessions" value={data.summary.activeSessions} />
              <SummaryCard title="Pending Payments" value={data.summary.pendingPayments} />
            </>
          )
        )}
      </div>

      {/* Search and Payments Table */}
      <div className="bg-white p-4 rounded-lg shadow">
        <Input
          type="text"
          placeholder="Search user here..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full"
        />
        <PaymentsTable payments={filteredPayments} loading={loading} />
      </div>
    </div>
  );
};

export default AdminDashboard;
