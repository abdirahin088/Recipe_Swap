const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'D:/Recipe_Swap-main/.env' });  // Explicit path
console.log('Environment Variables Loaded:');
console.log('MYSQL_HOST:', process.env.MYSQL_HOST);  // Debugging line
console.log('MYSQL_USER:', process.env.MYSQL_USER);  // Debugging line
console.log('MYSQL_PASS:', process.env.MYSQL_PASS);  // Debugging line
console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);  // Debugging line
console.log('MySQL config:', {
  host: process.env.MYSQL_HOST,
  port: process.env.DB_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE
});

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.DB_PORT,  // Default to 3315 if not provided
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE, 
  waitForConnections: true, 
  connectionLimit: 10, 
  queueLimit: 0
});

async function query(sql, params) {
  try {
    console.log("Executing query:", sql, "with params:", params);
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error("Error executing query:", err);
    throw err;  // Rethrow the error
  }
}

module.exports = { query };
