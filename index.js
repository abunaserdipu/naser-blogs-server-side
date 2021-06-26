const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8tihy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("blogs"));
app.use(fileUpload());

const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

const { MongoClient } = require("mongodb");

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const blogsCollection = client.db("naser-blogs").collection("blogs");
  app.post("/addBlogs", (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const email = req.body.email;
    const description = req.body.description;
    console.log(title, email, description, file);
    blogsCollection
      .insertOne({ title, email, description, file })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
    file.mv(`${__dirname}/blogs/${file.name}`, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: "Failed to upload img" });
      }
      return res.send({ name: file.name, path: `/${file.name}` });
    });
  });
  app.get("/blogs",(req,res) => {
    blogsCollection.find({})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })
  // perform actions on the collection object
  // client.close();
});

app.listen(process.env.PORT || port);
