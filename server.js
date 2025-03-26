require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Pusher = require('pusher');
const jwt = require('jsonwebtoken');

const app = express();

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://tbsm4l.vercel.app']
    : ['http://localhost:3000', 'https://tbsm4l.vercel.app'];

app.use(cors({
    origin: (origin, callback) => {
        console.log('CORS origin check:', origin);
        if (!origin) {
            console.log('No origin provided - rejecting');
            return callback(new Error('No origin provided'));
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Origin not allowed:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204
}));

app.use(express.json());

// Explicit OPTIONS handler
app.options('/send-message', (req, res) => {
    console.log('Handling OPTIONS for /send-message from origin:', req.headers.origin);
    res.set('Access-Control-Allow-Origin', allowedOrigins.includes(req.headers.origin) ? req.headers.origin : '');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).end();
});

const pusher = new Pusher({
    appId: '1962876',
    key: '77ea7a0133da02d22aa5',
    secret: '0c538753c7a6705300a0',
    cluster: 'ap2',
    useTLS: true
});

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'No token provided' });
    try {
        jwt.verify(token, process.env.JWT_SECRET || 'your-supabase-jwt-secret');
        next();
    } catch (err) {
        console.error('JWT verification failed:', err.message);
        res.status(403).json({ success: false, error: 'Invalid token' });
    }
};

app.get('/', (req, res) => res.json({ status: 'Backend live' }));

app.post('/send-message', verifyToken, async (req, res) => {
    const { channel, event, data } = req.body;
    if (!channel || !event || !data || typeof data !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid request body' });
    }
    try {
        console.log('Broadcasting:', { channel, event, data });
        await pusher.trigger(channel, event, data);
        res.json({ success: true });
    } catch (err) {
        console.error('Pusher error:', err);
        res.status(500).json({ success: false, error: 'Failed to broadcast message' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🔥`));