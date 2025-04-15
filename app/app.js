const express = require("express");
const session = require("express-session");
const path = require("path");

const authRoutes = require("./routes/auth");
const db = require("./services/db");
const matching = require('./services/matching');
const ratingsService = require('./services/ratings');

const app = express();

// Session setup
app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: true
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Pug as template engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, '../public')));
console.log('Public folder:', path.join(__dirname, 'public'));

// Test DB connection
db.query('SELECT 1')
  .then(() => console.log('Database connected successfully!'))
  .catch(err => console.error('Error connecting to database:', err));

// === ENHANCED HOMEPAGE ROUTE ===
// Enhanced Homepage Route to Fetch User Interests
app.get("/", async function (req, res) {
  const user = req.session.user;
  let matches = [];
  let recipes = [];
  let points = 0;
  let userInterests = [];

  try {
    if (user) {
      matches = await matching.findAdvancedMatchingUsers(user.id);
      recipes = await db.query("SELECT * FROM recipes ORDER BY id DESC LIMIT 5");
      points = await ratingsService.calculateUserPoints(user.id);

      // Get the user's interests from the database
      userInterests = await db.query('SELECT interest FROM user_interests WHERE user_id = ?', [user.id]);
    }

    res.render("index", {
      user,
      matches,
      recipes,
      points,
      userInterests
    });
  } catch (err) {
    console.error("Homepage error:", err);
    res.status(500).send("Something went wrong on the homepage.");
  }
});


// === Other Routes ===
app.use(authRoutes);

// Matches Page
app.get('/matches', async (req, res) => {
  const currentUserId = req.session.user.id;

  try {
    const matches = await matching.findAdvancedMatchingUsers(currentUserId);
    res.render('matches', { matches });
  } catch (error) {
    console.error('Error finding advanced matches:', error);
    res.status(500).send('Error finding advanced matches');
  }
});

// Rating routes
app.post('/rate', async (req, res) => {
  const { userId, recipeId, rating } = req.body;
  try {
      await ratingsService.rateRecipe(userId, recipeId, rating); // Update the rating in the database
      res.redirect('/'); // Redirect to the homepage to display the updated points
  } catch (error) {
      res.status(500).send('Error adding rating.');
  }
});

app.get('/user-points/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const points = await ratingsService.calculateUserPoints(userId);
    res.send(`User ${userId} has ${points} points.`);
  } catch (error) {
    res.status(500).send('Error calculating points.');
  }
});

app.get('/advanced-rating/:userId/:recipeId', async (req, res) => {
  const userId = req.params.userId;
  const recipeId = req.params.recipeId;

  try {
    const advancedRating = await ratingsService.getAdvancedRating(userId, recipeId);
    res.send(`Advanced rating for Recipe ID ${recipeId} by User ID ${userId}: ${advancedRating}`);
  } catch (error) {
    res.status(500).send('Error calculating advanced rating.');
  }
});



// Route to get the 'Add Recipe' page
app.get('/add-recipe', (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.redirect('/login'); // Ensure user is logged in
  }
  res.render('add-recipe'); // Render the form to add a recipe
});
// Route to handle recipe submission
app.post('/submit-recipe', async (req, res) => {
  const { title, description, ingredients, instructions } = req.body;
  const userId = req.session.user.id;

  try {
    // Insert the new recipe into the database
    await db.query(
      'INSERT INTO recipes (title, description, ingredients, instructions, user_id) VALUES (?, ?, ?, ?, ?)', 
      [title, description, ingredients, instructions, userId]
    );
    res.redirect('/'); // Redirect to the homepage after submitting
  } catch (error) {
    console.error('Error submitting recipe:', error);
    res.status(500).send('Error submitting recipe.');
  }
});
app.get('/recipes', async (req, res) => {
  const user = req.session.user;
  let recipes = [];
  
  try {
    if (user) {
      // Fetch all recipes
      recipes = await db.query("SELECT * FROM recipes WHERE user_id = ?", [user.id]);
    }
    
    res.render('recipes', { user, recipes }); // Render the 'recipes.pug' template with recipes data
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).send('Error fetching recipes.');
  }
});



// Route to get the add-interest page
app.get('/add-interest', (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.redirect('/login'); // Ensure user is logged in
  }
  res.render('add-interest'); // Render the form to add interests
});

// Route to handle the form submission for adding interests
app.post('/add-interest', async (req, res) => {
  const { interest } = req.body;
  const userId = req.session.user.id;
  
  try {
    await db.query('INSERT INTO user_interests (user_id, interest) VALUES (?, ?)', [userId, interest]);
    res.redirect('/'); // Redirect back to the homepage after adding the interest
  } catch (error) {
    console.error('Error adding interest:', error);
    res.status(500).send('Error adding interest.');
  }
});

app.get('/users', async (req, res) => {
  const user = req.session.user;
  let users = [];

  try {
    if (user) {
      // Fetch all users from the database (excluding the current user)
      users = await db.query("SELECT id, username, email FROM users WHERE id != ?", [user.id]);
    }
    
    res.render('users', { user, users }); // Render the 'users.pug' template with users data
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users.');
  }
});
// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out.');
    }
    res.redirect('/'); // Redirect to the homepage after logout
  });
});


// Misc routes
app.get("/db_test", (req, res) => {
  db.query("SELECT * FROM test_table")
    .then(results => res.send(results))
    .catch(err => {
      console.error("Error executing database query:", err);
      res.status(500).send("Database query failed");
    });
});

app.get("/goodbye", (req, res) => res.send("Goodbye world!"));

app.get("/hello/:name", (req, res) => {
  res.send("Hello " + req.params.name);
});

// Start the server
app.listen(3000, () => {
  console.log(`Server running at http://127.0.0.1:3000/`);
});
