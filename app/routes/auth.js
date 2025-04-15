const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../services/db');
const router = express.Router();

// GET Register
router.get('/register', (req, res) => res.render('register'));

// POST Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashed]);
  res.redirect('/login');
});

// GET Login
router.get('/login', (req, res) => res.render('login'));

// POST Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (users.length && await bcrypt.compare(password, users[0].password)) {
    req.session.user = users[0];
    res.redirect('/');
  } else {
    res.send('Invalid login');
  }
});

module.exports = router;


