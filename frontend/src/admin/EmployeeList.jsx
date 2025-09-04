import React, { useEffect, useState } from "react";
import AdminNavbar from "./Navbar";
import { createEmployee, getEmployees, updateEmployee, deleteEmployee } from "./services/employeeService";
import { toast } from "sonner";
import Loader from "../components/ui/loader";

const EmployeeList = () => {
  const [form, setForm] = useState({ fullName: "", email: "", mobileNo: "", role: "Manager", password: "" });
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [list, setList] = useState([]);

  const fetchList = async () => {
    setListLoading(true);
    try {
      const res = await getEmployees();
      if (res?.success) setList(res.employees);
    } catch (error) {
      toast.error("Failed to fetch employees");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const submit = async () => {
    // Client-side validation
    if (!form.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!form.mobileNo.trim()) {
      toast.error("Mobile number is required");
      return;
    }
    if (!/^[0-9]{10}$/.test(form.mobileNo)) {
      toast.error("Mobile number must be exactly 10 digits");
      return;
    }
    if (!form.role) {
      toast.error("Role is required");
      return;
    }
    if (!form.password.trim()) {
      toast.error("Password is required");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      const res = await createEmployee(form);
      if (res?.success) {
        toast.success("Employee created successfully!");
        setForm({ fullName: "", email: "", mobileNo: "", role: "Manager", password: "" });
        fetchList();
      } else {
        toast.error(res?.message || "Failed to create employee");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (emp) => {
    setActionLoading(prev => ({ ...prev, [emp._id]: true }));
    try {
      const res = await updateEmployee(emp._id, { isActive: !emp.isActive });
      if (res?.success) {
        toast.success(`Employee ${!emp.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchList();
      } else {
        toast.error(res?.message || "Failed to update employee status");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update employee status");
    } finally {
      setActionLoading(prev => ({ ...prev, [emp._id]: false }));
    }
  }

  const remove = async (emp) => {
    if (!window.confirm(`Are you sure you want to delete ${emp.fullName}?`)) {
      return;
    }
    setActionLoading(prev => ({ ...prev, [emp._id]: true }));
    try {
      const res = await deleteEmployee(emp._id);
      if (res?.success) {
        toast.success("Employee deleted successfully");
        fetchList();
      } else {
        toast.error(res?.message || "Failed to delete employee");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete employee");
    } finally {
      setActionLoading(prev => ({ ...prev, [emp._id]: false }));
    }
  }

  return (
    <>
      <AdminNavbar />
      <div className="p-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Employees</h2>
        <div className="bg-white shadow p-4 rounded mb-6 grid grid-cols-1 md:grid-cols-5 gap-2">
          <input value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} placeholder="Full name" className="border rounded px-2 py-1" />
          <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" className="border rounded px-2 py-1" />
          <input value={form.mobileNo} onChange={e=>setForm({...form, mobileNo:e.target.value})} placeholder="Mobile No" className="border rounded px-2 py-1" />
          <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="border rounded px-2 py-1">
            <option value="Manager">Manager</option>
            <option value="Accountant">Accountant</option>
          </select>
          <input value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="Password" type="password" className="border rounded px-2 py-1" />
          <button 
            onClick={submit} 
            className="md:col-span-5 bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-50 flex items-center justify-center gap-2" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size="sm" color="white" />
                Creating Employee...
              </>
            ) : (
              'Create Employee'
            )}
          </button>
        </div>

        <div className="bg-white shadow rounded overflow-x-auto">
          {listLoading ? (
            <div className="p-8 flex justify-center">
              <Loader size="lg" />
            </div>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Mobile</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-left">Active</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {list.map(emp => (
                  <tr key={emp._id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-4">{emp.fullName}</td>
                    <td className="py-3 px-4">{emp.email}</td>
                    <td className="py-3 px-4">{emp.mobileNo}</td>
                    <td className="py-3 px-4 capitalize">{emp.role}</td>
                    <td className="py-3 px-4">{emp.isActive? 'Yes' : 'No'}</td>
                    <td className="py-3 px-4 space-x-2">
                      <button 
                        onClick={()=>toggleActive(emp)} 
                        className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50 flex items-center gap-1"
                        disabled={actionLoading[emp._id]}
                      >
                        {actionLoading[emp._id] ? (
                          <>
                            <Loader size="sm" />
                            {emp.isActive? 'Deactivating...' : 'Activating...'}
                          </>
                        ) : (
                          emp.isActive? 'Deactivate' : 'Activate'
                        )}
                      </button>
                      <button 
                        onClick={()=>remove(emp)} 
                        className="px-3 py-1 bg-red-500 text-white rounded disabled:opacity-50 flex items-center gap-1"
                        disabled={actionLoading[emp._id]}
                      >
                        {actionLoading[emp._id] ? (
                          <>
                            <Loader size="sm" color="white" />
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500 italic">No employees</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default EmployeeList;


