// services/matching.js
const db = require('./db');  // Assuming db.js has the query function set up
const ratingsService = require('./ratings');  // Import the ratingsService

async function getUserInterests(userId) {
    const result = await db.query('SELECT interest FROM user_interests WHERE user_id = ?', [userId]);
    return result.map(row => row.interest);
}

async function getAllUserInterests() {
    const result = await db.query('SELECT user_id, interest FROM user_interests');
    let userInterests = {};
    result.forEach(row => {
        if (!userInterests[row.user_id]) {
            userInterests[row.user_id] = [];
        }
        userInterests[row.user_id].push(row.interest);
    });
    return userInterests;
}

async function findMatchingUsers(currentUserId) {
    const userInterests = await getUserInterests(currentUserId);
    const allUserInterests = await getAllUserInterests();

    let matchedUsers = [];

    for (const userId in allUserInterests) {
        if (userId !== currentUserId) {
            let commonInterests = userInterests.filter(interest => allUserInterests[userId].includes(interest));

            if (commonInterests.length > 0) {
                matchedUsers.push({
                    userId,
                    commonInterests,
                    matchScore: commonInterests.length
                });
            }
        }
    }

    return matchedUsers;
}

// Function to find users with shared interests and calculate match score
async function findAdvancedMatchingUsers(currentUserId) {
    // Get current user's interests and points
    const userInterests = await getUserInterests(currentUserId);
    const allUserInterests = await getAllUserInterests();
    const userPoints = await ratingsService.calculateUserPoints(currentUserId);  // Use ratingsService here
    let matchedUsers = [];

    // Loop through all users and match based on common interests and points
    for (const userId in allUserInterests) {
        if (userId !== currentUserId) {
            let commonInterests = userInterests.filter(interest => allUserInterests[userId].includes(interest));

            // Enhance the match by adding weight for points and rating
            if (commonInterests.length > 0) {
                const userScore = await ratingsService.calculateUserPoints(userId);  // Use ratingsService here
                let matchScore = commonInterests.length + (userPoints / 10) + (userScore / 10);  // Example score

                matchedUsers.push({
                    userId,
                    commonInterests,
                    matchScore
                });
            }
        }
    }

    return matchedUsers;
}

module.exports = { findAdvancedMatchingUsers };


