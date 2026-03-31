const express = require('express');
const mysql = require('mysql2');

const app = express();


app.use(express.json());


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '1234', 
    database: 'bank'
});


db.connect((err) => {
    if (err) {
        console.error('Помилка підключення до БД:', err.message);
        return;
    }
    console.log('Успішно підключено до бази даних банку!');
});



app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results); 
    });
});

// GET-запит: Текстовий пошук клієнта за ім'ям або прізвищем (використовуємо LIKE)
app.get('/users/search/:text', (req, res) => {
    const { text } = req.params;
    
    // Символи % з обох боків означають: "шукай цей шматок тексту будь-де в слові"
    const searchQuery = `%${text}%`; 
    
    const sql = 'SELECT * FROM users WHERE first_name LIKE ? OR last_name LIKE ?';
    
    db.query(sql, [searchQuery, searchQuery], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Клієнтів з таким текстом не знайдено' });
        }
        res.json(results);
    });
});

app.get('/users/:id', (req, res) => {
    const { id } = req.params; 

    const sql = 'SELECT * FROM users WHERE user_id = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Користувача з таким ID не знайдено' });
        }
        res.json(results[0]); 
    });
});

app.post('/users', (req, res) => {
    const { first_name, last_name, phone, email } = req.body;
    
    const sql = 'INSERT INTO users (first_name, last_name, phone, email) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [first_name, last_name, phone, email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
            message: 'Користувача успішно додано!', 
            id: results.insertId 
        });
    });
});


app.put('/users/:id', (req, res) => {
    const { id } = req.params; 
    const { first_name, last_name, phone, email } = req.body; 
    
    const sql = 'UPDATE users SET first_name = ?, last_name = ?, phone = ?, email = ? WHERE user_id = ?';
    
    db.query(sql, [first_name, last_name, phone, email, id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: `Дані користувача з ID ${id} успішно оновлено!` });
    });
});


app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    
    const sql = 'DELETE FROM users WHERE user_id = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: `Користувача з ID ${id} видалено.` });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});