const express = require('express');
const cors = require('cors');
const Pusher = require('pusher');
const jwt = require('jsonwebtoken'); // Add jsonwebtoken: npm install jsonwebtoken

const app = express();

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://tbsm4l.vercel.app']
    : ['http://localhost:3000', 'https://tbsm4l.vercel.app'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) callback(null, true);
        else callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

const pusher = new Pusher({
    appId: '1962876',
    key: '77ea7a0133da02d22aa5',
    secret: '0c538753c7a6705300a0',
    cluster: 'ap2',
    useTLS: true
});

// Middleware to verify Supabase JWT
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'No token provided' });
    try {
        jwt.verify(token, 'your-supabase-jwt-secret'); // Replace with actual Supabase secret
        next();
    } catch (err) {
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
        await pusher.trigger(channel, event, data);
        res.json({ success: true });
    } catch (err) {
        console.error('Pusher error:', err);
        res.status(500).json({ success: false, error: 'Failed to broadcast message' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🔥`));