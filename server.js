const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = 4040;
const SECRET_KEY = "your_secret_key";
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(cors({
    origin: ['https://houadjeto-dot.github.io', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(cookieParser());


pool.query(`
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS file_path TEXT;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS student_name TEXT;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_link TEXT;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS technologies TEXT;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS external_link TEXT; 
`).then(() => console.log(" All Database Columns Synced!"))
  .catch(err => console.error(" Sync Error:", err));

app.get('/', (req, res) => {
  res.send('InsightHub Server is running!');
});

app.post('/api/register', async (req, res) => {
    const { email, fullName, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            `INSERT INTO users (email, full_name, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING id`,
            [email, fullName, hashedPassword, false]
        );
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            res.status(400).json({ error: "Email already exists" });
        } else {
            res.status(500).json({ error: "Database error during registration" });
        }
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, isAdmin: user.is_admin }, SECRET_KEY);
        res.cookie('token', token, { httpOnly: true });
        return res.json({ isAdmin: user.is_admin });
    }
    res.status(401).json({ error: "Invalid credentials" });
});

app.get('/api/user-status', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ loggedIn: false });
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.json({ loggedIn: false });
        res.json({ loggedIn: true, isAdmin: decoded.isAdmin, userId: decoded.id });
    });
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logged out" });
});

app.get('/api/projects', async (req, res) => {
    try {
        const { dept, year, search, tech } = req.query;

        let query = "SELECT * FROM projects WHERE status = 'approved'";
        let params = [];

        if (dept) {
            params.push(dept);
            query += ` AND department = $${params.length}`;
        }
        if (year) {
            params.push(year);
            query += ` AND year = $${params.length}`;
        }
        if (tech) {
            params.push(`%${tech}%`);
            query += ` AND technologies ILIKE $${params.length}`;
        }
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (title ILIKE $${params.length} OR abstractdescrip ILIKE $${params.length})`;
        }

        query += " ORDER BY id DESC";
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).json({ error: "Search failed" });
    }
});

app.post('/api/projects', upload.single('projectFile'), async (req, res) => {
    const { title, abstractdescrip, department, supervisor, year, external_link, video_link, student_name, technologies } = req.body;
    const file_path = req.file ? req.file.path : null;
    try {
        await pool.query(
            `INSERT INTO projects (title, abstractdescrip, department, supervisor, year, file_path, external_link, video_link, student_name, technologies, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')`,
            [title, abstractdescrip, department, supervisor, year, file_path, external_link, video_link, student_name || 'Anonymous', technologies || '']
        );
        res.status(200).json({ message: "Submitted for approval" });
    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).json({ error: "Database insertion failed: " + err.message });
    }
});

app.get('/api/projects/:id', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM projects WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Project not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});


app.get('/api/admin/all-projects', async (req, res) => {
    const result = await pool.query("SELECT * FROM projects ORDER BY id DESC");
    res.json(result.rows);
});

app.patch('/api/admin/project/:id', async (req, res) => {
    const { id } = req.params;
    const { status, title, abstractdescrip } = req.body;
    try {
        const fields = [];
        const values = [];

        if (status !== undefined) {
            values.push(status);
            fields.push(`status = $${values.length}`);
        }
        if (title !== undefined) {
            values.push(title);
            fields.push(`title = $${values.length}`);
        }
        if (abstractdescrip !== undefined) {
            values.push(abstractdescrip);
            fields.push(`abstractdescrip = $${values.length}`);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: "Nothing to update" });
        }

        values.push(id);
        const query = `UPDATE projects SET ${fields.join(', ')} WHERE id = $${values.length}`;
        await pool.query(query, values);
        res.json({ message: "Project updated" });
    } catch (err) {
        console.error("PATCH error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/project/:id', async (req, res) => {
    try {
        await pool.query("DELETE FROM projects WHERE id = $1", [req.params.id]);
        res.json({ message: "Project deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/projects/:id/comments', async (req, res) => {
    const result = await pool.query(
        "SELECT * FROM comments WHERE project_id = $1 ORDER BY created_at DESC",
        [req.params.id]
    );
    res.json(result.rows);
});

app.post('/api/projects/:id/comments', async (req, res) => {
    const { text } = req.body;
    try {
        await pool.query(
            "INSERT INTO comments (project_id, content) VALUES ($1, $2)",
            [req.params.id, text]
        );
        res.status(201).json({ message: "Comment added" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/bookmarks', async (req, res) => {
    const { userId, projectId } = req.body;
    try {
        await pool.query(
            "INSERT INTO bookmarks (user_id, project_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [userId, projectId]
        );
        res.status(201).json({ message: "Bookmarked" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/bookmarks/:userId', async (req, res) => {
    const result = await pool.query(
        `SELECT p.* FROM projects p JOIN bookmarks b ON p.id = b.project_id WHERE b.user_id = $1`,
        [req.params.userId]
    );
    res.json(result.rows);
});

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));