const express=require('express');
require('./db/mongoose');
const userRouter=require('../src/routers/user');
const documentRouter=require('../src/routers/document');
const app=express();
const port=process.env.PORT || 3000;
app.use(express.json());

app.use('/home',(req,res)=>{
    res.json({msg:'Hello I am Rohit Bhut'});
});

//User Routing App
app.use(userRouter);
// Task Routing App
app.use(documentRouter);

//Server running on this port
app.listen(port,()=>{
    console.log('Server is up on port '+port);
});