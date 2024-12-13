const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');  // For parsing incoming request bodies

dotenv.config();
app.use("/static", express.static("public"));
app.use(bodyParser.json());  // Middleware to parse JSON data in request bodies
app.use(express.json());  
// Define the Product schema
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  phone: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create the Product model
const Product = mongoose.model('Product', productSchema);

//  route to handle GET requests to the root ("/") path
app.get("/", (req, res) => {
  res.send("Welcome to the Products API!");  // Response to show the server is running
});

// Connection to the DB
console.log(process.env.DB_STRING);  // Check if the string is correctly imported
mongoose.connect(process.env.DB_STRING, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to db!");
  app.listen(3001, () => console.log("Server Up and running"));
}).catch(err => {
  console.error("Error connecting to the database:", err);
});

// Create a new user(post)
app.post('/products', async (req, res) => {
  const { title, description, price, phone } = req.body;
  try {
    const product = new Product({title, description, price,phone});
    await product.save();
    res.send(product);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Route to get all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();  // Fetch all products from the database
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// Route to get one products
app.get("/products/one", async (req, res) => {
  try {
    const title = req.query.title; // Get the title from the query parameter
    const products = await Product.findOne({ title: title }); 
    // Fetch product by title (ensure Adventure is the correct model)
    if (!products) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(products); // Send the found product as the response
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: 'Error fetching product' });
  }
});

//update
app.put('/products/:id', async (req, res) => {
  console.log('Request Body:', req.body);  // Log the incoming request body
  const { title, description, price ,phone} = req.body;
  const { id } = req.params;

  try {
    const products = await Product.findByIdAndUpdate(
      id, 
      { title, description, price ,phone},
      { new: true }
    );

    if (!products) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error updating product' });
  }
});

//Delete
// DELETE request to remove a product by its ID
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params; // Get the product ID from the URL parameter

  try {
    // Find and remove the product by its ID
    const products = await Product.findByIdAndDelete(id);

    // Check if product exists
    if (!products) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Return a success message
    res.status(200).json({ message: 'Product deleted successfully', products });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error deleting product' });
  }
});


