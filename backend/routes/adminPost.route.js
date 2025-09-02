import express from "express";
import { 
    getPostsForApproval, 
    approvePost, 
    rejectPost, 
    getPostDetails 
} from "../controllers/adminPost.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// All routes are protected and require admin authentication
router.route('/').get(isAuthenticated, getPostsForApproval);
router.route('/:id/approve').post(isAuthenticated, approvePost);
router.route('/:id/reject').post(isAuthenticated, rejectPost);
router.route('/:id').get(isAuthenticated, getPostDetails);

export default router;
