const express = require('express');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'data', 'users.json');
const LOGS_FILE = path.join(__dirname, 'data', 'logs.json');

app.use(cors());
app.use(express.json());

app.use(session({
  secret: 'clave-desarrollo-proyecto',
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, 'public')));

// =========================
// FUNCIONES DE USUARIOS
// =========================

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

// =========================
// FUNCIONES DE LOGS
// =========================

function readLogs() {
  if (!fs.existsSync(LOGS_FILE)) {
    return [];
  }

  const content = fs.readFileSync(LOGS_FILE, 'utf8');
  return content ? JSON.parse(content) : [];
}

function saveLogs(logs) {
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
}

function addLog(user, action, ip) {
  const logs = readLogs();

  const newLog = {
    id: Date.now(),
    user: user || 'desconocido',
    date: new Date().toISOString(),
    ip: ip || 'sin ip',
    action: action
  };

  logs.push(newLog);
  saveLogs(logs);

  return newLog;
}

// =========================
// ENDPOINT DE ESTADO
// =========================

app.get('/api/status', (req, res) => {
  res.json({
    mensaje: 'Servidor funcionando correctamente',
    proyecto: 'Proyecto-Garcia-Gallardo'
  });
});

// =========================
// ENDPOINTS DE SESIÓN
// =========================

app.get('/api/session', (req, res) => {
  if (!req.session.user) {
    return res.json({
      authenticated: false,
      user: null
    });
  }

  res.json({
    authenticated: true,
    user: req.session.user
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();

  const user = users.find(item => item.email === email && item.password === password);

  if (!user) {
    addLog(email || 'desconocido', 'login fallido', req.ip);

    return res.status(401).json({
      mensaje: 'Correo o contraseña incorrectos.'
    });
  }

  req.session.user = publicUser(user);

  addLog(user.email, 'login', req.ip);

  res.json({
    mensaje: 'Inicio de sesión correcto.',
    user: req.session.user
  });
});

app.post('/api/logout', (req, res) => {
  const sessionUser = req.session.user ? req.session.user.email : 'desconocido';

  addLog(sessionUser, 'logout', req.ip);

  req.session.destroy(() => {
    res.json({
      mensaje: 'Sesión cerrada correctamente.'
    });
  });
});

// =========================
// ENDPOINTS CRUD DE USUARIOS
// =========================

app.get('/api/users', (req, res) => {
  const users = readUsers();
  res.json(users.map(publicUser));
});

app.post('/api/users', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      mensaje: 'Nombre, correo y contraseña son obligatorios.'
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      mensaje: 'El correo no tiene un formato válido.'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      mensaje: 'La contraseña debe tener mínimo 6 caracteres.'
    });
  }

  const users = readUsers();
  const emailExists = users.some(user => user.email === email);

  if (emailExists) {
    return res.status(409).json({
      mensaje: 'Ya existe un usuario con ese correo.'
    });
  }

  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password
  };

  users.push(newUser);
  saveUsers(users);

  addLog(email, 'create user', req.ip);

  res.status(201).json(publicUser(newUser));
});

app.put('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      mensaje: 'Nombre y correo son obligatorios.'
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      mensaje: 'El correo no tiene un formato válido.'
    });
  }

  const users = readUsers();
  const index = users.findIndex(user => user.id === id);

  if (index === -1) {
    return res.status(404).json({
      mensaje: 'Usuario no encontrado.'
    });
  }

  users[index].name = name;
  users[index].email = email;

  saveUsers(users);

  addLog(email, 'update user', req.ip);

  res.json(publicUser(users[index]));
});

app.delete('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const users = readUsers();
  const userDeleted = users.find(user => user.id === id);
  const filteredUsers = users.filter(user => user.id !== id);

  if (users.length === filteredUsers.length) {
    return res.status(404).json({
      mensaje: 'Usuario no encontrado.'
    });
  }

  saveUsers(filteredUsers);

  addLog(userDeleted ? userDeleted.email : 'desconocido', 'delete user', req.ip);

  res.json({
    mensaje: 'Usuario eliminado correctamente.'
  });
});

// =========================
// API REST DE LOGS DE ACCESO
// =========================

app.get('/api/logs', (req, res) => {
  const logs = readLogs();
  res.json(logs);
});

app.post('/api/logs', (req, res) => {
  const { user, action } = req.body;

  if (!user || !action) {
    return res.status(400).json({
      mensaje: 'Usuario y acción son obligatorios.'
    });
  }

  const log = addLog(user, action, req.ip);

  res.status(201).json({
    mensaje: 'Log registrado correctamente.',
    log: log
  });
});

// =========================
// INICIAR SERVIDOR
// =========================

app.listen(PORT, () => {
  console.log('Servidor iniciado en http://localhost:' + PORT);
});