import React, { useEffect, useState } from "react";
import AdminNavbar from "./Navbar";
import { Pagination } from "antd";
import {
  rejectPost,
  getAllAdminPosts,
  approvePost,
} from "./services/adminPostService";
import { toast } from "sonner";

function AdminPostsList() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState("all"); // all | approved | unapproved
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
  });
  const [editablePostId, setEditablePostId] = useState(null);
  const [update, setUpdate] = useState({});

  const fetchPosts = async () => {
    try {
      const res = await getAllAdminPosts({
        page,
        limit: pageSize,
        status: filter,
      });
      if (res?.success) {
        setPosts(res.posts);
        setPagination(res.pagination);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, pageSize, filter]);

  const handleSave = async (post) => {
    if (!update.status) return;

    try {
      if (update.status === "approved") {
        const res = await approvePost(post._id);
        if (res?.success) {
          toast.success("Post approved successfully!");
        } else {
          toast.error(res?.message || "Failed to approve post");
        }
      } else {
        const reason = prompt("Enter rejection reason (optional):");
        const res = await rejectPost(post._id, { reason });
        if (res?.success) {
          toast.success("Post rejected successfully!");
        } else {
          toast.error(res?.message || "Failed to reject post");
        }
      }
      fetchPosts();
      setEditablePostId(null);
      setUpdate({});
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update post status");
    }
  };

  const chooseColor = (isApproved) => {
    return isApproved
      ? "bg-green-200 text-green-600"
      : "bg-red-200 text-red-600";
  };

  const isEditable = (postId) => postId === editablePostId;

  return (
    <>
      <AdminNavbar />

      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Posts Approval</h2>

        {/* Filters */}
        <div className="flex space-x-4 p-4 bg-white shadow-md rounded my-6">
          <select
            className="border rounded p-2 w-1/2"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Posts</option>
            <option value="approved">Approved</option>
            <option value="unapproved">Not Approved</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white shadow-md rounded my-6 overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-4 text-left">Caption</th>
                <th className="py-3 px-4 text-left">Author</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Created</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {posts.map((post) => (
                <tr
                  key={post._id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-4">{post.caption}</td>
                  <td className="py-3 px-4">
                    {post.author?.fullName || "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    {isEditable(post._id) ? (
                      <select
                        value={
                          update.status ||
                          (post.isApproved ? "approved" : "unapproved")
                        }
                        onChange={(e) => setUpdate({ status: e.target.value })}
                        className="border rounded px-2 py-1"
                      >
                        <option value="approved">Approved</option>
                        <option value="unapproved">Not Approved</option>
                      </select>
                    ) : (
                      <span
                        className={`${chooseColor(
                          post.isApproved
                        )} py-1 px-3 rounded-full text-xs`}
                      >
                        {post.isApproved ? "Approved" : "Not Approved"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(post.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    {isEditable(post._id) ? (
                      <button
                        onClick={() => handleSave(post)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditablePostId(post._id)}
                        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                      >
                        Update Status
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {posts.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center p-4 text-gray-500 italic"
                  >
                    No posts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          showSizeChanger
          onShowSizeChange={(current, size) => setPageSize(size)}
          current={page}
          total={pagination.totalPosts}
          pageSize={pageSize}
          onChange={(p) => setPage(p)}
        />
      </div>
    </>
  );
}

export default AdminPostsList;
