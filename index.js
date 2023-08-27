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
      const book=req.body;
      const filter={_id:ObjectId(id)}
      const options={upsert:true};
      const updateDoc={
        $set:book
      }
      const result = await bookCollection.updateOne(filter,updateDoc,options);
      res.send(result);
    });

    app.delete('/book/:id', async (req, res) => {
      const id = req.params.id;
      const result = await bookCollection.deleteOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.post('/comment/:id', async (req, res) => {
      const bookId = req.params.id;
      const comment = req.body.comment;

      const result = await bookCollection.updateOne(
        { _id: ObjectId(bookId) },
        { $push: { comments: comment } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error('book not found or comment not added');
        res.json({ error: 'book not found or comment not added' });
        return;
      }

      console.log('Comment added successfully');
      res.json({ message: 'Comment added successfully' });
    });

    app.get('/comment/:id', async (req, res) => {
      const bookId = req.params.id;

      const result = await bookCollection.findOne(
        { _id: ObjectId(bookId) },
        { projection: { _id: 0, comments: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'book not found' });
      }
    });

    app.post('/user', async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;

      const result = await userCollection.findOne({ email });

      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });
  } finally {
  }
};

bootstrap().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Book Mania Server Is Running');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
