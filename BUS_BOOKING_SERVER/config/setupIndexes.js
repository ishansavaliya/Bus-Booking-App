import mongoose from "mongoose";
import User from "../models/user.js";

export const setupIndexes = async () => {
  try {
    // console.log("Setting up MongoDB indexes...");

    // Get the User collection
    const collection = mongoose.connection.collection("users");

    // Drop all existing indexes except _id
    const indexes = await collection.indexes();
    for (const index of indexes) {
      if (index.name !== "_id_") {
        // console.log(`Dropping index: ${index.name}`);
        await collection.dropIndex(index.name);
      }
    }

    // Create new index with proper configuration
    // Using only $exists and $type in the partialFilterExpression
    // console.log(
    //   "Creating new email index with simplified partialFilterExpression..."
    // );
    await collection.createIndex(
      { email: 1 },
      {
        unique: true,
        background: true,
        partialFilterExpression: {
          email: { $exists: true, $type: "string" },
        },
      }
    );

    // console.log("MongoDB indexes setup complete");
  } catch (error) {
    console.error("Error setting up MongoDB indexes:", error);
  }
};

export default setupIndexes;
