import express from "express";
import { 
    getAccountDashboard, 
    processPayment, 
    getUserPaymentHistory 
} from "../controllers/accountDashboard.controller.js";
import isAdminAuthenticated from "../middlewares/isAdminAuthenticated.js";

const router = express.Router();

// All routes are protected and require admin authentication
router.route('/').get(isAdminAuthenticated, getAccountDashboard);
router.route('/:id/pay').post(isAdminAuthenticated, processPayment);
router.route('/user/:userId').get(isAdminAuthenticated, getUserPaymentHistory);

export default router;
