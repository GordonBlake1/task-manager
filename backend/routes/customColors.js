// routes/usercolors.js
const express = require("express");
const { UserColors } = require("../models");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Get custom colors for the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("Fetching colors for user:", req.user.userId);
    const colors = await UserColors.findAll({
      where: { userId: req.user.userId },
      attributes: ["id", "name", "hex", "userId"],
    });
    console.log("Colors found:", colors);
    res.json(colors);
  } catch (err) {
    console.error("Error in GET /api/usercolors:", err);
    res
      .status(500)
      .json({ message: "Error fetching custom colors", error: err.message });
  }
});

// Create a new custom color for the logged-in user
router.post("/", verifyToken, async (req, res) => {
  const { name, hex } = req.body;
  console.log("Received color data:", { name, hex, userId: req.user.userId });
  try {
    const newColor = await UserColors.create({
      // Use create directly
      name,
      hex,
      userId: req.user.userId,
    });

    res.status(201).json(newColor); // Return the created color object
  } catch (error) {
    console.error("Error saving custom color:", error);
    res.status(400).json({ message: "Error saving custom color" });
  }
});

// Update a custom color for the logged-in user
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, hex } = req.body;
  try {
    const [updatedCount] = await UserColors.update(
      { name, hex },
      { where: { id, userId: req.user.userId }, returning: true }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ message: "Color not found" });
    }

    // Fetch and return the updated color
    const updatedColor = await UserColors.findOne({
      where: { id, userId: req.user.userId },
    });

    res.json({ message: "Color updated successfully", color: updatedColor });
  } catch (err) {
    console.error("Error updating custom color:", err);
    res
      .status(500)
      .json({ message: "Error updating custom color", error: err.message });
  }
});

// Delete a custom color for the logged-in user
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCount = await UserColors.destroy({
      where: { id, userId: req.user.userId },
    });
    if (deletedCount === 0) {
      return res.status(404).json({ message: "Color not found" });
    }
    res.json({ message: "Color deleted successfully" });
  } catch (err) {
    console.error("Error deleting custom color:", err); // Log the error
    res
      .status(500)
      .json({ message: "Error deleting custom color", error: err.message }); // Send a more informative error response
  }
});

module.exports = router;
