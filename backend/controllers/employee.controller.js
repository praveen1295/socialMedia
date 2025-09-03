import { Employee } from "../models/employee.model.js";
import { Admin } from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const createEmployee = async (req, res) => {
  try {
    let { fullName, email, mobileNo, role, password } = req.body;
    const adminId = req.id; // From authentication middleware

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

    // Verify admin exists and has permission
    const admin = await Admin.findById(adminId);
    if (!admin || !admin.isActive) {
      return res.status(403).json({
        message: "Unauthorized to create employees",
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

    // Verify admin exists
    const admin = await Admin.findById(adminId);
    if (!admin || !admin.isActive) {
      return res.status(403).json({
        message: "Unauthorized",
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

    // Verify admin exists
    const admin = await Admin.findById(adminId);
    if (!admin || !admin.isActive) {
      return res.status(403).json({
        message: "Unauthorized",
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

    // Verify admin exists
    const admin = await Admin.findById(adminId);
    if (!admin || !admin.isActive) {
      return res.status(403).json({
        message: "Unauthorized",
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

    // Verify admin exists
    const admin = await Admin.findById(adminId);
    if (!admin || !admin.isActive) {
      return res.status(403).json({
        message: "Unauthorized",
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

    // Soft delete by setting isActive to false
    employee.isActive = false;
    await employee.save();

    return res.status(200).json({
      message: "Employee deactivated successfully",
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
    const { email, password } = req.body;

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
