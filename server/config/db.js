import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Add your MongoDB connection string to server/.env.",
    );
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || undefined,
  });

  console.log(`MongoDB connected (database: ${mongoose.connection.name})`);
}
