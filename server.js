const express = require('express');
const redis = require('redis');

const app = express();
const port = 3000;

// Create and connect a Redis client
const client = redis.createClient();

client.on('error', (err) => {
    console.error('Redis error: ', err);
});

client.connect().then(() => {
    console.log('Connected to Redis');
});

// Check if Redis client is open
if (!client.isOpen) {
    console.log('Redis client is not open');
}

const fetchUserDataFromDatabase = async (id) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ id: id, name: `User ${id}` });
        }, 1000); // Simulate a 1-second delay
    });
};

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
