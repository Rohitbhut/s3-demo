const mongoose = require("mongoose");
const documentSchema= new mongoose.Schema({
    s3url: {
        type: String,
        trim:true,
        required:true
    },
    title: {
        type: String,
        trim:true,
        required:true
    },
    discription: {
        type: String,
        trim:true,
        default: 'No discription'
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{
    timestamps:true
});
documentSchema.pre('save',async function(next){
    const document=this;
    next();
});
const Document = mongoose.model("Documents", documentSchema);
module.exports = Document;