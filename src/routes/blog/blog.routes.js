import express from "express";
import {
  createBlog,
  getAllBlogs,
  getPublishedBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getBlogTags,
  searchBlogs,
} from "../../controller/blog/blog.controller.js";
import {
  authenticateAdmin,
} from "../../middleware/admin.auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/published", getPublishedBlogs);
router.get("/search", searchBlogs);
router.get("/tags", getBlogTags);
router.get("/slug/:slug", getBlogBySlug);
router.get("/:id", getBlogById);

// Protected routes (Admin only)
router.post("/", authenticateAdmin, createBlog);
router.put("/:id", authenticateAdmin, updateBlog);
router.delete("/:id", authenticateAdmin, deleteBlog);

export default router;
