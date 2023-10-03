import express from "express";
import mongoose from "mongoose";

const app = express();
const port = 4000;
const uri =
  "mongodb+srv://abuzaid:abuzaid@mycluster.ynwwj7t.mongodb.net/?retryWrites=true&w=majority";

async function connect() {
  try {
     await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to mongo", error);
  }
}

// Connecting to the database
connect();

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
