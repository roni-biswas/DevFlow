import mongoose, { Mongoose } from "mongoose";

/**
 * We expect the MongoDB connection string to be defined
 * in the environment variables.
 */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "❌ Please define the MONGODB_URI environment variable in .env.local"
  );
}

/**
 * Global cache type definition.
 * This allows us to persist the connection across hot reloads
 * in development without creating multiple connections.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Extend the NodeJS global object to store the cached connection.
 * This prevents TypeScript errors and avoids using `any`.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

/**
 * Initialize the cached connection if it doesn't exist.
 */
const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

global.mongoose = cached;

/**
 * Establishes a connection to MongoDB using Mongoose.
 * The connection is cached to avoid re-connecting on every request.
 */
async function connectMongoDB(): Promise<Mongoose> {
  // If we already have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is not in progress, create one
  if (!cached.promise) {
    const options = {
      bufferCommands: false, // Disable mongoose buffering for serverless
    };

    // create a new connection promise
    cached.promise = mongoose
      .connect(MONGODB_URI!, options)
      .then((mongoose) => {
        return mongoose;
      });
  }

  try {
    // Await the connection and store it
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectMongoDB;
