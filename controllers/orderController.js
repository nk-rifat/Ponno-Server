const Product = require("../models/Product");
const Order = require("../models/Order");

const getDeliveryCharge = (zila = "") => {
  const normalized = zila.toLowerCase().trim();
  const isDhaka = normalized.includes("dhaka");
  return isDhaka ? 120 : 150;
};

// create order api
exports.placeOrder = async (req, res) => {
  try {
    const { items, delivery } = req.body;
    const userId = req.userId;

    // 1. validate items

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in order",
      });
    }

    // 2. Validate delivery fields
    const requiredFields = ["name", "phone", "division", "zila", "address"];

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
        price: finalPrice,
        quantity: item.quantity,
      });
    }

    // 5. Delivery charge based on Location
    const deliveryCharge = getDeliveryCharge(delivery.zila);

    // 6. Final total
    const total = subtotal + deliveryCharge;

    // 7. Sanitize and structure the delivery object for database insertion
    const optimizedDelivery = {
      name: delivery.name.trim(),
      phone: delivery.phone.trim(),
      division: delivery.division.trim(),
      zila: delivery.zila.trim(),
      upazila:
        typeof delivery.upazila === "string" ? delivery.upazila.trim() : "",
      address: delivery.address.trim(),
      note: typeof delivery.note === "string" ? delivery.note.trim() : "",
    };

    // 8 . Create Order
    const order = await Order.create({
      userId,
      items: verifiedItems,
      delivery: optimizedDelivery,
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
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to place order",
    });
  }
};

// get single users orders with pagination and status filter
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const filter = { userId };

    if (status && status !== "all") {
      const allowedStatuses = [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter",
        });
      }
      filter.status = status;
    }
    const totalOrdersCount = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// Cancel order api
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled once it is ${order.status}`,
      });
    }

    order.status = "cancelled";
    order.statusHistory.push({
      status: "cancelled",
      note: "Cancelled by customer",
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to cancel order" });
  }
};
