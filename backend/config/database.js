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
        const path = require('path');
        const fs = require('fs');
        const { execSync } = require('child_process');
        const { MongoMemoryServer } = require('mongodb-memory-server');

        const localDataDir = path.join(__dirname, '../../.local-mongo-data');
        if (!fs.existsSync(localDataDir)) {
            fs.mkdirSync(localDataDir, { recursive: true });
        }

        // Clean up orphaned mongod process or stale lock file from previous crash
        try {
            execSync('pkill -f "mongodb-memory-server/mongod" || true', { stdio: 'ignore' });
            const lockFile = path.join(localDataDir, 'mongod.lock');
            if (fs.existsSync(lockFile)) {
                fs.unlinkSync(lockFile);
            }
        } catch (cleanErr) {
            // ignore
        }

        mongodInstance = await MongoMemoryServer.create({
            instance: {
                dbName: 'learnx',
                dbPath: localDataDir,
                storageEngine: 'wiredTiger'
            }
        });
        let memoryUri = mongodInstance.getUri();
        if (!memoryUri.includes('/learnx')) {
            memoryUri = memoryUri.endsWith('/') ? memoryUri + 'learnx' : memoryUri + '/learnx';
        }
        console.log('Local embedded MongoDB running at:', memoryUri);

        await mongoose.connect(memoryUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to local embedded MongoDB successfully (Persisted to disk)!');

        // Graceful exit listeners
        const cleanExit = async () => {
            if (mongodInstance) {
                try {
                    await mongodInstance.stop();
                } catch (e) {}
            }
        };
        process.once('SIGUSR2', async () => {
            await cleanExit();
            process.kill(process.pid, 'SIGUSR2');
        });
        process.once('SIGINT', async () => {
            await cleanExit();
            process.exit(0);
        });
        process.once('SIGTERM', async () => {
            await cleanExit();
            process.exit(0);
        });

        await seedDatabase();
    } catch (memErr) {
        console.error('Failed to start local embedded MongoDB:', memErr.message);
    }
};

