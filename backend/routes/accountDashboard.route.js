import express from "express";
import { 
    getAccountDashboard, 
    processPayment, 
    getUserPaymentHistory 
} from "../controllers/accountDashboard.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// All routes are protected and require admin authentication
router.route('/').get(isAuthenticated, getAccountDashboard);
router.route('/:id/pay').post(isAuthenticated, processPayment);
router.route('/user/:userId').get(isAuthenticated, getUserPaymentHistory);

export default router;
