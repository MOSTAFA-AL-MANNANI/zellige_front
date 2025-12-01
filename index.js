const express=require('express');
const mongoose=require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const JWT_SECRET = "secret_key_for_admin_token";
const app=express();
app.use(cors());
app.use(express.json());
mongoose.connect('mongodb+srv://rania:admin@cluster0.k5bwvsw.mongodb.net/eco')
.then(()=>{
    console.log('Connecte to Mongo Db')
}).catch((err)=>{
    console.log('Errer conncte to MonngoDb')
})


const Admin = require('./modules/Admin');
const Client = require('./modules/Client');
const Order = require('./modules/Order');
const Product = require('./modules/Product');
const Contact = require('./modules/Contact');







// ------------------------------
// 🔹 Multer - stockage في الذاكرة
// ------------------------------
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // الحد الأقصى 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const ext = file.originalname.toLowerCase();
    if (allowedTypes.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("فقط الصور JPG, JPEG, PNG مسموحة"));
    }
  },
});

// Afficher tous les produits avec image encodée en base64
app.get("/product", async (req, res) => {
  try {
    const products = await Product.find();
    const formattedProducts = products.map((p) => ({
      _id: p._id,
      name: p.name,
      description: p.description,
      prix: p.prix,
      stock: p.stock,
      category: p.category,
      image: p.image && p.image.data
        ? `data:${p.image.contentType};base64,${p.image.data.toString("base64")}`
        : null,
    }));
    res.status(200).json(formattedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur fetching produits" });
  }
});

// Afficher un produit par ID
app.get('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "❌ Produit non trouvé" });

    const formattedProduct = {
      _id: product._id,
      name: product.name,
      description: product.description,
      prix: product.prix,
      stock: product.stock,
      category: product.category,
      image: product.image && product.image.data
        ? `data:${product.image.contentType};base64,${product.image.data.toString('base64')}`
        : null,
    };

    res.status(200).json(formattedProduct);
  } catch (err) {
    console.error('❌ Error fetching product:', err);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Supprimer un produit
app.delete('/product/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "❌ Produit non trouvé" });
    res.status(200).json({ message: "Produit supprimé", product: deleted });
  } catch (err) {
    console.error('❌ Error deleting product:', err);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Ajouter un produit avec image
app.post("/product", upload.single("image"), async (req, res) => {
  try {
    const { name, description, prix, stock, category } = req.body;
    const newProduct = new Product({
      name,
      description,
      prix,
      stock,
      category,
      image: req.file ? { data: req.file.buffer, contentType: req.file.mimetype } : null,
    });

    await newProduct.save();
    res.status(201).json({ message: "Produit ajouté", product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Modifier un produit
app.put('/product/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, prix, stock, category } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "❌ Produit non trouvé" });

    // Mise à jour des champs
    product.name = name || product.name;
    product.description = description || product.description;
    product.prix = prix || product.prix;
    product.stock = stock || product.stock;
    product.category = category || product.category;

    // Mise à jour de l'image si envoyée
    if (req.file) {
      product.image = { data: req.file.buffer, contentType: req.file.mimetype };
    }

    await product.save();

    res.status(200).json({
      message: "✅ Produit mis à jour avec succès",
      product: {
        _id: product._id,
        name: product.name,
        description: product.description,
        prix: product.prix,
        stock: product.stock,
        category: product.category,
        image: product.image && product.image.data
          ? `data:${product.image.contentType};base64,${product.image.data.toString('base64')}`
          : null,
      },
    });
  } catch (error) {
    console.error("❌ Erreur mise à jour produit:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});


//contact

app.post('/contact',async (req,res)=>{
    const art=new Contact();
    const name=req.body.name;
    const description=req.body.description;
    const object=req.body.object;
    const phone=req.body.phone;
    const email=req.body.email;
    

    art.name=name;
    art.description=description;
    art.object=object;
    art.phone=phone;
    art.email=email;
    await art.save()
    res.json(art)
})

app.get('/contact', async (req,res)=>{
    try{
        const pro=await Contact.find();
        res.status(200).json(pro)
    }catch(err){
            console.error('❌ Error fetching contact:', err);
    res.status(500).json({ message: 'Error fetching contact' }); 
    }
})

const nodemailer = require("nodemailer");

// 📩 API لإرسال الرد على الرسالة
app.post("/contact/reply", async (req, res) => {
  const { email, subject, message } = req.body;

  try {
    // إعداد النقل عبر Gmail (يمكن تغييره)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "votreemail@gmail.com", // ⚠️ ضع إيميلك هنا
        pass: "motdepasse_application", // ⚠️ استخدم App Password من إعدادات Gmail
      },
    });

    // محتوى البريد
    await transporter.sendMail({
      from: "votreemail@gmail.com",
      to: email,
      subject: subject || "Réponse à votre message",
      text: message,
    });

    res.status(200).json({ message: "Email envoyé avec succès ✅" });
  } catch (err) {
    console.error("Erreur envoi email:", err);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email ❌" });
  }
});


//order et client


// 🧾 POST: Ajouter un client et une commande en même temps
app.post('/create-order', async (req, res) => {
  try {
    // 1️⃣ استخراج بيانات العميل والطلب من الطلب المرسل (req.body)
    const { name, email, phone, adresse, city, products, totalPrice } = req.body;

    // 2️⃣ إنشاء العميل أولاً
    const newClient = new Client({
      name,
      email,
      phone,
      adresse,
      city,
    });

    const savedClient = await newClient.save(); // حفظ العميل في قاعدة البيانات

    // 3️⃣ إنشاء الطلب المرتبط بالعميل
    const newOrder = new Order({
      clientId: savedClient._id, // ربط الطلب بالعميل الذي تم إنشاؤه
      products,
      totalPrice,
      status: 'pending', // الحالة المبدئية
    });

    const savedOrder = await newOrder.save(); // حفظ الطلب في قاعدة البيانات

    // 4️⃣ إرسال رد للواجهة الأمامية (Frontend)
    res.status(201).json({
      message: '✅ تم إنشاء العميل والطلب بنجاح',
      client: savedClient,
      order: savedOrder,
    });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    res.status(500).json({ message: '❌ حدث خطأ أثناء إنشاء العميل والطلب', error });
  }
});

// 🧾 GET: جلب جميع الطلبات مع بيانات العميل
app.get('/orders', async (req, res) => {
  try {
    // 1️⃣ جلب جميع الطلبات وربطها بمعلومات العميل
    const orders = await Order.find()
      .populate('clientId') // إظهار تفاصيل العميل المرتبط بكل طلب
      .populate('products.productId') // (اختياري) إظهار معلومات المنتج أيضًا إن وجدت
      .sort({ createdAt: -1 }); // ترتيب تنازلي حسب تاريخ الإنشاء

    // 2️⃣ إرسال النتيجة
    res.status(200).json({
      message: '✅ تم جلب جميع الطلبات بنجاح',
      orders,
    });
  } catch (error) {
    console.error('❌ خطأ أثناء جلب الطلبات:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الطلبات', error });
  }
});
app.put('/orders/:id/status', async (req, res) => {
  try {
    const orderId = req.params.id; // أخذ رقم الطلب من الرابط
    const { status } = req.body; // الحالة الجديدة من الطلب (pending / shipped / delivered ...)

    // 🔍 التحقق من وجود الطلب
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "❌ الطلب غير موجود" });
    }

    // ✅ تحديث الحالة
    order.status = status;
    await order.save();

    res.status(200).json({
      message: "✅ تم تعديل حالة الطلب بنجاح",
      updatedOrder: order
    });
  } catch (error) {
    console.error("❌ خطأ أثناء تحديث حالة الطلب:", error);
    res.status(500).json({ message: "حدث خطأ أثناء تعديل حالة الطلب", error });
  }
});

// 📦 GET: عرض الطلبات حسب الحالة (status)
app.get('/orders/status/:status', async (req, res) => {
  try {
    const { status } = req.params; // نأخذ الحالة من الرابط

    // 🔍 التحقق من أن الحالة صحيحة
    const validStatus = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "❌ الحالة غير صحيحة" });
    }

    // 📋 جلب الطلبات التي تطابق الحالة
    const orders = await Order.find({ status })
      .populate('clientId') // عرض معلومات العميل المرتبط بكل طلب
      .populate('products.productId') // عرض تفاصيل المنتجات في الطلب
      .sort({ createdAt: -1 }); // ترتيب تنازلي حسب تاريخ الإنشاء

    // ✅ التحقق إن كانت هناك طلبات
    if (orders.length === 0) {
      return res.status(200).json({ message: "ℹ️ لا توجد طلبات بهذه الحالة", orders: [] });
    }

    // ✅ إرسال النتائج
    res.status(200).json({
      message: `✅ تم جلب جميع الطلبات بالحالة: ${status}`,
      orders
    });
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الطلبات:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الطلبات", error });
  }
});

app.post('/admins/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔍 التحقق من أن البريد غير مسجل سابقًا
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "❌ البريد الإلكتروني مستخدم من قبل" });
    }

    // 🔐 تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 إنشاء مدير جديد
    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword
    });
    await newAdmin.save();

    res.status(201).json({ message: "✅ تم إنشاء حساب المدير بنجاح", admin: newAdmin });
  } catch (error) {
    console.error("❌ خطأ أثناء التسجيل:", error);
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء الحساب", error });
  }
});


// ===========================
// 2️⃣ Login (تسجيل الدخول)
// ===========================
app.post('/admins/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 التحقق من وجود المدير
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "❌ البريد الإلكتروني غير مسجل" });
    }

    // 🔑 مقارنة كلمة المرور المدخلة مع المشفرة
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "❌ كلمة المرور غير صحيحة" });
    }

    // 🪪 إنشاء رمز JWT صالح لمدة 1 يوم
    const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({
      message: "✅ تم تسجيل الدخول بنجاح",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    console.error("❌ خطأ أثناء تسجيل الدخول:", error);
    res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول", error });
  }
});


// ===========================
// 3️⃣ Logout (تسجيل الخروج)
// ===========================
// مبدئيًا في JWT لا يوجد حذف مباشر للتوكن، فقط نحذفه من المتصفح
app.post('/admins/logout',  (req, res) => {
  try {
    // Ici vous pouvez ajouter la logique pour blacklist le token si nécessaire
    // Par exemple, ajouter le token à une blacklist dans la base de données
    
    res.status(200).json({ 
      success: true,
      message: "✅ Déconnexion réussie" 
    });
  } catch (error) {
    console.error("Erreur déconnexion:", error);
    res.status(500).json({ 
      success: false,
      message: "❌ Erreur lors de la déconnexion", 
      error: error.message 
    });
  }
});

// 📊 GET: إحصائيات عامة للوحة الإدارة
app.get('/dashboard/stats', async (req, res) => {
  try {
    // 1️⃣ عدد المنتجات
    const totalProducts = await Product.countDocuments();

    // 2️⃣ عدد العملاء
    const totalClients = await Client.countDocuments();

    // 3️⃣ عدد الطلبات الكلي
    const totalOrders = await Order.countDocuments();

    // 4️⃣ مجموع المبيعات (نجمع totalPrice فقط للطلبات التي تم تسليمها)
    const deliveredOrders = await Order.find({ status: "delivered" });
    const totalSales = deliveredOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    // 5️⃣ عدد الطلبات حسب الحالة
    const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    const ordersByStatus = {};

    for (const status of statuses) {
      const count = await Order.countDocuments({ status });
      ordersByStatus[status] = count;
    }

    // ✅ النتيجة النهائية
    res.status(200).json({
      message: "✅ تم جلب الإحصائيات بنجاح",
      stats: {
        totalProducts,
        totalClients,
        totalOrders,
        totalSales,
        ordersByStatus
      }
    });
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الإحصائيات:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الإحصائيات", error });
  }
});


app.listen(3000,()=>{
    console.log('Server is Running on port 3000')
})