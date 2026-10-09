const mongoose = require('mongoose');
require('dotenv').config();


const { seedDatabase } = require('./seedData');

let mongodInstance = null;

exports.connectDB = async () => {
    let dbUrl = process.env.DATABASE_URL;

    // Check if user has provided a working URL without placeholder
    const isPlaceholder = !dbUrl || dbUrl.includes('<db_password>');

    if (!isPlaceholder) {
        try {
            console.log('Connecting to provided MongoDB...');
            await mongoose.connect(dbUrl, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000
            });
            console.log('Connected to MongoDB successfully!');
            await seedDatabase();
            return;
        } catch (err) {
            console.warn('Failed to connect to provided MongoDB:', err.message);
            console.log('Falling back to local in-memory MongoDB instance...');
        }
    } else {
        console.log('No valid MongoDB Atlas password found in DATABASE_URL.');
        console.log('Starting local embedded MongoDB (in-memory) so the project is fully operational...');
    }

    try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create({
            instance: { dbName: 'learnx' }
        });
        const memoryUri = mongodInstance.getUri();
        console.log('Local embedded MongoDB running at:', memoryUri);

        await mongoose.connect(memoryUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to local embedded MongoDB successfully!');
        await seedDatabase();
    } catch (memErr) {
        console.error('Failed to start local embedded MongoDB:', memErr.message);
    }
};

