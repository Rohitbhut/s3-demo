const express = require('express');
const User = require('../models/users');
const auth=require('../middleware/auth');
const router= new express.Router();
const multer= require('multer');
const sharp=require('sharp');


router.post('/users',async (req,res)=>{
    const user= new User(req.body);
    try{
        await user.save();
        const token= await user.generateAuthToken();
        res.status(201).send({user,token});
    }catch(e){
        res.status(400).send(e.message);
    }
});

//User login router
router.post('/users/login',async(req,res)=>{
    try {
        const user= await User.findByIdCredentials(req.body.email,req.body.password);
        const token= await user.generateAuthToken();
        res.send({user,token});
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/users/logout',auth,async(req,res)=>{
    try {
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token;
        });
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send(e);
    }
});

router.get('/users/me',auth,async(req,res)=>{
    res.send(req.user); 
}); 

router.get('/users',auth, async(req,res)=>{
    try{
        const users=await User.find({});
        res.status(200).send(users);
    }catch(e){
        res.status(500).send(e);
    }
});

router.get('/users/:id',async(req,res)=>{
    try{    
        const _id=req.params.id;
        const user=await User.findById(_id);
        if(!user){
            return res.status(404).send();
        }
        res.send({user,msg:'Rohit Patel\'s'});
    }catch(e){
        res.status(500).send(e);
    }
});

router.patch('/users/:id',auth,async (req,res)=>{
    const updates=Object.keys(req.body);
    const alloweUpdates=['name','email','password'];
    const isValidOperation= updates.every((update)=>alloweUpdates.includes(update));
    if(!isValidOperation){
        return res.status(400).send({error:'Invalid updates!'});
    }
    try {
        //const user=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
        const user =await User.findById(req.params.id);
        updates.forEach((update)=>user[update]=req.body[update]);
        await user.save();
        if(!user){
            return res.status(404).send({error:'User not found'});
        }
        res.send(user);

    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.delete('/users/me',auth,async(req,res)=>{
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (error) {
        res.status(500).send(error.message);
    }
})

router.delete('/users/:id',async(req,res)=>{
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user){
            res.status(404).send({error:'Invaild User'});
        }
        res.send(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//upload image file
const upload= multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,callback){
        if(!file.originalname.match(/\.(jpeg|png|gif|jpg|JPEG|JPG)$/)){
            return callback( new Error('Please uplaod jpeg|png|gif|jpg|JPEG|JPG'))
        }
        callback(undefined,true);
    }
});

router.post('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    try {
        const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
        req.user.avatar=buffer;
        const user =await req.user.save();
        res.send(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
},(error,req,res,next)=>{
    res.status(400).send({ error:error.message });
});

router.delete('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    try {
        req.user.avatar=undefined;
        const user =await req.user.save();
        res.send(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
},(error,req,res,next)=>{
    res.status(400).send({ error:error.message });
});

router.get('/users/:id/avatar',async(req,res)=>{
    try {
        const id=req.params.id;
        const user =await User.findById(id);
        if(!user || !user.avatar){
            throw new Error('No image found');
        }
        res.set('Content-Type','image/*');
        res.send(user.avatar);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports= router;