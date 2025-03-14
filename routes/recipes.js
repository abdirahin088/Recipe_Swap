const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all recipes
router.get("/view/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM recipes WHERE id = ?", [id], (err, results) => {
        if (err || results.length === 0) return res.status(404).send("Recipe not found");
        res.render("recipe_detail", { recipe: results[0] });
    });
});

router.get("/", (req, res) => {
    db.query("SELECT * FROM recipes", (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Get a specific recipe by ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM recipes WHERE id = ?", [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results[0]);
    });
});

module.exports = router;
