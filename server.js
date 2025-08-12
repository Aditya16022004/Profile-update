const express = require("express");
const multer = require("multer");
const path = require("path");
const { MongoClient } = require("mongodb");
const fs = require("fs");

// Load environment variables from config.env if it exists
if (fs.existsSync('./config.env')) {
    const envConfig = fs.readFileSync('./config.env', 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && !process.env[key]) {
            process.env[key] = value.trim();
        }
    });
}

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection configuration
const MONGO_URL = process.env.MONGO_URL || "mongodb://Aditya:password@localhost:27017/";
const DB_NAME = process.env.DB_NAME || "user-account";
const COLLECTION_NAME = process.env.COLLECTION_NAME || "user-details";

let db;
let mongoClient;

// Connect to MongoDB with retry logic
async function connectToMongo() {
    const maxRetries = 5;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            console.log(`Attempting to connect to MongoDB... (Attempt ${retryCount + 1}/${maxRetries})`);
            const connectionUrl = `${MONGO_URL}${DB_NAME}?authSource=admin`;
            console.log("Connection URL:", connectionUrl);
            
            mongoClient = new MongoClient(connectionUrl, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            });
            
            await mongoClient.connect();
            db = mongoClient.db(DB_NAME);
            
            // Test the connection
            await db.admin().ping();
            console.log("Connected to MongoDB successfully!");
            console.log("Database:", DB_NAME);
            console.log("Collection:", COLLECTION_NAME);
            
            // Test the connection by listing collections
            const collections = await db.listCollections().toArray();
            console.log("Available collections:", collections.map(c => c.name));
            
            // Ensure the collection exists (create if it doesn't)
            try {
                await db.createCollection(COLLECTION_NAME);
                console.log(`Collection '${COLLECTION_NAME}' created or already exists`);
            } catch (collectionError) {
                if (collectionError.code === 48) { // Collection already exists
                    console.log(`Collection '${COLLECTION_NAME}' already exists`);
                } else {
                    console.log(`Collection '${COLLECTION_NAME}' creation note:`, collectionError.message);
                }
            }
            
            return; // Success, exit the retry loop
            
        } catch (error) {
            retryCount++;
            console.error(`MongoDB connection attempt ${retryCount} failed:`, error.message);
            
            if (retryCount < maxRetries) {
                console.log(`Retrying in 5 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
                console.error("Failed to connect to MongoDB after all retry attempts");
                console.error("Please check your MongoDB container is running and credentials are correct");
            }
        }
    }
}

// Initialize MongoDB connection
connectToMongo();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage for uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Middleware
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

app.post("/save-profile", upload.single("profileImage"), async (req, res) => {
    try {
        console.log("=== Profile Save Request Received ===");
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);
        
        const { name, email, interests } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        // Create user document
        const userData = {
            name: name,
            email: email,
            interests: interests,
            profileImage: imagePath,
            createdAt: new Date()
        };

        // Insert into MongoDB
        if (db) {
            const collection = db.collection(COLLECTION_NAME);
            const result = await collection.insertOne(userData);
            console.log("User data saved to MongoDB successfully!");
            console.log("Database:", DB_NAME);
            console.log("Collection:", COLLECTION_NAME);
            console.log("Document ID:", result.insertedId);
            console.log("Data saved:", userData);
        } else {
            console.log("MongoDB not connected, skipping database save");
        }

        res.send(`
            <h1>Profile Saved Successfully!</h1>
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Interests:</b> ${interests}</p>
            ${imagePath ? `<img src="${imagePath}" style="max-width:200px;">` : ""}
            <br><br>
            <p><b>Status:</b> ${db ? "Saved to MongoDB" : "MongoDB not connected"}</p>
            <br><br>
            <a href="/">Edit Profile</a>
        `);
    } catch (error) {
        console.error("Error saving profile:", error);
        res.status(500).send(`
            <h1>Error Saving Profile</h1>
            <p>An error occurred while saving your profile. Please try again.</p>
            <br><br>
            <a href="/">Go Back</a>
        `);
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    if (mongoClient) {
        await mongoClient.close();
        console.log('MongoDB connection closed.');
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    if (mongoClient) {
        await mongoClient.close();
        console.log('MongoDB connection closed.');
    }
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
