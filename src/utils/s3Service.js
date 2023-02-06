const aws = require('aws-sdk');
const {makeid} =require('./randomString');
exports.s3Uploadv2=async(file,dirName='upload')=>{
    aws.config.update({
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        region: process.env.AWS_REGION
    });
    const s3=new aws.S3();
    const param={
        Bucket:process.env.AWS_BUCKET_NAME,
        Key:`${dirName}/${makeid(20)}-${file.originalname}`,
        Body:file.buffer
    }
    const result = await s3.upload(param).promise();
    return result;
}