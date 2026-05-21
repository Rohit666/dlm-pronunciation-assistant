const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
// Test Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DLM Pronunciation Assistant API Running',
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
module.exports = app;