import { RevenueSharing } from "../models/revenueSharing.model.js";
import { Admin } from "../models/admin.model.js";
import { Employee } from "../models/employee.model.js";

// ✅ Utility: Check if user has required role
const hasPermission = async (userId, allowedRoles = ["admin", "Manager"]) => {
  // Check in Admin model
  const admin = await Admin.findById(userId);
  if (admin && admin.isActive && allowedRoles.includes(admin.role)) {
    return { hasPermission: true, role: admin.role, user: admin };
  }

  // Check in Employee model
  const employee = await Employee.findById(userId);
  if (employee && employee.isActive && allowedRoles.includes(employee.role)) {
    return { hasPermission: true, role: employee.role, user: employee };
  }

  return { hasPermission: false, role: null, user: null };
};

export const createRevenueSharing = async (req, res) => {
  try {
    const { pricePerView, pricePerLike } = req.body;
    const adminId = req.id;

    // ✅ Check permissions for Admin + Manager
    const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions to create revenue sharing settings",
        success: false,
      });
    }

    // Deactivate existing active settings
    await RevenueSharing.updateMany({ isActive: true }, { isActive: false });

    // Create new revenue sharing settings
    const revenueSharing = await RevenueSharing.create({
      pricePerView,
      pricePerLike,
      createdBy: adminId,
    });

    return res.status(201).json({
      message: "Revenue sharing settings created successfully",
      revenueSharing,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getRevenueSharing = async (req, res) => {
  try {
    const adminId = req.id;

    // ✅ Check permissions for Admin + Manager
    const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions to view revenue sharing settings",
        success: false,
      });
    }

    // Get current active settings
    const currentSettings = await RevenueSharing.findOne({ isActive: true })
      .populate("createdBy", "fullName email role")
      .populate("updatedBy", "fullName email role");

    // Get all settings history
    const allSettings = await RevenueSharing.find()
      .populate("createdBy", "fullName email role")
      .populate("updatedBy", "fullName email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      currentSettings,
      allSettings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const updateRevenueSharing = async (req, res) => {
  try {
    const { pricePerView, pricePerLike } = req.body;
    const adminId = req.id;

    // ✅ Check permissions for Admin + Manager
    const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions to update revenue sharing settings",
        success: false,
      });
    }

    // Get current active settings
    const currentSettings = await RevenueSharing.findOne({ isActive: true });
    if (!currentSettings) {
      return res.status(404).json({
        message: "No active revenue sharing settings found",
        success: false,
      });
    }

    // Update settings
    currentSettings.pricePerView = pricePerView;
    currentSettings.pricePerLike = pricePerLike;
    currentSettings.updatedBy = adminId;
    await currentSettings.save();

    await currentSettings.populate("updatedBy", "fullName email role");

    return res.status(200).json({
      message: "Revenue sharing settings updated successfully",
      revenueSharing: currentSettings,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getRevenueSharingHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const adminId = req.id;

    // ✅ Check permissions for Admin + Manager
    const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions to view revenue sharing history",
        success: false,
      });
    }

    // Pagination
    const skip = (page - 1) * limit;
    const revenueSharingHistory = await RevenueSharing.find()
      .populate("createdBy", "fullName email role")
      .populate("updatedBy", "fullName email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalSettings = await RevenueSharing.countDocuments();

    return res.status(200).json({
      success: true,
      revenueSharingHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalSettings / limit),
        totalSettings,
        hasNext: page * limit < totalSettings,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
