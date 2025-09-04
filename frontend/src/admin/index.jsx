import React from "react";
import AdminNavbar from "./Navbar";
import { Card, Row, Col } from "antd";
import {
  BarChartOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <AdminNavbar />

      {/* Welcome Section */}
      <header className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-12 px-6 text-center shadow-md pt-24">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          👋 Welcome, Admin!
        </h1>
        <p className="text-lg md:text-xl opacity-90">
          Here’s your dashboard overview and quick actions.
        </p>
      </header>

      {/* Dashboard Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable className="rounded-xl shadow-md text-center">
              <UserOutlined style={{ fontSize: "28px", color: "#6366f1" }} />
              <h2 className="text-lg font-semibold mt-2">Users</h2>
              <p className="text-gray-500">Manage platform users</p>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              className="rounded-xl shadow-md text-center"
              onClick={() => navigate("/admin/posts")}
            >
              <FileTextOutlined
                style={{ fontSize: "28px", color: "#22c55e" }}
              />
              <h2 className="text-lg font-semibold mt-2">Posts</h2>
              <p className="text-gray-500">Review & approve content</p>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable className="rounded-xl shadow-md text-center">
              <BarChartOutlined
                style={{ fontSize: "28px", color: "#eab308" }}
              />
              <h2 className="text-lg font-semibold mt-2">Analytics</h2>
              <p className="text-gray-500">Track performance</p>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card hoverable className="rounded-xl shadow-md text-center">
              <SettingOutlined style={{ fontSize: "28px", color: "#ef4444" }} />
              <h2 className="text-lg font-semibold mt-2">Settings</h2>
              <p className="text-gray-500">Adjust preferences</p>
            </Card>
          </Col>
        </Row>
      </main>
    </div>
  );
};

export default Admin;
