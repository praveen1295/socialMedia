import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { 
    addComment, 
    addNewPost, 
    bookmarkPost, 
    deletePost, 
    dislikePost, 
    getAllPost, 
    getCommentsOfPost, 
    getUserPost, 
    likePost, 
    getVideoProcessingStatus,
    trackPostView,
    getPostViews,
    getPostLikes,
    editComment,
    deleteComment
} from "../controllers/post.controller.js";

const router = express.Router();

router.route("/addpost").post(isAuthenticated, upload.array('media', 10), addNewPost);
router.route("/all").get(isAuthenticated,getAllPost);
router.route("/userpost/all").get(isAuthenticated, getUserPost);
router.route("/:id/like").get(isAuthenticated, likePost);
router.route("/:id/dislike").get(isAuthenticated, dislikePost);
router.route("/:id/comment").post(isAuthenticated, addComment); 
router.route("/:id/comment/all").get(isAuthenticated, getCommentsOfPost);
router.route("/delete/:id").delete(isAuthenticated, deletePost);
router.route("/:id/bookmark").get(isAuthenticated, bookmarkPost);
router.route("/:id/processing-status").get(isAuthenticated, getVideoProcessingStatus);
router.route("/:id/view").post(isAuthenticated, trackPostView);
router.route("/:id/views").get(isAuthenticated, getPostViews);
router.route("/:id/likes").get(isAuthenticated, getPostLikes);
router.route("/comment/:id/edit").put(isAuthenticated, editComment);
router.route("/comment/:id/delete").delete(isAuthenticated, deleteComment);

export default router;

