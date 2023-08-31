require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.khoup.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const bootstrap = async () => {
  try {
    const db = client.db('Books-Mania');
    const bookCollection = db.collection('books');
    const wishlistCollection = db.collection('wishlist');

    app.get('/books', async (req, res) => {
      const cursor = bookCollection.find({});
      const book = await cursor.sort({ $natural: -1 }).toArray();
      res.send({ status: true, data: book });
    });

    app.post('/book', async (req, res) => {
      const book = req.body;
      const result = await bookCollection.insertOne(book);
      res.send(result);
    });

    app.get('/book/:id', async (req, res) => {
      const id = req.params.id;
      const result = await bookCollection.findOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.put('/book/:id', async (req, res) => {
      const id = req.params.id;
      const book = req.body;
      const filter = { _id: ObjectId(id) }
      const options = { upsert: true };
      const updateDoc = {
        $set: book
      }
      const result = await bookCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.delete('/book/:id', async (req, res) => {
      const id = req.params.id;
      const result = await bookCollection.deleteOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.post('/wishlist', async (req, res) => {
      const wishlist = req.body;
      const result = await wishlistCollection.insertOne(wishlist);
      res.send(result);
    });

    app.get('/wishlist/:id', async (req, res) => {
      const id = req.params.id;
      const result = await wishlistCollection.findOne({ _id: ObjectId(id) });
      res.send(result);
    });

    app.put('/wishlist/:id', async (req, res) => {
      const id = req.params.id;
      const wishlist = req.body;
      const filter = { _id: ObjectId(id) }
      const options = { upsert: true };
      const updateDoc = {
        $set: wishlist
      }
      const result = await wishlistCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.delete('/wishlist/:id', async (req, res) => {
      const id = req.params.id;
      const result = await wishlistCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });

    app.post('/review/:id', async (req, res) => {
      const bookId = req.params.id;
      const review = req.body.review;
      const reviewdBy = req.body.reviewdBy;
      const result = await bookCollection.updateOne({ _id: ObjectId(bookId) }, { $push: { reviews: {review, reviewdBy} } }
      );
      res.send(result);
    });



  } finally {
  }
};

bootstrap().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Book Mania Server Is Running');
});

app.listen(port, () => {
  console.log(`Book Mania app listening on port ${port}`);
});
