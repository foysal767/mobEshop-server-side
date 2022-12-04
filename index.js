const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//middle ware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mxrfp9v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send("unauthorized access")
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if(err) {
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next()
    })
}

async function run() {
    try {
        const productsCategoryCollection = client.db('mobEshop').collection('productsCategory');
        const productsCollection = client.db('mobEshop').collection('productsCollection');
        const usersCollection = client.db('mobEshop').collection('usersCollection')
        const bookingsCollection = client.db('mobEshop').collection('bookings')
        const reportedCollection = client.db('mobEshop').collection('reportedProducts')

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        })

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

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' })
        })

        app.get('/seller/verified/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isVerified: user?.status === 'verified' })
        })

        app.get('/allbuyers', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden access'})
            }
            const isAdminQuery = {email: decodedEmail}
            const userIsAdmin = await usersCollection.findOne(isAdminQuery)
            if(userIsAdmin.role !== 'admin'){
                return res.status(403).send({message: 'forbidden access'})
            }
            const query = { role: "buyer" }
            const users = await usersCollection.find(query).toArray();
            res.send(users)
        })

        app.get('/allsellers', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if(email !== decodedEmail){
                return req.status(403).send({message: 'forbidden access'})
            }
            const isAdminQuery = {email: decodedEmail}
            const userIsAdmin = await usersCollection.findOne(isAdminQuery)
            if(userIsAdmin.role !== 'admin'){
                return res.status(403).send({message: 'forbidden access'})
            }
            const query = { role: "seller" }
            const users = await usersCollection.find(query).toArray();
            res.send(users)
        })

        app.get('/bookings', verifyJWT,  async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if(email !== decodedEmail){
                return req.status(403).send({message: 'forbidden accesss'})
            }
            const query = { buyerEmail: email }
            const bookingProducts = await bookingsCollection.find(query).toArray();
            res.send(bookingProducts)
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking)
            res.send(result)
        })

        app.get('/advertise', async (req, res) => {
            const query = { advertise: 'advertise' }
            const products = await productsCollection.find(query).toArray();
            res.send(products)
        })

        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        })

        app.put('/myproducts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    advertise: "advertise"
                }
            }
            const result = await productsCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        app.put('/allsellers/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    status: 'verified'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await bookingsCollection.deleteOne(query)
            res.send(result)
        })

        // app.get('/reported/:id', async(req, res)=> {
        //     const id = req.params.id;
        //     const query = {id: id}
        //     const result = await reportedCollection.find(query).toArray()
        //     console.log(result)
        //     res.send(result)
        // })

        app.get('/reported', async (req, res) => {
            const query = {}
            const result = await reportedCollection.find(query).toArray();
            res.send(result)
        })

        app.delete('/reported/:id', async (req, res) => {
            const id = req.params.id;
            const query = { id: id }
            const result = await reportedCollection.deleteOne(query)
            res.send(result)
        })

        app.post('/reported', async (req, res) => {
            const product = req.body;
            const query = {
                productName: product.productName,
                buyerEmail: product.buyerEmail,
                img: product.img
            }
            const alreadyReported = await reportedCollection.find(query).toArray()
            if (alreadyReported.length) {
                const message = `You already reported ${product.productName}`
                return res.send({ acknowledged: false, message })
            }
            const result = await reportedCollection.insertOne(product)
            res.send(result)
        })

        app.delete('/allbuyers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })

        app.delete('/allsellers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })

        app.delete('/myproducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
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