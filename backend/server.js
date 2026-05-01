const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ override: true });

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const ADMIN_USERNAME = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_TOKEN = "admin-session-token";
const DRIVER_EMAIL = "driver@gmail.com";
const DRIVER_PASSWORD = "driver123";
const DRIVER_TOKEN = "driver-session-token";
const ORDER_STATUSES = ["pending", "accepted", "cooking", "cooked", "on_the_way", "delivered"];
const ORDER_STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  cooking: "Cooking",
  cooked: "Cooked",
  on_the_way: "On the way",
  delivered: "Delivered",
};

const defaultProductImage = "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80";

const seedProducts = [
  {
    id: "f1",
    name: "Chicken Tikka Pizza",
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=1200&q=80",
    description: "Thin crust, smoked chicken, onions, mozzarella.",
    price: 1450,
    rating: 4.8,
    eta: "20-28 min",
  },
  {
    id: "f2",
    name: "Classic Beef Burger",
    category: "Burger",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
    description: "Double patty, cheddar, lettuce, house sauce.",
    price: 950,
    rating: 4.6,
    eta: "15-22 min",
  },
  {
    id: "f3",
    name: "Spicy Chicken Rice Bowl",
    category: "Rice",
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    description: "Steamed rice, chili chicken, crunchy vegetables.",
    price: 780,
    rating: 4.7,
    eta: "16-24 min",
  },
  {
    id: "f4",
    name: "Chocolate Lava Cake",
    category: "Dessert",
    imageUrl: "https://images.unsplash.com/photo-1617305855058-336d24456869?auto=format&fit=crop&w=1200&q=80",
    description: "Warm center, cocoa dust, vanilla drizzle.",
    price: 520,
    rating: 4.9,
    eta: "12-18 min",
  },
  {
    id: "f5",
    name: "Mint Lemon Cooler",
    category: "Drinks",
    imageUrl: "https://images.unsplash.com/photo-1605270012917-bf157c5a9541?auto=format&fit=crop&w=1200&q=80",
    description: "Fresh lemon, mint leaves, light sparkling fizz.",
    price: 280,
    rating: 4.5,
    eta: "10-15 min",
  },
  {
    id: "f6",
    name: "Cheese Burst Pizza",
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=1200&q=80",
    description: "Stuffed crust, extra cheese, oregano mix.",
    price: 1650,
    rating: 4.7,
    eta: "22-30 min",
  },
  {
    id: "f7",
    name: "Chicken Shawarma Wrap",
    category: "Burger",
    imageUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1200&q=80",
    description: "Grilled chicken, garlic sauce, fries on the side.",
    price: 890,
    rating: 4.6,
    eta: "14-20 min",
  },
  {
    id: "f8",
    name: "Creamy Alfredo Pasta",
    category: "Rice",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80",
    description: "Velvety white sauce, herbs, parmesan, mushrooms.",
    price: 1120,
    rating: 4.8,
    eta: "18-26 min",
  },
  {
    id: "f9",
    name: "Classic Mango Shake",
    category: "Drinks",
    imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1200&q=80",
    description: "Fresh mango blend, chilled milk, smooth and sweet.",
    price: 360,
    rating: 4.5,
    eta: "8-12 min",
  },
  {
    id: "f10",
    name: "Hot Fudge Sundae",
    category: "Dessert",
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80",
    description: "Vanilla scoop, hot fudge, nuts, and whipped cream.",
    price: 490,
    rating: 4.9,
    eta: "10-14 min",
  },
  {
    id: "f11",
    name: "Pepperoni Fire Pizza",
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    description: "Pepperoni slices, mozzarella, chili oil, and herbs.",
    price: 1580,
    rating: 4.7,
    eta: "21-29 min",
  },
  {
    id: "f12",
    name: "Veggie Supreme Pizza",
    category: "Pizza",
    imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=1200&q=80",
    description: "Bell peppers, olives, onions, mushrooms, and cheese.",
    price: 1380,
    rating: 4.5,
    eta: "19-27 min",
  },
  {
    id: "f13",
    name: "BBQ Chicken Burger",
    category: "Burger",
    imageUrl: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=1200&q=80",
    description: "Grilled chicken, smoky BBQ sauce, cheddar, and pickles.",
    price: 1020,
    rating: 4.7,
    eta: "16-23 min",
  },
  {
    id: "f14",
    name: "Double Cheese Burger",
    category: "Burger",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
    description: "Two beef patties, double cheese, onion, and house sauce.",
    price: 1120,
    rating: 4.8,
    eta: "15-21 min",
  },
  {
    id: "f15",
    name: "Teriyaki Chicken Rice",
    category: "Rice",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    description: "Steamed rice, glazed chicken, sesame, and vegetables.",
    price: 860,
    rating: 4.7,
    eta: "17-24 min",
  },
  {
    id: "f16",
    name: "Chicken Fried Rice",
    category: "Rice",
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    description: "Wok-tossed rice with chicken, egg, and spring onions.",
    price: 820,
    rating: 4.6,
    eta: "15-22 min",
  },
  {
    id: "f17",
    name: "Oreo Cheesecake",
    category: "Dessert",
    imageUrl: "https://images.unsplash.com/photo-1564128442383-9201fcc6c4c2?auto=format&fit=crop&w=1200&q=80",
    description: "Creamy cheesecake with Oreo crust and cookie crumble.",
    price: 640,
    rating: 4.8,
    eta: "11-16 min",
  },
  {
    id: "f18",
    name: "Strawberry Waffle Stack",
    category: "Dessert",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
    description: "Warm waffles, strawberries, cream, and syrup.",
    price: 590,
    rating: 4.7,
    eta: "12-18 min",
  },
  {
    id: "f19",
    name: "Iced Caramel Latte",
    category: "Drinks",
    imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80",
    description: "Espresso, milk, caramel syrup, and ice.",
    price: 420,
    rating: 4.6,
    eta: "8-12 min",
  },
  {
    id: "f20",
    name: "Fresh Lime Soda",
    category: "Drinks",
    imageUrl: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1200&q=80",
    description: "Chilled lime, mint, soda, and a bright citrus finish.",
    price: 260,
    rating: 4.5,
    eta: "7-10 min",
  },
];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, required: true },
    eta: { type: String, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { versionKey: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    itemName: { type: String, required: true },
    price: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    customerEmail: { type: String, required: true, index: true },
    customerPhone: { type: String, default: "" },
    customerAddress: { type: String, default: "" },
    driverName: { type: String, default: "" },
    status: { type: String, enum: ORDER_STATUSES, required: true, default: "pending" },
    etaTime: { type: String, default: null },
    bankSlip: { type: String, default: null }, // Base64 encoded slip for bank transfers
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  { versionKey: false }
);

const notificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerEmail: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    isRead: { type: Boolean, required: true, default: false },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { versionKey: false }
);

const reviewSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false }
);

const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);
const Notification = mongoose.model("Notification", notificationSchema);
const User = mongoose.model("User", userSchema);
const Review = mongoose.model("Review", reviewSchema);

let useInMemoryStore = false;
const memoryStore = {
  products: [],
  orders: [],
  notifications: [],
  users: [],
  reviews: [],
};

const mongoUri = process.env.MONGODB_URI;
const dbPassword = process.env.DB_PASSWORD;
const localMongoUri = process.env.LOCAL_MONGODB_URI || "mongodb://127.0.0.1:27017/yummi_app";

if (!mongoUri) {
  console.error("MONGODB_URI is missing in .env file");
  process.exit(1);
}

const resolvedMongoUri = mongoUri.includes("<db_password>")
  ? mongoUri.replace("<db_password>", encodeURIComponent(dbPassword || ""))
  : mongoUri;

if (mongoUri.includes("<db_password>") && !dbPassword) {
  console.error("DB_PASSWORD is missing in .env file");
  process.exit(1);
}

const requireAdmin = (req, res, next) => {
  const token = req.header("x-admin-token");

  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ message: "Unauthorized admin request" });
  }

  next();
};

const requireDriver = (req, res, next) => {
  const token = req.header("x-driver-token");

  if (token !== DRIVER_TOKEN) {
    return res.status(401).json({ message: "Unauthorized driver request" });
  }

  next();
};

const toPlain = (doc) => {
  const source = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  if (!source) {
    return source;
  }

  const { _id, ...rest } = source;
  return rest;
};

const getNowDate = () => new Date();

const sortByCreatedAtDesc = (items) => [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const ensureMemorySeed = () => {
  if (memoryStore.products.length > 0) {
    return;
  }

  const now = getNowDate();
  memoryStore.products = seedProducts.map((item) => ({
    ...item,
    createdAt: now,
    updatedAt: now,
  }));
};

const normalizeText = (value, fallback = "") => {
  if (typeof value === "string") {
    return value.trim();
  }

  return fallback;
};

const normalizeNumber = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return Number.NaN;
  }

  return parsed;
};

const normalizeUserPayload = (payload, existingUser = null) => {
  const source = payload || {};
  const email = normalizeText(source.email, existingUser?.email || "").toLowerCase();
  const fullName = normalizeText(source.fullName, existingUser?.fullName || "");
  const phone = normalizeText(source.phone, existingUser?.phone || "");
  const address = normalizeText(source.address, existingUser?.address || "");

  if (!email || !email.includes("@")) {
    throw new Error("A valid email is required");
  }

  return {
    email,
    fullName,
    phone,
    address,
  };
};

const syncUserRecord = async (payload) => {
  if (useInMemoryStore) {
    const existingIndex = memoryStore.users.findIndex((user) => user.email === normalizeText(payload?.email, "").toLowerCase());
    const now = getNowDate();

    if (existingIndex < 0) {
      const parsed = normalizeUserPayload(payload);
      const createdUser = {
        ...parsed,
        createdAt: now,
        updatedAt: now,
      };

      memoryStore.users.push(createdUser);
      return createdUser;
    }

    const existingUser = memoryStore.users[existingIndex];
    const parsed = normalizeUserPayload(payload, existingUser);
    const updatedUser = {
      ...existingUser,
      ...parsed,
      updatedAt: now,
    };

    memoryStore.users[existingIndex] = updatedUser;
    return updatedUser;
  }

  const email = normalizeText(payload?.email, "").toLowerCase();
  const now = getNowDate();
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    const parsed = normalizeUserPayload(payload);
    const user = new User({
      ...parsed,
      createdAt: now,
      updatedAt: now,
    });

    const saved = await user.save();
    return toPlain(saved);
  }

  const parsed = normalizeUserPayload(payload, toPlain(existingUser));
  existingUser.fullName = parsed.fullName;
  existingUser.phone = parsed.phone;
  existingUser.address = parsed.address;
  existingUser.updatedAt = now;
  const saved = await existingUser.save();
  return toPlain(saved);
};

const parseProductPayload = (payload, existingProduct = null) => {
  const source = payload || {};
  const nextProduct = {
    name: normalizeText(source.name, existingProduct?.name || ""),
    category: normalizeText(source.category, existingProduct?.category || ""),
    imageUrl: normalizeText(source.imageUrl, existingProduct?.imageUrl || defaultProductImage),
    description: normalizeText(source.description, existingProduct?.description || ""),
    price: normalizeNumber(source.price, existingProduct?.price),
    rating: normalizeNumber(source.rating, existingProduct?.rating),
    eta: normalizeText(source.eta, existingProduct?.eta || "20-30 min"),
  };

  if (!nextProduct.name || !nextProduct.category || !nextProduct.imageUrl || !nextProduct.description || !nextProduct.eta) {
    throw new Error("name, category, imageUrl, description and eta are required");
  }

  if (!Number.isFinite(nextProduct.price) || nextProduct.price < 0) {
    throw new Error("price must be a non-negative number");
  }

  if (!Number.isFinite(nextProduct.rating) || nextProduct.rating < 0) {
    throw new Error("rating must be a non-negative number");
  }

  return {
    ...nextProduct,
    price: Math.round(nextProduct.price),
    rating: Math.round(nextProduct.rating * 10) / 10,
  };
};

const createProductRecord = (payload) => {
  const now = getNowDate();
  const parsed = parseProductPayload(payload);

  return {
    id: `PRD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...parsed,
    createdAt: now,
    updatedAt: now,
  };
};

const createNotification = async ({ customerEmail, orderId, title, message, type }) => {
  if (useInMemoryStore) {
    const notification = {
      id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerEmail: customerEmail.trim().toLowerCase(),
      orderId,
      title,
      message,
      type,
      isRead: false,
      createdAt: getNowDate(),
    };

    memoryStore.notifications.push(notification);
    return notification;
  }

  const notification = new Notification({
    id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    customerEmail: customerEmail.trim().toLowerCase(),
    orderId,
    title,
    message,
    type,
    isRead: false,
    createdAt: getNowDate(),
  });

  const saved = await notification.save();
  return toPlain(saved);
};

const emitOrderNotification = async (order, title, message, type) => {
  if (!order?.customerEmail) {
    return;
  }

  await createNotification({
    customerEmail: order.customerEmail,
    orderId: order.id,
    title,
    message,
    type,
  });
};

const seedProductsIfEmpty = async () => {
  if (useInMemoryStore) {
    ensureMemorySeed();
    return;
  }

  const count = await Product.countDocuments();

  if (count > 0) {
    return;
  }

  const now = getNowDate();
  const payload = seedProducts.map((item) => ({
    ...item,
    createdAt: now,
    updatedAt: now,
  }));

  await Product.insertMany(payload);
  console.log("Seeded default products");
};

app.get("/api/products", async (req, res) => {
  if (useInMemoryStore) {
    return res.json({ products: sortByCreatedAtDesc(memoryStore.products) });
  }

  const products = await Product.find().sort({ createdAt: -1 }).lean();
  res.json({ products: products.map(toPlain) });
});

app.get("/api/admin/products", requireAdmin, async (req, res) => {
  if (useInMemoryStore) {
    return res.json({ products: sortByCreatedAtDesc(memoryStore.products) });
  }

  const products = await Product.find().sort({ createdAt: -1 }).lean();
  res.json({ products: products.map(toPlain) });
});

app.post("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    if (useInMemoryStore) {
      const product = createProductRecord(req.body || {});
      memoryStore.products.unshift(product);
      return res.status(201).json({ message: "Product created", product });
    }

    const product = new Product(createProductRecord(req.body || {}));
    const saved = await product.save();
    return res.status(201).json({ message: "Product created", product: toPlain(saved) });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Invalid product data" });
  }
});

app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  if (useInMemoryStore) {
    const existingIndex = memoryStore.products.findIndex((item) => item.id === id);

    if (existingIndex < 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    try {
      const existingProduct = memoryStore.products[existingIndex];
      const parsed = parseProductPayload(req.body || {}, existingProduct);
      const updatedProduct = {
        ...existingProduct,
        ...parsed,
        updatedAt: getNowDate(),
      };

      memoryStore.products[existingIndex] = updatedProduct;
      return res.json({ message: "Product updated", product: updatedProduct });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Invalid product data" });
    }
  }

  const product = await Product.findOne({ id });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  try {
    const parsed = parseProductPayload(req.body || {}, toPlain(product));

    product.name = parsed.name;
    product.category = parsed.category;
    product.imageUrl = parsed.imageUrl;
    product.description = parsed.description;
    product.price = parsed.price;
    product.rating = parsed.rating;
    product.eta = parsed.eta;
    product.updatedAt = getNowDate();

    const saved = await product.save();
    return res.json({ message: "Product updated", product: toPlain(saved) });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Invalid product data" });
  }
});

app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  if (useInMemoryStore) {
    const existingIndex = memoryStore.products.findIndex((item) => item.id === id);

    if (existingIndex < 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [removed] = memoryStore.products.splice(existingIndex, 1);
    return res.json({ message: "Product deleted", product: removed });
  }

  const removed = await Product.findOneAndDelete({ id });

  if (!removed) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({ message: "Product deleted", product: toPlain(removed) });
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  return res.json({
    message: "Admin login successful",
    token: ADMIN_TOKEN,
    username: ADMIN_USERNAME,
  });
});

app.post("/api/driver/login", (req, res) => {
  const { email, password } = req.body || {};

  if (email !== DRIVER_EMAIL || password !== DRIVER_PASSWORD) {
    return res.status(401).json({ message: "Invalid driver credentials" });
  }

  return res.json({
    message: "Driver login successful",
    token: DRIVER_TOKEN,
    email: DRIVER_EMAIL,
  });
});

app.get("/api/driver/orders", requireDriver, async (req, res) => {
  if (useInMemoryStore) {
    const assignedOrders = memoryStore.orders.filter((o) => o.driverName && o.driverName.trim().length > 0);
    return res.json({ orders: sortByCreatedAtDesc(assignedOrders) });
  }

  const orders = await Order.find({ driverName: { $ne: "", $exists: true } }).sort({ createdAt: -1 }).lean();
  return res.json({ orders: orders.map(toPlain) });
});

app.patch("/api/driver/orders/:id", requireDriver, async (req, res) => {
  const { id } = req.params;
  const { action, status } = req.body || {};

  if (useInMemoryStore) {
    const orderIndex = memoryStore.orders.findIndex((o) => o.id === id);
    if (orderIndex < 0) return res.status(404).json({ message: "Order not found" });

    const order = memoryStore.orders[orderIndex];
    const now = getNowDate();

    if (action === "accept") {
      order.status = "on_the_way";
    } else if (action === "reject") {
      order.driverName = "";
    } else if (status) {
      if (!["on_the_way", "delivered"].includes(status)) {
        return res.status(400).json({ message: "Invalid status for driver" });
      }
      order.status = status;
    }

    order.updatedAt = now;
    return res.json({ message: "Order updated", order });
  }

  const order = await Order.findOne({ id });
  if (!order) return res.status(404).json({ message: "Order not found" });

  const now = getNowDate();

  if (action === "accept") {
    order.status = "on_the_way";
  } else if (action === "reject") {
    order.driverName = "";
  } else if (status) {
    if (!["on_the_way", "delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status for driver" });
    }
    order.status = status;
  }

  order.updatedAt = now;
  await order.save();
  return res.json({ message: "Order updated", order: toPlain(order) });
});

app.post("/api/users/sync", async (req, res) => {
  try {
    const user = await syncUserRecord(req.body || {});
    return res.json({ message: "User profile synced", user });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Invalid user payload" });
  }
});

app.get("/api/admin/users", requireAdmin, async (req, res) => {
  if (useInMemoryStore) {
    return res.json({ users: sortByCreatedAtDesc(memoryStore.users) });
  }

  const users = await User.find().sort({ createdAt: -1 }).lean();
  return res.json({ users: users.map(toPlain) });
});

app.delete("/api/admin/users/:email", requireAdmin, async (req, res) => {
  const email = typeof req.params.email === "string" ? decodeURIComponent(req.params.email).trim().toLowerCase() : "";

  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }

  if (useInMemoryStore) {
    const userIndex = memoryStore.users.findIndex((user) => user.email === email);

    if (userIndex < 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [removed] = memoryStore.users.splice(userIndex, 1);
    return res.json({ message: "User removed", user: removed });
  }

  const removed = await User.findOneAndDelete({ email });

  if (!removed) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ message: "User removed", user: toPlain(removed) });
});

app.post("/api/orders", async (req, res) => {
  const { itemName, price, paymentMethod, customerEmail, customerPhone, customerAddress, bankSlip } = req.body || {};

  if (!itemName || typeof price !== "number" || !paymentMethod) {
    return res.status(400).json({ message: "itemName, price and paymentMethod are required" });
  }

  const now = getNowDate();
  const normalizedEmail = normalizeText(customerEmail, "customer@yummi.app").toLowerCase();

  if (useInMemoryStore) {
    const order = {
      id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemName,
      price,
      paymentMethod,
      customerEmail: normalizedEmail,
      customerPhone: customerPhone || "",
      customerAddress: customerAddress || "",
      status: "pending",
      etaTime: null,
      bankSlip: bankSlip || null,
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          status: "pending",
          at: now,
        },
      ],
    };

    memoryStore.orders.unshift(order);

    await emitOrderNotification(
      order,
      "Order placed",
      `Your order for ${order.itemName} has been placed successfully.`,
      "order_created"
    );

    return res.status(201).json(order);
  }

  const order = new Order({
    id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    itemName,
    price,
    paymentMethod,
    customerEmail: normalizedEmail,
    customerPhone: customerPhone || "",
    customerAddress: customerAddress || "",
    status: "pending",
    etaTime: null,
    bankSlip: bankSlip || null,
    createdAt: now,
    updatedAt: now,
    statusHistory: [
      {
        status: "pending",
        at: now,
      },
    ],
  });

  const savedOrder = await order.save();
  const plainOrder = toPlain(savedOrder);

  await emitOrderNotification(
    plainOrder,
    "Order placed",
    `Your order for ${plainOrder.itemName} has been placed successfully.`,
    "order_created"
  );

  return res.status(201).json(plainOrder);
});

app.get("/api/orders", async (req, res) => {
  if (useInMemoryStore) {
    return res.json({ orders: sortByCreatedAtDesc(memoryStore.orders) });
  }

  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  res.json({ orders: orders.map(toPlain) });
});

app.get("/api/admin/orders", requireAdmin, async (req, res) => {
  if (useInMemoryStore) {
    return res.json({ orders: sortByCreatedAtDesc(memoryStore.orders) });
  }

  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  res.json({ orders: orders.map(toPlain) });
});

app.get("/api/notifications", async (req, res) => {
  const customerEmail = typeof req.query.customerEmail === "string" ? req.query.customerEmail.trim().toLowerCase() : "";

  if (useInMemoryStore) {
    const notifications = customerEmail
      ? memoryStore.notifications.filter((notification) => notification.customerEmail === customerEmail)
      : memoryStore.notifications;

    return res.json({ notifications: sortByCreatedAtDesc(notifications) });
  }

  const filter = customerEmail ? { customerEmail } : {};

  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).lean();
  return res.json({ notifications: notifications.map(toPlain) });
});

app.patch("/api/notifications/mark-all-read", async (req, res) => {
  const { customerEmail } = req.body || {};

  if (!customerEmail || typeof customerEmail !== "string") {
    return res.status(400).json({ message: "customerEmail is required" });
  }

  const normalizedEmail = customerEmail.trim().toLowerCase();

  if (useInMemoryStore) {
    let updated = 0;

    memoryStore.notifications = memoryStore.notifications.map((notification) => {
      if (notification.customerEmail === normalizedEmail && !notification.isRead) {
        updated += 1;
        return { ...notification, isRead: true };
      }

      return notification;
    });

    return res.json({ message: "Notifications marked as read", updated });
  }

  const result = await Notification.updateMany({ customerEmail: normalizedEmail, isRead: false }, { $set: { isRead: true } });
  return res.json({ message: "Notifications marked as read", updated: result.modifiedCount || 0 });
});

app.delete("/api/notifications/clear-all", async (req, res) => {
  const customerEmail = typeof req.body?.customerEmail === "string" ? req.body.customerEmail.trim().toLowerCase() : "";

  if (!customerEmail) {
    return res.status(400).json({ message: "customerEmail is required" });
  }

  if (useInMemoryStore) {
    const previousCount = memoryStore.notifications.length;
    memoryStore.notifications = memoryStore.notifications.filter((notification) => notification.customerEmail !== customerEmail);
    return res.json({ message: "Notifications cleared", deleted: previousCount - memoryStore.notifications.length });
  }

  const result = await Notification.deleteMany({ customerEmail });
  return res.json({ message: "Notifications cleared", deleted: result.deletedCount || 0 });
});

app.patch("/api/admin/orders/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { action, status, driverName } = req.body || {};

  if (useInMemoryStore) {
    const orderIndex = memoryStore.orders.findIndex((item) => item.id === id);

    if (orderIndex < 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const now = getNowDate();
    const order = memoryStore.orders[orderIndex];
    const previousOrder = { ...order };

    if (action === "remove") {
      const [removedOrder] = memoryStore.orders.splice(orderIndex, 1);
      return res.json({ message: "Order removed", order: removedOrder });
    }

    if (order.status === "pending" && action !== "accept") {
      return res.status(400).json({
        message: "Pending order must be accepted or removed first",
      });
    }

    let nextStatus = typeof status === "string" ? status : undefined;

    if (action === "accept") {
      if (order.status !== "pending") {
        return res.status(400).json({
          message: "Only pending orders can be accepted",
        });
      }

      if (order.paymentMethod === "Bank" && !order.bankSlip) {
        return res.status(400).json({
          message: "Bank transfer orders require an uploaded slip before confirmation",
        });
      }

      nextStatus = "accepted";
    }

    if (nextStatus && !ORDER_STATUSES.includes(nextStatus)) {
      return res.status(400).json({
        message: `status must be one of: ${ORDER_STATUSES.join(", ")}`,
      });
    }

    if (!nextStatus) {
      return res.status(400).json({
        message: "Provide status or action=remove",
      });
    }

    if (order.status === "pending" && nextStatus && nextStatus !== "accepted") {
      return res.status(400).json({
        message: "Set action=accept before updating to other statuses",
      });
    }

    let statusHistory = order.statusHistory || [];

    if (nextStatus && nextStatus !== order.status) {
      statusHistory = [...statusHistory, { status: nextStatus, at: now }];
    }

    const updatedOrder = {
      ...order,
      status: nextStatus || order.status,
      driverName: driverName !== undefined ? driverName : order.driverName,
      updatedAt: now,
      statusHistory,
    };

    memoryStore.orders[orderIndex] = updatedOrder;

    if (action === "accept" && previousOrder.status === "pending") {
      await emitOrderNotification(
        updatedOrder,
        "Order accepted",
        `Your order for ${updatedOrder.itemName} has been accepted by admin.`,
        "order_accepted"
      );
    }



    if (nextStatus && nextStatus !== previousOrder.status) {
      await emitOrderNotification(
        updatedOrder,
        "Order status updated",
        `Your order for ${updatedOrder.itemName} is now ${ORDER_STATUS_LABELS[nextStatus]}.`,
        "status_updated"
      );
    }

    return res.json({ message: "Order updated", order: updatedOrder });
  }

  const order = await Order.findOne({ id });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const now = getNowDate();
  const previousOrder = toPlain(order);

  if (action === "remove") {
    const removedOrder = toPlain(order);
    await Order.deleteOne({ id });
    return res.json({ message: "Order removed", order: removedOrder });
  }

  if (order.status === "pending" && action !== "accept") {
    return res.status(400).json({
      message: "Pending order must be accepted or removed first",
    });
  }

  let nextStatus = typeof status === "string" ? status : undefined;

  if (action === "accept") {
    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Only pending orders can be accepted",
      });
    }

    if (order.paymentMethod === "Bank" && !order.bankSlip) {
      return res.status(400).json({
        message: "Bank transfer orders require an uploaded slip before confirmation",
      });
    }

    nextStatus = "accepted";
  }

  if (nextStatus && !ORDER_STATUSES.includes(nextStatus)) {
    return res.status(400).json({
      message: `status must be one of: ${ORDER_STATUSES.join(", ")}`,
    });
  }

  if (!nextStatus) {
    return res.status(400).json({
      message: "Provide status or action=remove",
    });
  }

  if (!nextStatus && !nextEtaTime) {
    return res.status(400).json({
      message: "Provide status, etaTime, or action=remove",
    });
  }

  if (order.status === "pending" && nextStatus && nextStatus !== "accepted") {
    return res.status(400).json({
      message: "Set action=accept before updating to other statuses",
    });
  }

  let statusHistory = order.statusHistory || [];

  if (nextStatus && nextStatus !== order.status) {
    statusHistory = [...statusHistory, { status: nextStatus, at: now }];
  }

  order.status = nextStatus || order.status;
  order.driverName = driverName !== undefined ? driverName : order.driverName;
  order.updatedAt = now;
  order.statusHistory = statusHistory;

  const savedOrder = await order.save();
  const plainOrder = toPlain(savedOrder);

  if (action === "accept" && previousOrder.status === "pending") {
    await emitOrderNotification(
      plainOrder,
      "Order accepted",
      `Your order for ${plainOrder.itemName} has been accepted by admin.`,
      "order_accepted"
    );
  }



  if (nextStatus && nextStatus !== previousOrder.status) {
    await emitOrderNotification(
      plainOrder,
      "Order status updated",
      `Your order for ${plainOrder.itemName} is now ${ORDER_STATUS_LABELS[nextStatus]}.`,
      "status_updated"
    );
  }

  return res.json({ message: "Order updated", order: plainOrder });
});

app.get("/api/products/:id/reviews", async (req, res) => {
  const { id } = req.params;

  if (useInMemoryStore) {
    const reviews = memoryStore.reviews.filter((r) => r.productId === id);
    return res.json({ reviews: sortByCreatedAtDesc(reviews) });
  }

  const reviews = await Review.find({ productId: id }).sort({ createdAt: -1 }).lean();
  return res.json({ reviews: reviews.map(toPlain) });
});

app.post("/api/products/:id/reviews", async (req, res) => {
  const { id } = req.params;
  const { customerName, rating, comment } = req.body || {};

  if (!customerName || typeof rating !== "number" || rating < 1 || rating > 5 || !comment) {
    return res.status(400).json({ message: "Invalid review data. Name, rating (1-5), and comment are required." });
  }

  const now = getNowDate();
  const reviewData = {
    id: `REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    productId: id,
    customerName: normalizeText(customerName, "Anonymous"),
    rating: Math.round(rating),
    comment: normalizeText(comment, ""),
    createdAt: now,
  };

  let savedReview;

  if (useInMemoryStore) {
    const productIndex = memoryStore.products.findIndex((p) => p.id === id);
    if (productIndex < 0) return res.status(404).json({ message: "Product not found" });

    memoryStore.reviews.push(reviewData);
    savedReview = reviewData;

    const productReviews = memoryStore.reviews.filter((r) => r.productId === id);
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    memoryStore.products[productIndex].rating = Math.round(avgRating * 10) / 10;
  } else {
    const product = await Product.findOne({ id });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = new Review(reviewData);
    savedReview = await review.save();

    const productReviews = await Review.find({ productId: id });
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    product.rating = Math.round(avgRating * 10) / 10;
    await product.save();
    
    savedReview = toPlain(savedReview);
  }

  return res.status(201).json({ message: "Review added", review: savedReview });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "YUMMI backend is running" });
});

const startServer = async () => {
  try {
    try {
      await mongoose.connect(resolvedMongoUri);
      console.log("Connected to MongoDB");
    } catch (primaryError) {
      console.warn(`Primary MongoDB connection failed: ${primaryError.message}`);
      console.warn(`Trying local MongoDB fallback: ${localMongoUri}`);
      try {
        await mongoose.connect(localMongoUri);
        console.log("Connected to local MongoDB fallback");
      } catch (localError) {
        console.warn(`Local MongoDB fallback failed: ${localError.message}`);
        console.warn("Running in-memory fallback mode. Data will reset when server restarts.");
        useInMemoryStore = true;
        ensureMemorySeed();
      }
    }

    await seedProductsIfEmpty();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on port ${PORT} with real DB`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error("Server startup failed.");
    process.exit(1);
  }
};

startServer();
