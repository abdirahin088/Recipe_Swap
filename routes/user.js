const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all users
router.get("/view/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM recipes WHERE id = ?", [id], (err, results) => {
        if (err || results.length === 0) return res.status(404).send("Recipe not found");
        res.render("recipe_detail", { recipe: results[0] });
    });
});


module.exports = router;
