const redis = require('redis');

// Create and configure a Redis client
const client = redis.createClient();

client.on('error', (err) => {
    console.error('Redis error: ', err);
});

client.connect().then(() => {
    console.log('Connected to Redis');
});

module.exports = client;
