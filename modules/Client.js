const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const client=new Schema({
    name:String,
    email:String,
    phone:String,
    adresse:String,
    city:String,
})

const Client=mongoose.model('Client',client);
module.exports=Client