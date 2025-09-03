import jwt from "jsonwebtoken";

const isAdminAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Admin not authenticated",
        success: false,
      });
    }

    const decode = await jwt.verify(token, process.env.SECRET_KEY);

    if (!decode || decode.userType !== "admin") {
      return res.status(401).json({
        message: "Invalid admin token",
        success: false,
      });
    }

    req.adminId = decode.adminId;
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
