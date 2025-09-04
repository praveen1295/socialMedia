import React, { useEffect, useState } from "react";
import AdminNavbar from "./Navbar";
import {
  getRevenueSharing,
  createRevenueSharing,
  updateRevenueSharing,
} from "./services/revenueService";
import { toast } from "sonner";
import Loader from "../components/ui/loader";

const RevenueSharing = () => {
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ pricePerView: "", pricePerLike: "" });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const load = async () => {
    setInitialLoading(true);
    try {
      const res = await getRevenueSharing();
      if (res?.success) {
        setCurrent(res.currentSettings);
        if (res.currentSettings)
          setForm({
            pricePerView: res.currentSettings.pricePerView,
            pricePerLike: res.currentSettings.pricePerLike,
          });
      }
    } catch (error) {
      toast.error("Failed to load revenue sharing settings");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    // Client-side validation
    if (!form.pricePerView || form.pricePerView < 0) {
      toast.error("Price per view must be a positive number");
      return;
    }
    if (!form.pricePerLike || form.pricePerLike < 0) {
      toast.error("Price per like must be a positive number");
      return;
    }

    setLoading(true);
    try {
      const data = {
        pricePerView: Number(form.pricePerView),
        pricePerLike: Number(form.pricePerLike),
      };
      const res = current
        ? await updateRevenueSharing(data)
        : await createRevenueSharing(data);
      if (res?.success) {
        toast.success(
          `Revenue sharing ${current ? "updated" : "created"} successfully!`
        );
        await load();
      } else {
        toast.error(
          res?.message ||
            `Failed to ${current ? "update" : "create"} revenue sharing`
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${current ? "update" : "create"} revenue sharing`
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <>
        <AdminNavbar />
        <div className="p-4 max-w-xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="p-4 max-w-xl mx-auto pt-24">
        <h2 className="text-2xl font-semibold mb-4">Revenue Sharing Master</h2>
        <div className="bg-white shadow p-4 rounded space-y-3">
          <div className="flex items-center gap-3">
            <label className="w-40">Price per View</label>
            <input
              type="number"
              value={form.pricePerView}
              onChange={(e) =>
                setForm({ ...form, pricePerView: e.target.value })
              }
              className="border rounded px-2 py-1 flex-1"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-40">Price per Like</label>
            <input
              type="number"
              value={form.pricePerLike}
              onChange={(e) =>
                setForm({ ...form, pricePerLike: e.target.value })
              }
              className="border rounded px-2 py-1 flex-1"
            />
          </div>
          <button
            onClick={save}
            className="bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size="sm" color="white" />
                {current ? "Updating..." : "Creating..."}
              </>
            ) : current ? (
              "Update"
            ) : (
              "Create"
            )}{" "}
            Pricing
          </button>
        </div>
        {current && (
          <div className="mt-6 text-sm text-gray-600">
            <div>
              Active: View ₹{current.pricePerView} | Like ₹
              {current.pricePerLike}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RevenueSharing;
