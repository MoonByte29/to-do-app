const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');
const taskRoutes = require('./routes/tasks');
const { checkReminders } = require('./services/reminderService');

const app = express();
const PORT = process.env.PORT || 8001;

app.use(cors({ origin: process.env.CORS_ORIGINS || '*' }));
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'todo_database';

mongoose.connect(`${MONGO_URL}/${DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

cron.schedule('* * * * *', () => {
  checkReminders();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});