const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const product=new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  prix: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  image: {
    data: Buffer,       // بيانات الصورة
    contentType: String // نوع الصورة (image/png, image/jpeg ...)
  }
})

const Product=mongoose.model('Product',product);
module.exports=Product