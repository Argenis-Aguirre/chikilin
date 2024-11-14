// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();



const db = mysql.createConnection({
  host: '3.133.99.212',
  user: 'admin', // Usuario MySQL por defecto en XAMPP
  password: 'Admin10$', // Contraseña MySQL por defecto en XAMPP es vacía
  database: 'mydb',
});


db.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Configura CORS para permitir peticiones desde el frontend en localhost:3000
app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware para analizar el cuerpo de la solicitud en JSON
app.use(express.json());

// Registro de usuarios
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO usuarios (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error al registrar el usuario' });
        }
        res.status(201).json({ message: 'Usuario registrado con éxito' });
      }
    );
  } catch {
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

// Iniciar sesión de usuarios
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM usuarios WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
    }
    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (isValidPassword) {
      const token = jwt.sign({ userId: user.id }, 'secreto', { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
    }
  });
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});
