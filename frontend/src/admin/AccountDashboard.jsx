import React, { useEffect, useState } from "react";
import AdminNavbar from "./Navbar";
import { getAccountDashboard, payForPost } from "./services/accountService";
import { toast } from "sonner";

const AccountDashboard = () => {
  const [data, setData] = useState({ posts: [], pagination: {}, summary: {}, userStats: [] });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState(""); // '', 'pending', 'paid'

  const load = async () => {
    const res = await getAccountDashboard({ page, limit, paymentStatus: statusFilter });
    if (res?.success) setData(res);
  };

  useEffect(()=>{ load(); }, [page, statusFilter]);

  const handlePay = async (postId) => {
    if (!window.confirm("Are you sure you want to mark this post as paid?")) {
      return;
    }
    try {
      const res = await payForPost(postId);
      if (res?.success) {
        toast.success("Payment status updated successfully!");
        await load();
      } else {
        toast.error(res?.message || "Failed to update payment status");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update payment status");
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Account Dashboard</h2>

        <div className="bg-white shadow p-4 rounded mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-gray-600 text-sm">Total Amount</div>
            <div className="text-xl font-semibold">₹{data?.summary?.totalAmount || 0}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-gray-600 text-sm">Pending Amount</div>
            <div className="text-xl font-semibold">₹{data?.summary?.totalPendingAmount || 0}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-gray-600 text-sm">Paid Amount</div>
            <div className="text-xl font-semibold">₹{data?.summary?.totalPaidAmount || 0}</div>
          </div>
        </div>

        <div className="bg-white shadow p-4 rounded mb-6">
          <div className="flex items-center gap-3 mb-3">
            <label>Status</label>
            <select value={statusFilter} onChange={e=>{ setStatusFilter(e.target.value); setPage(1); }} className="border rounded px-2 py-1">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-4 text-left">Author</th>
                  <th className="py-3 px-4 text-left">Views</th>
                  <th className="py-3 px-4 text-left">Likes</th>
                  <th className="py-3 px-4 text-left">Total Price</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {data.posts.map(p => (
                  <tr key={p._id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-4">{p.author?.username}</td>
                    <td className="py-3 px-4">{p.viewCount}</td>
                    <td className="py-3 px-4">{p.likes?.length || 0}</td>
                    <td className="py-3 px-4">₹{p.totalPrice || 0}</td>
                    <td className="py-3 px-4 capitalize">{p.paymentStatus || 'pending'}</td>
                    <td className="py-3 px-4">
                      <button disabled={p.paymentStatus==='paid'} onClick={()=>handlePay(p._id)} className={`px-3 py-1 rounded ${p.paymentStatus==='paid' ? 'bg-gray-300' : 'bg-green-600 text-white'}`}>{p.paymentStatus==='paid' ? 'Paid' : 'Pay'}</button>
                    </td>
                  </tr>
                ))}
                {data.posts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500 italic">No posts</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountDashboard;


