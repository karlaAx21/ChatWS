const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

// Define a simple route
app.get('/', (req, res) => {
  res.send('Welcome to the backend service');
});

// Define API routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
