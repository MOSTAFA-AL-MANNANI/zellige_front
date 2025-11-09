const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const product=new Schema({
    name:String,
    description:String,
    prix:String,
    category:String,
    stock:Number,
    image:String,
})

const Product=mongoose.model('Product',product);
module.exports=Product