import React, { useEffect, useState } from "react";
import AdminNavbar from "./Navbar";
import { getRevenueSharing, createRevenueSharing, updateRevenueSharing } from "./services/revenueService";

const RevenueSharing = () => {
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ pricePerView: '', pricePerLike: '' });

  const load = async () => {
    const res = await getRevenueSharing();
    if (res?.success) {
      setCurrent(res.currentSettings);
      if (res.currentSettings) setForm({ pricePerView: res.currentSettings.pricePerView, pricePerLike: res.currentSettings.pricePerLike });
    }
  };

  useEffect(()=>{ load(); },[]);

  const save = async () => {
    const data = { pricePerView: Number(form.pricePerView), pricePerLike: Number(form.pricePerLike) };
    if (current) await updateRevenueSharing(data); else await createRevenueSharing(data);
    await load();
  };

  return (
    <>
      <AdminNavbar />
      <div className="p-4 max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Revenue Sharing Master</h2>
        <div className="bg-white shadow p-4 rounded space-y-3">
          <div className="flex items-center gap-3">
            <label className="w-40">Price per View</label>
            <input type="number" value={form.pricePerView} onChange={e=>setForm({...form, pricePerView:e.target.value})} className="border rounded px-2 py-1 flex-1" />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-40">Price per Like</label>
            <input type="number" value={form.pricePerLike} onChange={e=>setForm({...form, pricePerLike:e.target.value})} className="border rounded px-2 py-1 flex-1" />
          </div>
          <button onClick={save} className="bg-blue-600 text-white rounded px-3 py-2">{current? 'Update' : 'Create'} Pricing</button>
        </div>
        {current && (
          <div className="mt-6 text-sm text-gray-600">
            <div>Active: View ₹{current.pricePerView} | Like ₹{current.pricePerLike}</div>
          </div>
        )}
      </div>
    </>
  );
};

export default RevenueSharing;


