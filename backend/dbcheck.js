const mysql = require('mysql2/promise');

async function check() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '#Chandan@7143',
      database: 'Ecoquest2'
    });
    console.log("Connected to MySQL!");
    const [rows] = await conn.execute("SHOW TABLES;");
    console.log(rows);
    await conn.end();
  } catch (err) {
    console.error(err);
  }
}
check();
