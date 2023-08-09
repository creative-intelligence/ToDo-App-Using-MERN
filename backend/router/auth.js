const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");

const User = require("../model/users");

router.get("/", (req, res) => {
  res.send("MERN Todo App");
});

// User Registration
router.post("/register", async (req, res) => {
  const { name, email, phone, work, password, cpassword } = req.body;

  // Every Field is Required
  if (!name || !email || !password || !cpassword) {
    return res.status(422).json({ error: "Please fill the fields properly" });
  }

  try {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return res.status(422).json({ message: "Email already exist!" });
    } else if (password != cpassword) {
      return res.status(422).json({ Error: "Passwords do not match." });
    } else {
      const user = new User({ name, email, password, cpassword });

      const registeredUser = await user.save();
      res.status(201).json({ message: "user registered successffully" });
    }
  } catch (err) {
    console.log(err);
  }
});

// User SignIn

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please fill in the required fields" });
    }

    const userLogin = await User.findOne({ email: email });
    if (!userLogin) {
      return res.status(400).json({ error: "Invalid email credentials" });
    }

    const isMatch = await bcrypt.compare(password, userLogin.password);

    //   Generating a jwt token to authenticate and authorise user

    const token = await userLogin.generateAuthToken();
    console.log(token);

    res.cookie("jwtoken", token, {
      expires: new Date(Date.now() + 25892000000), // Set cookie expiration time (1 day in this example)
      httpOnly: true, // Ensure the cookie is only accessible via HTTP(S)
      secure: false, // Set to true if using HTTPS
    });

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password credentials" });
    }

    res.json({ message: "Signin successful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Todo Route 
router.get("/todo", authenticate, (req, res) => {
  // middleware code
  console.log("My About");
  res.send(req.rootUser);
});



// Add a new todo
router.post("/addtodo", authenticate, async (req, res) => {
  try {
    const { todo } = req.body;
    const user = req.rootUser;
    user.todos.push({ todo });
    await user.save();
    res.status(201).json({ message: "Todo added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a todo
router.put("/updatetodo/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { todo } = req.body;
    const user = req.rootUser;
    const todoIndex = user.todos.findIndex((item) => item._id.toString() === id);
    if (todoIndex !== -1) {
      user.todos[todoIndex].todo = todo;
      await user.save();
      res.json({ message: "Todo updated successfully" });
    } else {
      res.status(404).json({ error: "Todo not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a todo
router.delete("/deletetodo/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.rootUser;
    user.todos = user.todos.filter((item) => item._id.toString() !== id);
    await user.save();
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// Logout Page 

router.get("/logout",(req, res) => {
    // middleware code
    console.log("Hello from my logout Page");
    res.clearCookie('jwtoken',{path:'/'})
    res.status(200).send("User Logout");
  });

module.exports = router;
