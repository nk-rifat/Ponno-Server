const Product = require("../models/Product");
const Order = require("../models/Order");

const getDeliveryCharge = (zila = "") => {
  const normalized = zila.toLowerCase().trim();
  const isDhaka = normalized.includes("dhaka");
  return isDhaka ? 120 : 150;
};

exports.placeOrder = async (req, res) => {
  try {
    const { items, delivery } = req.body;
    const userId = req.user.id;

    // 1. validate items

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in order",
      });
    }

    // 2. Validate delivery fields
    const requiredFields = [
      "name",
      "phone",
      "division",
      "zila",
      "upazila",
      "union",
      "address",
    ];

    for (const field of requiredFields) {
      const value = delivery?.[field];

      if (!value || typeof value !== "string" || !value.trim()) {
        return res.status(400).json({
          success: false,
          message: `Delivery field "${field} is required"`,
        });
      }
    }

    // 3. validata BD phone number
    const phoneRegex = /^(?:\+88)?01[3-9]\d{8}$/;
    if (!phoneRegex.test(delivery.phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // 4. Recalculate items securely from DB
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found ${item.productId}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.productName}`,
        });
      }

      const finalPrice = product.discountPrice ?? product.price;

      subtotal += finalPrice * item.quantity;

      verifiedItems.push({
        productId: product._id,
        name: product.productName,
        image: product.images[0],
        price: finalPrice,
        quantity: item.quantity,
      });
    }

    // 5. Delivery charge based on Location
    const deliveryCharge = getDeliveryCharge(delivery.zila);

    // 6. Final total
    const total = subtotal + deliveryCharge;

    // 7 . Create Order
    const order = await Order.create({
      userId,
      items: verifiedItems,
      delivery,
      subtotal,
      deliveryCharge,
      total,
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          note: "Order placed by customer",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to place order",
    });
  }
};
