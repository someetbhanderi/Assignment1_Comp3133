const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const schema = require("./schemas/schema");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// GraphQL API Endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true, // Enables GraphiQL UI for testing
  })
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
