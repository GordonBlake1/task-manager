require("dotenv").config(); // Load environment variables
const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://your-frontend-domain.com",
]; // Update as needed

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

// Logging Middleware
app.use(morgan("dev")); // Use 'combined' for production

// Body Parsing Middleware
app.use(express.json()); // Parse JSON requests

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("'uploads' directory created.");
}

app.use("/uploads", express.static(uploadDir));

// Import Routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const customColors = require("./routes/customColors");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/usercolors", customColors);

// Test Route
app.get("/", (req, res) => {
  res.send("Hello from the BDO Tracker API!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({ message: "Internal Server Error" });
});

// Database Connection and Server Start
const db = require("./models");

db.sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");

    // Start the server after successful DB connection
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log("Shutting down gracefully...");
      server.close(() => {
        console.log("Closed out remaining connections.");
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
    process.exit(1); // Exit the process with failure
  });
