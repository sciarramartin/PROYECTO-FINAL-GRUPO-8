// app.js
require('dotenv').config();
const express = require('express');
const { router: authRoutes } = require('./rutas/authRoutes');

const app = express();

app.use(express.json());
app.use('/auth', authRoutes);

module.exports = { app };