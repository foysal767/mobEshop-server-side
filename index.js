const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//middle ware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mxrfp9v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const productsCategoryCollection = client.db('mobEshop').collection('productsCategory');
        const productsCollection = client.db('mobEshop').collection('productsCollection');
        const usersCollection = client.db('mobEshop').collection('usersCollection')

        app.get('/category', async (req, res) => {
            const query = {};
            const result = await productsCategoryCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/category/:name', async (req, res) => {
            const name = req.params.name;
            console.log(name)
            const query = { name: name }
            const result = await productsCollection.find(query).toArray()
            res.send(result)
            console.log(result)
        })


        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' })
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

        app.get('/myproducts', async (req, res) => {
            const email = req.query.email;
            const query = { userEmail: email }
            const myproducts = await productsCollection.find(query).toArray();
            console.log(myproducts)
            res.send(myproducts)
        })

        app.get('/users/admin/:email', async(req, res)=> {
            const email = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'})
        })

        app.get('/allbuyers', async(req, res)=> {
            const query = {role:"buyer"}
            const users = await usersCollection.find(query).toArray();
            res.send(users)
        })
        app.get('/allsellers', async(req, res)=> {
            const query = {role:"seller"}
            const users = await usersCollection.find(query).toArray();
            res.send(users)
        })

        app.post('/product', async(req, res) =>{
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        })

        app.put('/myproducts/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const options = {upsert: true}
            const updatedDoc = {
                $set: {
                    advertise: "advertise"
                }
            }
            const result = await productsCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(console.log)


app.get('/', async (req, res) => {
    res.send('mobEshop portal server is running')
})

app.listen(port, () => {
    console.log(`mobEshop port running on ${port}`)
})