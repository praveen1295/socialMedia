import express from "express";
import { 
    createRevenueSharing, 
    getRevenueSharing, 
    updateRevenueSharing, 
    getRevenueSharingHistory 
} from "../controllers/revenueSharing.controller.js";
import isAdminAuthenticated from "../middlewares/isAdminAuthenticated.js";

const router = express.Router();

// All routes are protected and require admin authentication
router.route('/').post(isAdminAuthenticated, createRevenueSharing);
router.route('/').get(isAdminAuthenticated, getRevenueSharing);
router.route('/').put(isAdminAuthenticated, updateRevenueSharing);
router.route('/history').get(isAdminAuthenticated, getRevenueSharingHistory);

export default router;
