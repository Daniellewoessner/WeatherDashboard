import { Router } from 'express';
import historyService from '../historyService.js';
import weatherService from '..//weatherService.js';

const router = Router();

// Weather data route
router.post('/', async (req, res) => {
    try {
        console.log('POST request body:', req.body);  // Debug log
        const city = req.body.city;
        
        if (!city) {
            console.log('No city provided in request');
            return res.status(400).json({ error: 'City name is required' });
        }

        const weatherSvc = weatherService.createWeatherService(city);
        const weatherData = await weatherSvc.getWeatherForCity(city);
        
        if (!weatherData) {
            return res.status(404).json({ error: 'No weather data found' });
        }

        await historyService.addCity(city);
        return res.json(weatherData);
    }
    catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// History routes
router.get('/history', async (_req, res) => {
    try {
        const cities = await historyService.getCities();
        res.json(cities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

router.delete('/history/:id', async (req, res) => {
    try {
        await historyService.removeCity(req.params.id);
        res.json({ message: 'Search deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete history item' });
    }
});

export default router;
