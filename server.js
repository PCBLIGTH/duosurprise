require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { connectDB } = require('./db');

const Product = require('./models/Product');
const Order = require('./models/Order');
const Newsletter = require('./models/Newsletter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Database Connection
connectDB();

// API Routes

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new order
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = await Order.create({
            recipientName: req.body.recipientName,
            address: req.body.address,
            city: req.body.city,
            deliveryDate: req.body.deliveryDate,
            message: req.body.message,
            productName: req.body.productName,
            customContent: req.body.customContent, // Add this line
            paymentMethod: req.body.paymentMethod,
            phoneNumber: req.body.phoneNumber,
            totalAmount: req.body.totalAmount,
            confirmationCode: req.body.confirmationCode, // Store the OTP
            status: req.body.paymentMethod === 'card' ? 'paid' : 'pending'
        });

        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Subscribe to newsletter
app.post('/api/newsletter', async (req, res) => {
    try {
        await Newsletter.create({
            email: req.body.email
        });
        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Email already subscribed' });
        }
        res.status(400).json({ message: err.message });
    }
});

// Contact Route
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        console.log(`Contact request from ${name} (${email}): ${subject}`);
        res.status(200).json({ message: 'Message sent successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin Routes
app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/admin/subscribers', async (req, res) => {
    try {
        const subscribers = await Newsletter.findAll({ order: [['subscribedAt', 'DESC']] });
        res.json(subscribers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new product with file upload support
app.post('/api/admin/products', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 8 }]), async (req, res) => {
    try {
        const mainImage = req.files['image'] ? `/uploads/${req.files['image'][0].filename}` : req.body.imageStr;

        let secondaryImages = [];
        if (req.files['images']) {
            secondaryImages = req.files['images'].map(file => `/uploads/${file.filename}`);
        }

        const finalMainImage = mainImage || req.body.imageStr;

        const newProduct = await Product.create({
            name: req.body.name,
            category: req.body.category,
            price: Number(req.body.price),
            image: finalMainImage,
            images: secondaryImages.length > 0 ? secondaryImages : [finalMainImage],
            description: req.body.description,
            tag: req.body.tag,
            featured: req.body.featured === 'true'
        });

        res.status(201).json(newProduct);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

// Delete a product
app.delete('/api/admin/products/:id', async (req, res) => {
    try {
        await Product.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Serve the frontend for any other route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
