const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const order=new Schema({
    clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Client", 
    required: true 
  }, 
  products: [
    {
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product", 
        required: true 
      },
      quantity: { type: Number, required: true, min: 1 }, 
    },
  ],
  totalPrice: { type: Number, required: true }, 
  status: { 
    type: String, 
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"], 
    default: "pending" 
  }, // حالة الطلب
  createdAt: { type: Date, default: Date.now },
})

const Order=mongoose.model('Order',order);
module.exports=Order