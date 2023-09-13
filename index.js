require("dotenv").config();
const PORT = process.env.PORT || 3000;
const express = require("express");
const server = express();
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const apiRouter = require("./api");
const { client } = require("./db");

// Middleware
server.use(morgan("dev"));
server.use(cors());
server.use(bodyParser.json());

// API Router
server.use("/api", apiRouter);

// Custom error handling
server.use((req, res, next) => {
  res.status(404).send("404: Page not found");
});

server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("500: Internal Server Error");
});

// Start the server
server.listen(PORT, async () => {
  try {
    await client.connect();
    console.log("Connected to the database");
    console.log("The server is up on port", PORT);
  } catch (err) {
    console.error("Failed to connect to the database:", err);
  }
});
