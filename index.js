// Use the dotenv package, to create environment variables

// Create a constant variable, PORT, based on what's in process.env.PORT or fallback to 3000

// Import express, and create a server

// Require morgan and body-parser middleware

// Have the server use morgan with setting 'dev'

// Have the server use bodyParser.json()

// Have the server use your api router with prefix '/api'

// Import the client from your db/index.js

// Create custom 404, send an error message in an object
// { error: "route not found" }

// Create custom error handling that returns the error
// as an object, with status code of 500
// { error: "the error message" }


// Start the server listening on port PORT
// On success, connect to the database
