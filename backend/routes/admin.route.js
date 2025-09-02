import express from "express";
import { 
    adminLogin, 
    adminLogout, 
    createDefaultAdmin, 
    getAdminProfile 
} from "../controllers/admin.controller.js";
import isAdminAuthenticated from "../middlewares/isAdminAuthenticated.js";
import { 
    validateAdminLogin, 
    handleValidationErrors 
} from "../middlewares/validation.js";

const router = express.Router();

// Create default admin (run once to set up admin)
router.route('/create-default').post(createDefaultAdmin);

// Admin authentication routes
router.route('/login').post(validateAdminLogin, handleValidationErrors, adminLogin);
router.route('/logout').get(adminLogout);

// Protected admin routes
router.route('/profile').get(isAdminAuthenticated, getAdminProfile);

export default router;
