// services/ratings.js

const db = require('./db');  // Assuming db.js has the query function set up

// Function to add a rating for a recipe
async function rateRecipe(userId, recipeId, rating) {
    const result = await db.query('INSERT INTO ratings (user_id, recipe_id, rating) VALUES (?, ?, ?)', [userId, recipeId, rating]);
    return result;
}

// Function to calculate points for users based on their ratings
async function calculateUserPoints(userId) {
    const ratings = await db.query('SELECT rating FROM ratings WHERE user_id = ?', [userId]);
    let totalPoints = 0;
    ratings.forEach(rating => {
        totalPoints += rating.rating;
    });
    return totalPoints;
}

// Advanced Rating System: Weighted ratings
async function getAdvancedRating(userId, recipeId) {
    // Get all ratings for the given recipe and user
    const userRatings = await db.query('SELECT * FROM ratings WHERE user_id = ? AND recipe_id = ?', [userId, recipeId]);

    // Calculate weighted rating based on frequency and interaction
    let weightedRating = 0;
    if (userRatings.length > 0) {
        // Example: Apply weight to the rating (e.g., 1.5x the rating value)
        weightedRating = userRatings[0].rating * 1.5;
    }

    return weightedRating;
}

module.exports = { rateRecipe, calculateUserPoints, getAdvancedRating };


