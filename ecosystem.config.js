module.exports = {
  apps : [{
    name   : "NODE-AWS-S3-DEMO",
    script : "./src/index.js",
    env_production: {
        CONNECATION_URL:"mongodb+srv://Rohit:Rohit%4099133@cluster0.womhv.mongodb.net/s3-demo",
        PORT:3000,
        JWT_SECRET:'s3-demo',
        AWS_ACCESS_KEY_ID:'AKIAWWJSA24VSBDAYVMY',
        AWS_SECRET_ACCESS_KEY:'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',
        AWS_REGION:'ap-south-1',
        AWS_BUCKET_NAME:'aws-s3-uploads'
     }
  }]
}
