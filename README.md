# Express with Redis Caching Example

This repository contains an example of an Express server integrated with Redis for caching database query results. The example demonstrates how to use Redis as a cache layer to improve the performance of data retrieval in a Node.js application.

## Prerequisites

- Node.js installed
- Redis server installed and running

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kahnu044/express-with-redis
   cd express-with-redis
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

## Running the Server

1. Start the Express server::
   ```bash
   nodemon server.js
   ```
2. The server will be running on http://localhost:3000.

## API Endpoints

### GET /user/

#### Fetches user data for the specified id.

- Request Parameters: `id (string): The ID of the user.`
- Example: `http://localhost:3000/user/1`

#### Response

- f the data is found in the Redis cache, it returns the cached data.
- If the data is not found in the Redis cache, it fetches the data from the "database", stores it in the Redis cache with an expiration time of 10 seconds, and returns the data.

## Code Overview

### 1. Redis Client Initialization:
```javascript
const client = redis.createClient();
client.on("error", (err) => console.error("Redis error: ", err));
client.connect().then(() => console.log("Connected to Redis"));
```

### 2. fetchUserDataFromDatabase:
A function that simulates fetching user data from a database with a 1-second delay.

```javascript
const fetchUserDataFromDatabase = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: id, name: `User ${id}` });
    }, 1000);
  });
};
```

### 3. checkRadisCache:
Middleware that checks if the requested data is in the Redis cache..

```javascript
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
    console.error("Redis get error:", err);
    res.status(500).send("Redis error");
  }
};
```

### 4. Route - GET /user/:id:
Route that handles fetching user data, either from the cache or the "database".

```javascript
app.get("/user/:id", checkRadisCache, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await fetchUserDataFromDatabase(id);

    await client.set(
      id,
      JSON.stringify(user),
      {
        EX: 10, // Expiration time in seconds
      },
      (err) => {
        if (err) {
          console.error("Redis set error:", err);
        }
      }
    );

    res.json(user);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data");
  }
});
```


## Author

[Kahnu Charan Swain](https://github.com/kahnu044)