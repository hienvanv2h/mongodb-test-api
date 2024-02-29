const express = require("express");

const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("./db.js");

// init app % middleware
const app = express();
const port = 3000;
// use middleware
app.use(express.json());

// db connect
let db;
connectToDb((err) => {
  // listen for requests only after successfully connected to db
  if (!err) {
    app.listen(port, () => {
      console.log(`App is running on port ${port}`);
    });
    db = getDb();
  }
});

// routes
app.get("/books", (req, res) => {
  // get current page (default first page)
  const page = Number(req.query.page) || 0;
  const booksPerPage = 5;

  let books = [];
  db.collection("books")
    .find()
    .sort({ author: 1 })
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach((book) => books.push(book)) // async action
    .then(() => {
      res
        .status(200)
        .json([books, { currentPage: page, itemsPerPage: booksPerPage }]);
    })
    .catch(() => {
      res.status(500).json({ error: "Could not fetch the documents" });
    });
});

app.get("/books/:id", (req, res) => {
  const bookId = req.params.id;
  // verify id format
  if (!ObjectId.isValid(bookId)) {
    res.status(400).json({ error: "Invalid ID" });
  } else {
    db.collection("books")
      .findOne({ _id: new ObjectId(bookId) })
      .then((doc) => {
        if (!doc) throw new Error("Book not found");
        res.status(200).json(doc);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  }
});

app.post("/books", (req, res) => {
  const book = req.body;

  db.collection("books")
    .insertOne(book)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

app.delete("/books/:id", (req, res) => {
  const bookId = req.params.id;
  if (!ObjectId.isValid(bookId)) {
    res.status(400).json({ error: "Invalid ID" });
  } else {
    db.collection("books")
      .deleteOne({ _id: new ObjectId(bookId) })
      .then((result) => {
        res.status(200).json(result); // status should be 204 if No Content
      })
      .catch((err) => {
        res.status(500).json({ error: "Failed to delete book" });
      });
  }
});

app.patch("/books/:id", (req, res) => {
  const bookId = req.params.id;

  if (!ObjectId.isValid(bookId)) {
    res.status(400).json({ error: "Invalid ID" });
  } else {
    const updates = req.body;
    db.collection("books")
      .updateOne({ _id: new ObjectId(bookId) }, { $set: updates })
      .then((result) => {
        res.status(200).json(result); // status should be 204 if No Content
      })
      .catch((err) => {
        res.status(500).json({ error: "Failed to update book" });
      });
  }
});
