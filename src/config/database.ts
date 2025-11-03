import mongoose from 'mongoose';

let dbConnected = false;
let dbConnectionAttempts = 0;
const maxRetries = 3;
const retryDelay = 5000; // 5 seconds

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/jmewallet';
  
  const attemptConnection = async (retryCount: number): Promise<void> => {
    try {
      dbConnectionAttempts++;
      await mongoose.connect(mongoUri);
      dbConnected = true;
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error: any) {
      console.error(`❌ MongoDB Connection Error (attempt ${retryCount}/${maxRetries}):`, error.message);
      
      if (retryCount < maxRetries) {
        console.log(`⏳ Retrying database connection in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return attemptConnection(retryCount + 1);
      } else {
        console.error('⚠️  Failed to connect to MongoDB after multiple attempts');
        console.log('ℹ️  Server will continue without database connection');
        console.log('ℹ️  Market endpoints will work, but user/admin features require database');
        dbConnected = false;
        // Don't exit - let server start without DB
      }
    }
  };

  await attemptConnection(1);
};

export const isDatabaseConnected = (): boolean => dbConnected;

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Disconnected');
  dbConnected = false;
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB Error:', error);
});

