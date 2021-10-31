const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// user: touristDb
// password: vaeWivrytEpr3q7K

// my db
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fltdt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("touristDb");
    const destinationInfo = database.collection("Destinations");
    const orderCollection = database.collection("orders");

    // GET API
    app.get("/allDestination", async (req, res) => {
      const cursor = destinationInfo.find({});
      const result = await cursor.toArray();
      res.send(result);

      // console.log(result);
    });

    // Get a specific destination
    app.get("/allDestination/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const destination = await destinationInfo.findOne(query);
      res.send(destination);

      // console.log('get query', query);
      // console.log("load destination with id: ", id);
    });

    // POST API
    app.post("/addDestination", async (req, res) => {
      const newDestination = req.body;
      const result = await destinationInfo.insertOne(newDestination);
      res.json(result);

      //  console.log("got new Destinations", req.body);
      //  console.log("added Destinations", result);
    });

    // Orders POST API
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);

      // console.log(order);
      // console.log(result);
    });

    // get all order
    app.get("/allOrders", async (req, res) => {
      const cursor = orderCollection.find({});
      const result = await cursor.toArray();
      res.send(result);

      console.log(result);
    });

    // get order by specific email address
    app.get("/myOrders/:email", async (req, res) => {
      const query = { email: req.params.email };
      const result = await orderCollection.find(query).toArray();
      res.send(result);

      // console.log(req.params);
      // console.log(result);
    });

    // DELETE API
    app.delete("/myOrders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);

      // console.log("deleting order with id ", result);
    });

    // Update status
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body;

      // console.log('body', req.body);
      // console.log('id', id);

      const filter = { _id: ObjectId(id) };

      const updateOrderStatus = {
        $set: {
          status: updatedStatus.status,
        },
      };

      const result = await orderCollection.updateOne(filter, updateOrderStatus);
      res.json(result);
    });


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("my tourist server is running");
});

app.listen(port, () => {
  console.log("Server running at port", port);
});
