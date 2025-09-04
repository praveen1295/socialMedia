import jwt from "jsonwebtoken";

const isAdminAuthenticated = async (req, res, next) => {
  try {
    // Check for both adminToken and token cookies
    const token = req.cookies.adminToken || req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Admin not authenticated",
        success: false,
      });
    }

    const decode = await jwt.verify(token, process.env.SECRET_KEY);

    console.log("decode", decode);

    if (
      !decode ||
      !["admin", "employee", "Manager", "Accountant"].includes(decode.userType)
    ) {
      return res.status(401).json({
        message: "Unauthorized access",
        success: false,
      });
    }

    // Set the user ID based on the token type
    if (decode.userType === "employee") {
      req.id = decode.employeeId; // For employee tokens
    } else if (decode.userType === "admin") {
      req.id = decode.adminId || decode.userId; // For admin tokens (handle both adminId and userId)
    } else {
      req.id = decode.userId; // For regular user tokens
    }

    req.adminId = req.id; // Keep for backward compatibility
    req.adminRole = decode.role;
    req.adminPermissions = decode.permissions;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      message: "Invalid or expired admin token",
      success: false,
    });
  }
};

export default isAdminAuthenticated;
