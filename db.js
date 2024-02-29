// This file contains database connnect configurations
const { MongoClient } = require("mongodb");
require("dotenv").config();

let dbConnection;
const uri = `mongodb+srv://akairin:${process.env.MONGODB_PASSWORD}@cluster0.50qnrp6.mongodb.net/bookstore?retryWrites=true&w=majority&appName=Cluster0`;

module.exports = {
  // function that establish connection to database
  connectToDb: (callback) => {
    MongoClient.connect(uri)
      .then((client) => {
        dbConnection = client.db();
        return callback();
      })
      .catch((err) => {
        console.log(err);
        return callback(err);
      });
  },
  // function to get the connection to that database
  getDb: () => dbConnection,
};
