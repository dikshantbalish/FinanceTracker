const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const AuthRouter = require('./Routes/AuthRouter');
const ProductRouter = require('./Routes/ProductRouter');
const ExpenseRouter = require('./Routes/ExpenseRouter');
const FinanceRouter = require('./Routes/FinanceRouter');
const ensureAuthenticated = require('./Middlewares/Auth');
const { receiveForwardedEmail } = require('./Controllers/FinanceController');
require('./Models/db');

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Middlewares
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(cors());

// API routes
app.use('/auth', AuthRouter);
app.use('/products', ProductRouter);
app.post('/finance/inbox/webhook', receiveForwardedEmail);
app.use('/expenses', ensureAuthenticated, ExpenseRouter);
app.use('/finance', ensureAuthenticated, FinanceRouter);

// Health check route
app.get('/ping', (req, res) => {
    res.send('PONG');
});

// Default root route
app.get('/', (req, res) => {
    res.send('API is working 🚀');
});

// ---- Serve React frontend (only when deployed) ----
const frontendPath = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start server
const server = app.listen(PORT, HOST, () => {
    console.log(`✅ Server is running on http://${HOST}:${PORT}`);
});

server.on('error', (error) => {
    if (error?.code === 'EADDRINUSE') {
        console.error(`Server failed to start: port ${PORT} is already in use. Stop the existing process or change PORT in backend/.env.`);
    } else if (error?.code === 'EPERM') {
        console.error(`Server failed to start: permission denied while binding to ${HOST}:${PORT}. Try HOST=127.0.0.1 or use a different PORT in backend/.env.`);
    } else {
        console.error('Server failed to start:', error);
    }

    process.exit(1);
});
