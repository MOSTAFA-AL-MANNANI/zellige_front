const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const contact=new Schema({
    name:String,
    email:String,
    description:String,
    object:String,
    phone:String,
})

const Contact=mongoose.model('Contact',contact);
module.exports=Contact