import express from "express";
import {
  getPostsForApproval,
  approvePost,
  rejectPost,
  getPostDetails,
  updateAdminPost,
  getAllAdminPosts,
} from "../controllers/adminPost.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isAdminAuthenticated from "../middlewares/isAdminAuthenticated.js";

const router = express.Router();

// All routes are protected and require admin authentication
router.route("/").get(isAuthenticated, getPostsForApproval);
router.get("/all", isAdminAuthenticated, getAllAdminPosts);
router.route("/:id/approve").post(isAuthenticated, approvePost);
router.route("/:id/reject").post(isAuthenticated, rejectPost);
router.route("/:id").get(isAuthenticated, getPostDetails);

// router.patch("/updatePost/:id", isAdminAuthenticated, updateAdminPost);

export default router;
