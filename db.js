const { Pool } = require('pg');
require('dotenv').config(); 

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://insight_db_7za3_user:n8FVSzoF7X2YpGsmN7fw7pfITitbZJOJ@dpg-d7nn3a9kh4rs73ba5s5g-a.oregon-postgres.render.com/insight_db_7za3",
    ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
    console.log('Database connected successfully');
});

pool.on('error', (err) => {
    console.error('Error on Database:', err);
});

const createTables = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        student_name TEXT, -- Added this
        title TEXT NOT NULL,
        abstractdescrip TEXT,
        department TEXT,
        supervisor TEXT,
        year INTEGER,
        file_path TEXT,
        external_link TEXT,
        video_link TEXT,   -- Added this
        status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        project_id INTEGER REFERENCES projects(id),
        UNIQUE(user_id, project_id)
    );
    `;
    try {
        await pool.query(queryText);
        console.log("Tables initialized successfully");
    } catch (err) {
        console.error("Error creating tables", err);
    }
};
createTables();
   

module.exports = pool;