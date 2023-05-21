const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2ev6cf0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
   client.connect();

    const toyCollection = client.db("toyDB").collection("toyCar");

    const indexKeys = {toyName: 1}
    const indexOptions = {name: "toyName"}
    const result = await toyCollection.createIndex(indexKeys, indexOptions);
    



    // get all toys
    app.get("/toys", async(req, res)=>{
        const toys = await  toyCollection.find().limit(20).toArray();
        res.send(toys);
    })

    // get toy by category
    app.get("/toyCategory/:category", async(req, res)=>{
      const subCategory = req.params.category;
      const result = await toyCollection.find({category: subCategory }).toArray()
      res.send(result);
    })

      // single toy details using id
      app.get("/toy/:id", async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await toyCollection.findOne(query);
        res.send(result);
      })

     // toy added by email
     app.get("/myToys", async(req, res)=>{
      let query = {sellerEmail: req.query.email}
      const myToy = await toyCollection.find(query).sort({price: Number(req.query.sort)}).toArray();
      res.send(myToy);
    })

    // search by name
    app.get("/searchToys/:text", async(req, res)=>{
      const text = req.params.text;
      console.log(text);
      const result = await toyCollection.find({
        $or:[
          {toyName : {$regex: text, $options: "i"}}
        ]
      }).toArray()

      res.send(result);
    })

    // add a toy to database
    app.post("/addToy", async(req, res)=>{
      const toyInfo = req.body;
      const result = await toyCollection.insertOne(toyInfo);
      res.send(result);
    })

   

   

    // toy update
    app.put("/updateToy/:id", async(req, res)=>{
      const id = req.params.id;
      const updateToyData = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          price: updateToyData.price,
          quantity: updateToyData.quantity,
          description: updateToyData.description
        },
      };

      const result = await toyCollection.updateOne(filter, updateDoc, options);
      res.send(result);

    })

    // delete toy data
    app.delete("/deleteToy/:id", async(req, res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await toyCollection.deleteOne(query);
        res.send(result);
    })

    








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } 
  finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res)=>{
    res.send("Toy server is running");
})

app.listen(port, ()=>{
    console.log(`Server is running on port: ${port}`);
})


