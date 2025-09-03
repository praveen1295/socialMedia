import express from "express";
import {
  editProfile,
  followOrUnfollow,
  getProfile,
  getSuggestedUsers,
  login,
  logout,
  register,
  getFollowers,
  getFollowing,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import {
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  handleValidationErrors,
} from "../middlewares/validation.js";

const router = express.Router();

// User authentication routes
router
  .route("/register")
  .post(
    upload.single("profilePicture"),
    validateUserRegistration,
    handleValidationErrors,
    register
  );
router.route("/login").post(validateUserLogin, handleValidationErrors, login);
router.route("/logout").get(logout);

// Protected user routes
router.route("/:id/profile").get(isAuthenticated, getProfile);
router
  .route("/profile/edit/:id")
  .post(
    isAuthenticated,
    upload.single("profilePicture"),
    validateProfileUpdate,
    handleValidationErrors,
    editProfile
  );
router.route("/suggested").get(isAuthenticated, getSuggestedUsers);
router.route("/followorunfollow/:id").post(isAuthenticated, followOrUnfollow);
router.route("/:id/followers").get(isAuthenticated, getFollowers);
router.route("/:id/following").get(isAuthenticated, getFollowing);

export default router;
