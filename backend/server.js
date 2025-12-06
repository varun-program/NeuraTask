// import modules
const exprees = require('express');
const cors = require('cors');
const dotenv = require('dotenv')
const authRoutes = require('./routes/authRoutes')


//doteenv
dotenv.config();

//db import
const connectDB = require('./config/db')

//express app
const app= exprees();
app.use(cors())
app.use(exprees.json)

app.use('/api/auth',authRoutes)

// connect to database
connectDB();

//router

app.get('/',(req,res)=>{

    res.send("dai neura is backend got is pluse buddy....")


})

//server listen

const port = process.env.PORT || 5000; //|| or gate

app.listen(port,()=>{

    console.log("neura is backend server is running at port:",port);
})
