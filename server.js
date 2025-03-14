const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path"); // Import path module
const db = require("./db");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set PUG as the View Engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views")); // Define the views folder

// Import Routes
const userRoutes = require("./routes/user");
const recipeRoutes = require("./routes/recipes");

// Use Routes
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);


// Define Static Public Folder (for images, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
