import express from "express";
import {
  getPostsForApproval,
  approvePost,
  rejectPost,
  getPostDetails,
  updateAdminPost,
  getAllAdminPosts,
} from "../controllers/adminPost.controller.js";
import isAdminAuthenticated from "../middlewares/isAdminAuthenticated.js";

const router = express.Router();

// All routes are protected and require admin authentication
router.route("/").get(isAdminAuthenticated, getPostsForApproval);
router.get("/all", isAdminAuthenticated, getAllAdminPosts);
router.route("/:id/approve").post(isAdminAuthenticated, approvePost);
router.route("/:id/reject").post(isAdminAuthenticated, rejectPost);
router.route("/:id").get(isAdminAuthenticated, getPostDetails);

// router.patch("/updatePost/:id", isAdminAuthenticated, updateAdminPost);

export default router;
