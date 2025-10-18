const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data/lms.db");

db.serialize(() => {
  // Drop old table and recreate with correct schema
  db.run("DROP TABLE IF EXISTS courses", (err) => {
    if (err) console.error("drop error", err);
  });

  db.run("CREATE TABLE IF NOT EXISTS courses (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, instructor TEXT)", (err) => {
    if (err) return console.error("create error", err);

    // Insert sample rows
    const stmt = db.prepare("INSERT INTO courses (title, description, instructor) VALUES (?, ?, ?)");
    stmt.run("Python Basics", "Learn Python from scratch", "John Doe");
    stmt.run("Web Development", "HTML, CSS, JS fundamentals", "Jane Smith");
    stmt.finalize((ferr) => {
      if (ferr) console.error("finalize error", ferr);
      else console.log("✅ Recreated table and added sample courses");
      db.close();
    });
  });
});
