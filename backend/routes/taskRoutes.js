const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Task } = require("../models"); // Your Task model
const verifyToken = require("../middleware/verifyToken"); // Your authentication middleware

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images are allowed"));
  },
}).single("image");

const router = express.Router();

// Get tasks for a user on a specific date
router.get("/", verifyToken, async (req, res) => {
  console.log("Request Headers:", req.headers);
  const { date } = req.query;

  try {
    const whereClause = {
      userId: req.user.userId,
    };

    if (date) {
      whereClause.date = new Date(date);
    }

    const tasks = await Task.findAll({
      where: whereClause,
    });

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// Create or update tasks for a specific date
router.post("/", verifyToken, upload, async (req, res) => {
  console.log("Received POST /tasks with req.body:", req.body);
  console.log("Received file:", req.file);

  const { date, text, color } = req.body;

  if (!date || !text) {
    return res.status(400).json({ message: "Date and text are required" });
  }

  try {
    let imagePath = null;
    if (req.file) {
      imagePath = req.file.path;
    }

    const newTask = await Task.create({
      userId: req.user.userId,
      date: new Date(date),
      text,
      color,
      image: imagePath,
    });

    // Save the image path in the database
    await Task.update(
      {
        image: imagePath,
      },
      {
        where: {
          id: newTask.id,
        },
      }
    );

    res.status(201).json(newTask);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(400).json({ message: "Error creating task" });
  }
});

// Update a task by ID
router.put("/:id", verifyToken, upload, async (req, res) => {
  const { id } = req.params;
  const { date, text, color, completed, image } = req.body;

  try {
    const task = await Task.findOne({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update the task fields if they are provided in the request
    task.date = date ? new Date(date) : task.date;
    task.text = text || task.text;
    task.color = color || task.color;
    task.completed = completed !== undefined ? completed : task.completed;

    // Update the image if a new image is uploaded
    if (req.file) {
      task.image = req.file.path;
      await fs.promises.unlink(task.imageOriginal); // Remove the original image
      await fs.promises.rename(req.file.path, task.image); // Rename the uploaded image
    } else if (image) {
      // Update image if a new image URL is provided from the frontend
      task.image = image;
    }

    await task.save();
    res.status(200).json(task);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(400).json({ message: "Error updating task" });
  }
});

// Get an image by task ID
router.get("/:id/image", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findOne({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const imagePath = task.image;
    const imageBuffer = await fs.promises.readFile(imagePath);
    res.set(
      "Content-Disposition",
      `attachment; filename="${path.basename(imagePath)}"`
    );
    res.set("Content-Type", "image/jpeg");
    res.send(imageBuffer);
  } catch (err) {
    console.error("Error retrieving image:", err);
    res.status(404).json({ message: "Image not found" });
  }
});

// Delete an image by task ID
router.delete("/:id/image", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findOne({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const imagePath = task.image;
    await fs.promises.unlink(imagePath);
    await Task.update(
      {
        image: null,
      },
      {
        where: {
          id,
        },
      }
    );

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("Error deleting image:", err);
    res.status(500).json({ message: "Error deleting image" });
  }
});

// Delete a task by ID
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findOne({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.destroy();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: "Error deleting task" });
  }
});

// Duplicate a task to another date
router.post("/:id/duplicate", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { newDate } = req.body;

  if (!newDate) {
    return res
      .status(400)
      .json({ message: "New date is required for duplication" });
  }

  try {
    const task = await Task.findOne({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Duplicate the task to a new date
    const duplicatedTask = await Task.create({
      userId: task.userId,
      date: new Date(newDate),
      text: task.text,
      color: task.color,
    });

    res.status(201).json(duplicatedTask);
  } catch (err) {
    console.error("Error duplicating task:", err);
    res.status(500).json({ message: "Error duplicating task" });
  }
});

// Reset all task colors to the default color
router.put("/reset-colors", verifyToken, async (req, res) => {
  try {
    await Task.update(
      { color: "#D1D5DB" },
      { where: { userId: req.user.userId } }
    );

    res.status(200).json({ message: "Task colors reset to default." });
  } catch (err) {
    console.error("Error resetting task colors:", err);
    res.status(500).json({ message: "Error resetting task colors" });
  }
});

module.exports = router;
