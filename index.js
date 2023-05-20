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
   

    const toyCollection = client.db("toyDB").collection("toyCar");

    // get all toys
    app.get("/toys", async(req, res)=>{
        const toys = await  toyCollection.find().toArray();
        res.send(toys);
    })


    // add a toy to database
    app.post("/addToy", async(req, res)=>{
      const toyInfo = req.body;
      const result = await toyCollection.insertOne(toyInfo);
      console.log(result);
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
    app.get("/myToys/:email", async(req, res)=>{
      const myToy = await toyCollection.find({sellerEmail : req.params.email}).toArray();
      res.send(myToy);
    })

    // toy update
    app.put("/updateToy/:id", async(req, res)=>{
      const id = req.params.id;
      const updateToyData = req.body;
      console.log(updateToyData);
      console.log(id);
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
        console.log(id);
        

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


