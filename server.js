const express = require('express');
const cors = require('cors');
const Pusher = require('pusher');

const app = express();

// Configure CORS to allow requests from your Vercel frontend
app.use(cors({
    origin: 'https://tbsm4l.vercel.app',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize Pusher
const pusher = new Pusher({
    appId: '1962876', // Replace with your Pusher appId
    key: '77ea7a0133da02d22aa5',      // Replace with your Pusher key
    secret: '0c538753c7a6705300a0', // Replace with your Pusher secret
    cluster: 'ap2',
    useTLS: true
});

// Test route to confirm backend is live
app.get('/', (req, res) => {
    res.json({ status: 'Backend live' });
});

// Route to handle sending messages via Pusher
app.post('/send-message', async (req, res) => {
    const { channel, event, data } = req.body;
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    console.log(`Sending to Pusher: ${JSON.stringify({ channel, event, data })}`);

    try {
        await pusher.trigger(channel, event, data);
        res.json({ success: true });
    } catch (err) {
        console.error('Pusher error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🔥`);
});