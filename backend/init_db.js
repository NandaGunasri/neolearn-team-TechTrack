// init_db.js — safe schema fix: add instructor column if missing, insert samples if empty
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/lms.db');

db.serialize(() => {
  // Ensure table exists (older versions without instructor will still be detected)
  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT
  )`, (err) => {
    if (err) console.error('create table error', err);
  });

  // Check columns
  db.all(`PRAGMA table_info(courses);`, (err, rows) => {
    if (err) {
      console.error('PRAGMA error', err);
    } else {
      const cols = rows.map(r => r.name);
      if (!cols.includes('instructor')) {
        console.log('Adding missing column: instructor');
        db.run(`ALTER TABLE courses ADD COLUMN instructor TEXT;`, (aerr) => {
          if (aerr) console.error('Failed to add column', aerr);
          else console.log('Added instructor column.');
        });
      } else {
        console.log('instructor column already present.');
      }

      // After ensuring column exists, insert sample courses only if table empty
      db.get(`SELECT COUNT(*) AS count FROM courses;`, (cErr, r) => {
        if (cErr) return console.error('count error', cErr);
        if (r.count === 0) {
          const stmt = db.prepare("INSERT INTO courses (title, description, instructor) VALUES (?, ?, ?)");
          stmt.run("Python Basics", "Learn Python from scratch", "John Doe");
          stmt.run("Web Development", "HTML, CSS, and JavaScript fundamentals", "Jane Smith");
          stmt.finalize(() => {
            console.log('✅ Sample courses inserted into DB');
            db.close();
          });
        } else {
          console.log(`Courses table not empty (${r.count} rows). No sample inserted.`);
          db.close();
        }
      });
    }
  });
});
