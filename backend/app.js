const dotenv = require("dotenv");
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')

dotenv.config({ path: "./config.env" });
require("./db/conn");

// Middleware
app.use(express.json());

// to pass cookie to authenticate.js 
app.use(cookieParser())
// Routes from auth.js file
app.use(require("./router/auth"));

const PORT = process.env.PORT;


// Routes
// app.get('/', (req, res) => {
//   res.send('MERN Todo App API');
// });

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
