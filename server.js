const express = require('express');
const client = require('./config/redisClient');

const app = express();
const port = 3000;

/**
 * Simulates fetching user data from a database.
 * @param {string} id - The user ID.
 * @returns {Promise<Object>} - A promise that resolves to the user data.
 */
const fetchUserDataFromDatabase = async (id) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ id: id, name: `User ${id}` });
        }, 1000); // Simulate a 1-second delay
    });
};

/**
 * Middleware to check if the requested data is in the Redis cache.
 * If found, sends the cached data as a response; otherwise, calls next().
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const checkRadisCache = async (req, res, next) => {
    const { id } = req.params;
    try {
        const storedData = await client.get(id);
        if (storedData) {
            return res.send(JSON.parse(storedData));
        } else {
            next();
        }
    } catch (err) {
        console.error('Redis get error:', err);
        res.status(500).send('Redis error');
    }
};

/**
 * Route to get user data.
 * If the data is not found in the Redis cache, it fetches from the database,
 * stores it in Redis with an expiration time, and then sends the data as a response.
 */
app.get('/user/:id', checkRadisCache, async (req, res) => {
    const { id } = req.params;

    try {
        const user = await fetchUserDataFromDatabase(id);

        await client.set(id, JSON.stringify(user), {
            EX: 10, // Expiration time in seconds
        }, (err) => {
            if (err) {
                console.error('Redis set error:', err);
            }
        });

        res.json(user);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
