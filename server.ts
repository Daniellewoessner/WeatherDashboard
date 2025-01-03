import dotenv from 'dotenv';
import express, { urlencoded, Request, Response, NextFunction } from 'express';
dotenv.config();
console.log('API Key loaded:', !!process.env.WEATHER_API_KEY);

// Import the routes
import routes from './index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Debug middleware to log all incoming requests
app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`, {
        body: req.body,
        query: req.query,
        headers: req.headers
    });
    next();
});

// Body parsing middleware
app.use(express.json())
app.use(urlencoded({extended: true}))

// Static files middleware
app.use(express.static(`./`))





// API routes
app.post('/weather', (req, res) => {
    // Your weather route logic
});


// 404 handler - must be after all other routes
app.use('*', (req: Request, res: Response) => {
    console.log('404 hit for:', req.originalUrl);
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
