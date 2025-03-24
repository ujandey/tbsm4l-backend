const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Pusher = require('pusher');

dotenv.config();

const app = express();

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
});

app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});

app.use(cors({
    origin: (origin, callback) => callback(null, true), // Allow all for now
    credentials: true
}));
app.use(express.json());

app.post('/send-message', (req, res) => {
    const { channel, event, data } = req.body;
    if (!channel || !event || !data) {
        console.error('Bad request: Missing fields', req.body);
        return res.status(400).json({ error: 'Missing required fields' });
    }
    console.log('Sending to Pusher:', { channel, event, data });
    pusher.trigger(channel, event, data, (err) => {
        if (err) {
            console.error('Pusher error:', err);
            return res.status(500).json({ error: 'Failed to send message' });
        }
        console.log('Message sent to Pusher');
        res.json({ success: true });
    });
});

app.get('/', (req, res) => {
    res.json({ status: 'Backend live' }); // Health check
});

app.use((req, res) => {
    res.status(404).json({ error: '404 Not Found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));