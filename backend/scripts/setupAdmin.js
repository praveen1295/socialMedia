import { Admin } from "../models/admin.model.js";
import connectDB from "../utils/db.js";
import dotenv from "dotenv";

dotenv.config();

const setupDefaultAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      email: "admin@socialmedia.com",
    });
    if (existingAdmin) {
      console.log("✅ Default admin already exists");
      console.log("📧 Email: admin@socialmedia.com");
      console.log("🔑 Password: Admin@123");
      return;
    }

    // Create default admin
    const admin = await Admin.create({
      fullName: "System Administrator",
      email: "admin@socialmedia.com",
      password: "Admin@123", // This will be hashed by the pre-save middleware
      role: "admin",
      permissions: [
        "user-management",
        "post-management",
        "content-moderation",
        "analytics",
        "system-settings",
      ],
    });

    console.log("✅ Default admin created successfully!");
    console.log("📧 Email: admin@socialmedia.com");
    console.log("🔑 Password: Admin@123");
    console.log("👤 Role: admin");
    console.log(
      "🔐 Permissions: user-management, post-management, content-moderation, analytics, system-settings"
    );
  } catch (error) {
    console.error("❌ Error creating default admin:", error);
  } finally {
    process.exit(0);
  }
};

setupDefaultAdmin();
