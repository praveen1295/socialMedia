import express from "express";
import { 
    createRevenueSharing, 
    getRevenueSharing, 
    updateRevenueSharing, 
    getRevenueSharingHistory 
} from "../controllers/revenueSharing.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// All routes are protected and require admin authentication
router.route('/').post(isAuthenticated, createRevenueSharing);
router.route('/').get(isAuthenticated, getRevenueSharing);
router.route('/').put(isAuthenticated, updateRevenueSharing);
router.route('/history').get(isAuthenticated, getRevenueSharingHistory);

export default router;
