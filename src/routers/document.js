const express =require('express');
const Document = require('../models/documents');
const auth=require('../middleware/auth');
const multer= require('multer');
const sharp=require('sharp');
const {s3Uploadv2}=require('./../utils/s3Service');
const router = new express.Router();

const storage= multer.memoryStorage();

const upload= multer({
    storage,
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

router.post('/document',auth,upload.single('uploaded_file'),async(req,res)=>{
    //const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
    const file=req.file;
    try {
        const dirName=`users/${req.user._id}`;
        const result = await s3Uploadv2(file,dirName);
        if(result.Location){
            const document= new Document({
                s3url:result.Location,
                title:req.body.title,
                discription:req.body.dis,
                owner:req.user._id
            });
            await document.save();
            res.status(201).send(document);
        } else {
            res.status(401).send({error:'s3 result not found'});
        }
    } catch( e ) {
        res.status(400).send(e);
    }
});

router.get('/document',auth,async(req,res)=>{
    const match={};
    const sort={};
    try {
        if(req.query.title){
            match.title = req.query.title;
        }
        if(req.query.sortBy){
            const parts=req.query.sortBy.split(':');
            sort[parts[0]]=parts[1]==='desc'?-1:1;
        }
        await req.user.populate({
            path:'documents',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        });
        res.status(200).send(req.user.documents);
    } catch (error) {
        res.status(500).send(error);
    }   
});


module.exports = router;