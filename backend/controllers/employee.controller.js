import { Employee } from "../models/employee.model.js";
import { Admin } from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

export const createEmployee = async (req, res) => {
  try {
    let { fullName, email, mobileNo, role, password } = req.body;
    const adminId = req.id; // From authentication middleware

    // ✅ Check permissions for Admin + Manager
    const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions to create employees",
        success: false,
      });
    }

    // Basic input validation and normalization
    fullName = typeof fullName === "string" ? fullName.trim() : "";
    email = typeof email === "string" ? email.toLowerCase().trim() : "";
    mobileNo = typeof mobileNo === "string" ? mobileNo.trim() : "";
    role = typeof role === "string" ? role.trim() : "";
    password = typeof password === "string" ? password : "";

    // Normalize role to match enum
    const normalizedRole = role
      ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
      : role;

    if (!fullName || !email || !mobileNo || !normalizedRole || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { mobileNo }],
    });

    if (existingEmployee) {
      const field =
        existingEmployee.email === email ? "email" : "mobile number";
      return res.status(400).json({
        message: `Employee with this ${field} already exists`,
        success: false,
      });
    }

    // Create employee
    const employee = await Employee.create({
      fullName,
      email,
      mobileNo,
      role: normalizedRole,
      password,
      createdBy: adminId,
    });

    // Remove password from response
    const employeeResponse = {
      _id: employee._id,
      fullName: employee.fullName,
      email: employee.email,
      mobileNo: employee.mobileNo,
      role: employee.role,
      isActive: employee.isActive,
      createdAt: employee.createdAt,
    };

    return res.status(201).json({
      message: "Employee created successfully",
      employee: employeeResponse,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;
    const adminId = req.id;

    // ✅ Check permissions for Admin + Manager
    const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions to view employees",
        success: false,
      });
    }

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    // Calculate pagination
    const skip = (page - 1) * limit;

    const employees = await Employee.find(filter)
      .select("-password")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalEmployees = await Employee.countDocuments(filter);

    return res.status(200).json({
      success: true,
      employees,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEmployees / limit),
        totalEmployees,
        hasNext: page * limit < totalEmployees,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const adminId = req.id;

    // ✅ Check permissions for Admin + Manager
    const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions to view employee details",
        success: false,
      });
    }

    const employee = await Employee.findById(employeeId)
      .select("-password")
      .populate("createdBy", "fullName email");

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const adminId = req.id;
    const { fullName, email, mobileNo, role, isActive } = req.body;

    // ✅ Check permissions for Admin + Manager
    const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions to update employees",
        success: false,
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
        success: false,
      });
    }

    // Check if email or mobile is being changed and if it conflicts
    if (email && email !== employee.email) {
      const existingEmployee = await Employee.findOne({ email });
      if (existingEmployee) {
        return res.status(400).json({
          message: "Employee with this email already exists",
          success: false,
        });
      }
    }

    if (mobileNo && mobileNo !== employee.mobileNo) {
      const existingEmployee = await Employee.findOne({ mobileNo });
      if (existingEmployee) {
        return res.status(400).json({
          message: "Employee with this mobile number already exists",
          success: false,
        });
      }
    }

    // Update fields
    if (fullName) employee.fullName = fullName;
    if (email) employee.email = email;
    if (mobileNo) employee.mobileNo = mobileNo;
    if (role) employee.role = role;
    if (isActive !== undefined) employee.isActive = isActive;

    await employee.save();

    // Remove password from response
    const employeeResponse = {
      _id: employee._id,
      fullName: employee.fullName,
      email: employee.email,
      mobileNo: employee.mobileNo,
      role: employee.role,
      isActive: employee.isActive,
      updatedAt: employee.updatedAt,
    };

    return res.status(200).json({
      message: "Employee updated successfully",
      employee: employeeResponse,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const adminId = req.id;

    // ✅ Check permissions for Admin + Manager
    const permissionCheck = await hasPermission(adminId, ["admin", "Manager"]);
    if (!permissionCheck.hasPermission) {
      return res.status(403).json({
        message: "Insufficient permissions to delete employees",
        success: false,
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
        success: false,
      });
    }

    // Check if trying to delete self
    if (employeeId === adminId) {
      return res.status(400).json({
        message: "You cannot delete your own account",
        success: false,
      });
    }

    // Actually delete the employee from database
    await Employee.findByIdAndDelete(employeeId);

    return res.status(200).json({
      message: "Employee deleted successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const employeeLogin = async (req, res) => {
  try {
    const { emailOrUsername: email, password } = req.body;
    console.log("==================>>>>>>>>>>>", email, password);
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    // Find employee
    const employee = await Employee.findOne({ email: email.toLowerCase() });

    if (!employee) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // Check if employee is active
    if (!employee.isActive) {
      return res.status(401).json({
        message: "Account is deactivated",
        success: false,
      });
    }

    const isPasswordMatch = await employee.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // Update last login
    employee.lastLogin = new Date();
    await employee.save();

    // Generate JWT token
    const token = await jwt.sign(
      { employeeId: employee._id, userType: "employee", role: employee.role },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    // Prepare employee response
    const employeeResponse = {
      _id: employee._id,
      fullName: employee.fullName,
      email: employee.email,
      mobileNo: employee.mobileNo,
      role: employee.role,
      lastLogin: employee.lastLogin,
    };

    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        // sameSite: 'strict',
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // allow cross-site

        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        message: `Welcome ${employee.fullName}`,
        success: true,
        employee: employeeResponse,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
