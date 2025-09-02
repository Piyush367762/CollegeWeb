// backend.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In-memory data store for items (simulates a database)
const items = [];

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Append the current timestamp to the file name to avoid collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// API endpoint to handle item submissions
app.post('/submit', upload.array('images', 5), (req, res) => {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'Please upload at least one image.' });
    }

    // Extract form data from req.body and file paths from req.files
    const newItem = {
        id: items.length + 1,
        itemName: req.body['item-name'],
        description: req.body.description,
        category: req.body.category,
        condition: req.body.condition,
        price: parseFloat(req.body.price),
        imagePaths: req.files.map(file => file.path),
        postedAt: new Date()
    };
    
    // Add the new item to our in-memory store
    items.push(newItem);

    console.log('New item posted:', newItem);
    
    // Respond with a success message
    res.status(201).json({ 
        success: true, 
        message: 'Item posted successfully!', 
        item: newItem 
    });
});

// API endpoint to get all posted items
app.get('/items', (req, res) => {
    res.status(200).json({ success: true, items: items });
});

// Start the server
app.listen(PORT, () => {
  console.log(Server is running on http://localhost:${PORT});
});
