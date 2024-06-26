import path from 'path';
import sqlite from 'sqlite3';

const dbPath = path.join(__dirname, 'app_database.db');
new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});
