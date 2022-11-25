const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

//middle ware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mxrfp9v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try{
        const productsCategoryCollection = client.db('mobEshop').collection('productsCategory');
        const productsCollection = client.db('mobEshop').collection('productsCollection');

        app.get('/category', async(req, res) => {
            const query ={};
            const result = await productsCategoryCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/category/:name', async(req, res)=>{
            const name = req.params.name;
            console.log(name)
            const query = {name: name}
            const result = await productsCollection.find(query).toArray()
            res.send(result)
            console.log(result)
        })

    }
    finally{

    }
}
run().catch(console.log)


app.get('/', async(req, res) => {
    res.send('mobEshop portal server is running')
})

app.listen(port, () => {
    console.log(`mobEshop port running on ${port}`)
})