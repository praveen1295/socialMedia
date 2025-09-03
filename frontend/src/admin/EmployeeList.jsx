import React, { useEffect, useState } from "react";
import AdminNavbar from "./Navbar";
import { createEmployee, getEmployees, updateEmployee, deleteEmployee } from "./services/employeeService";

const EmployeeList = () => {
  const [form, setForm] = useState({ fullName: "", email: "", mobileNo: "", role: "Manager", password: "" });
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);

  const fetchList = async () => {
    const res = await getEmployees();
    if (res?.success) setList(res.employees);
  };

  useEffect(() => { fetchList(); }, []);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await createEmployee(form);
      if (res?.success) {
        setForm({ fullName: "", email: "", mobileNo: "", role: "manager", password: "" });
        fetchList();
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (emp) => {
    await updateEmployee(emp._id, { isActive: !emp.isActive });
    fetchList();
  }

  const remove = async (emp) => {
    await deleteEmployee(emp._id);
    fetchList();
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
          <button onClick={submit} className="md:col-span-5 bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-50" disabled={loading}>{loading? 'Saving...' : 'Create Employee'}</button>
        </div>

        <div className="bg-white shadow rounded overflow-x-auto">
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
                    <button onClick={()=>toggleActive(emp)} className="px-3 py-1 bg-gray-300 rounded">{emp.isActive? 'Deactivate' : 'Activate'}</button>
                    <button onClick={()=>remove(emp)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
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
        </div>
      </div>
    </>
  );
}

export default EmployeeList;


