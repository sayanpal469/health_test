import Blog from "../../models/blog/blog.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import handleMongoErrors from "../../utils/mongooseError.js";
import slugify from "slugify";

// Create Blog
export const createBlog = asyncHandler(async (req, res) => {
  try {
    const { title, content, type, tags, image, isPublished } = req.body;

    // Validation
    if (!title || !content || !type || !image) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All required fields must be filled"));
    }

    // Generate slug from title
    const slug = slugify(title, { lower: true, strict: true });

    // Check if blog with same slug already exists
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return res
        .status(409)
        .json(
          new ApiResponse(409, null, "Blog with similar title already exists")
        );
    }

    // Create new blog
    const blog = new Blog({
      title,
      slug,
      content,
      type,
      tags: tags || [],
      image,
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null,
    });

    await blog.save();

    return res
      .status(201)
      .json(new ApiResponse(201, blog, "Blog created successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});


// Get All Blogs
export const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const { type, tag, page = 1, limit = 10, publishedOnly } = req.query;

    let query = {};

    // Filter by published status - only if publishedOnly is explicitly "true"
    if (publishedOnly === "true") {
      query.isPublished = true;
    } else if (publishedOnly === "false") {
      query.isPublished = false;
    }
    // If publishedOnly is not provided or empty, include both published and unpublished

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { publishedAt: -1, createdAt: -1 },
    };

    // Using aggregate for better pagination and filtering
    const blogs = await Blog.aggregate([
      { $match: query },
      { $sort: { publishedAt: -1, createdAt: -1 } },
      { $skip: (options.page - 1) * options.limit },
      { $limit: options.limit },
    ]);

    const total = await Blog.countDocuments(query);

    const response = {
      blogs,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalBlogs: total,
        hasNext: options.page * options.limit < total,
        hasPrev: options.page > 1,
      },
    };

    return res
      .status(200)
      .json(new ApiResponse(200, response, "Blogs retrieved successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});
// Get Published Blogs
export const getPublishedBlogs = asyncHandler(async (req, res) => {
  try {
    const { type, tag, page = 1, limit = 10 } = req.query;

    let query = { isPublished: true };

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { publishedAt: -1 },
    };

    const blogs = await Blog.aggregate([
      { $match: query },
      { $sort: { publishedAt: -1 } },
      { $skip: (options.page - 1) * options.limit },
      { $limit: options.limit },
    ]);

    const total = await Blog.countDocuments(query);

    const response = {
      blogs,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalBlogs: total,
        hasNext: options.page * options.limit < total,
        hasPrev: options.page > 1,
      },
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200, response, "Published blogs retrieved successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Blog by ID
export const getBlogById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json(new ApiResponse(404, null, "Blog not found"));
    }

    // If blog is not published, only allow admin access
    if (!blog.isPublished && (!req.user || req.user.role !== "admin")) {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, "Access denied. Blog is not published")
        );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, blog, "Blog retrieved successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Blog by Slug
export const getBlogBySlug = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).json(new ApiResponse(404, null, "Blog not found"));
    }

    // If blog is not published, only allow admin access
    if (!blog.isPublished && (!req.user || req.user.role !== "admin")) {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, "Access denied. Blog is not published")
        );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, blog, "Blog retrieved successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Update Blog
export const updateBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, tags, image, isPublished } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json(new ApiResponse(404, null, "Blog not found"));
    }

    // If title is being updated, generate new slug
    let slug = blog.slug;
    if (title && title !== blog.title) {
      slug = slugify(title, { lower: true, strict: true });

      // Check if new slug already exists (excluding current blog)
      const existingBlog = await Blog.findOne({ slug, _id: { $ne: id } });
      if (existingBlog) {
        return res
          .status(409)
          .json(
            new ApiResponse(409, null, "Blog with similar title already exists")
          );
      }
    }

    // Update fields
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (type) blog.type = type;
    if (tags !== undefined) blog.tags = tags;
    if (image) blog.image = image;
    if (isPublished !== undefined) {
      blog.isPublished = isPublished;
      // Set publishedAt date if publishing for the first time
      if (isPublished && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }
    blog.slug = slug;

    await blog.save();

    return res
      .status(200)
      .json(new ApiResponse(200, blog, "Blog updated successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Delete Blog
export const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json(new ApiResponse(404, null, "Blog not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Blog deleted successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Blog Tags
export const getBlogTags = asyncHandler(async (req, res) => {
  try {
    const tags = await Blog.aggregate([
      { $match: { isPublished: true } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, tags, "Blog tags retrieved successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Search Blogs
export const searchBlogs = asyncHandler(async (req, res) => {
  try {
    const { query, type, tag, page = 1, limit = 10 } = req.query;

    let searchCriteria = { isPublished: true };

    if (query) {
      searchCriteria.$or = [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ];
    }

    if (type) {
      searchCriteria.type = type;
    }

    if (tag) {
      searchCriteria.tags = { $in: [tag] };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { publishedAt: -1 },
    };

    const blogs = await Blog.aggregate([
      { $match: searchCriteria },
      { $sort: { publishedAt: -1 } },
      { $skip: (options.page - 1) * options.limit },
      { $limit: options.limit },
    ]);

    const total = await Blog.countDocuments(searchCriteria);

    const response = {
      blogs,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalBlogs: total,
        hasNext: options.page * options.limit < total,
        hasPrev: options.page > 1,
      },
    };

    return res
      .status(200)
      .json(new ApiResponse(200, response, "Blogs search results"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});
