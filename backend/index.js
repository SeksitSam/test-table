// backend/index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let users = [
  { id: 1, name: 'John Doe', type: 'admin', code: 'A001' },
  { id: 2, name: 'Jane Smith', type: 'user', code: 'U002' },
];

// GET all users
app.get('/users', (req, res) => {
  res.json(users);
});

// POST create user
app.post('/users', (req, res) => {
  const newUser = { id: Date.now(), ...req.body };
  users.push(newUser);
  res.json(newUser);
});

// PUT update user
app.put('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  users = users.map((u) => (u.id === id ? { ...u, ...req.body } : u));
  res.json({ message: 'updated' });
});

// DELETE user
app.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  users = users.filter((u) => u.id !== id);
  res.json({ message: 'deleted' });
});

app.listen(5000, () => {
  console.log('Backend is running on http://localhost:5000');
});
