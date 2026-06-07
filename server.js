const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'users.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readUsers() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }

  const content = fs.readFileSync(DATA_FILE, 'utf8');
  return content ? JSON.parse(content) : [];
}

function saveUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

function isValidEmail(email) {
  return email && email.includes('@') && email.includes('.');
}

app.get('/api/status', (req, res) => {
  res.json({
    mensaje: 'Servidor funcionando correctamente',
    proyecto: 'Proyecto-Garcia-Gallardo'
  });
});

app.get('/api/users', (req, res) => {
  const users = readUsers();
  res.json(users.map(publicUser));
});

app.post('/api/users', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ mensaje: 'Nombre, correo y contraseña son obligatorios.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ mensaje: 'El correo no tiene un formato válido.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ mensaje: 'La contraseña debe tener mínimo 6 caracteres.' });
  }

  const users = readUsers();
  const emailExists = users.some(user => user.email === email);

  if (emailExists) {
    return res.status(409).json({ mensaje: 'Ya existe un usuario con ese correo.' });
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password
  };

  users.push(newUser);
  saveUsers(users);

  res.status(201).json(publicUser(newUser));
});

app.put('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ mensaje: 'Nombre y correo son obligatorios.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ mensaje: 'El correo no tiene un formato válido.' });
  }

  const users = readUsers();
  const index = users.findIndex(user => user.id === id);

  if (index === -1) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  }

  users[index].name = name;
  users[index].email = email;

  saveUsers(users);

  res.json(publicUser(users[index]));
});

app.delete('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const users = readUsers();
  const filteredUsers = users.filter(user => user.id !== id);

  if (users.length === filteredUsers.length) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  }

  saveUsers(filteredUsers);

  res.json({ mensaje: 'Usuario eliminado correctamente.' });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
