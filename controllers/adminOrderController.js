const Order = require("../models/Order");

const STATUS_FLOW = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

// get all orders with search, status filter, pagination
exports.getAdminOrders = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { "delivery.name": { $regex: search, $options: "i" } },
        { "delivery.phone": { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      orders,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// order to next status in sequence
exports.advanceOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.status === "cancelled" || order.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: `Order is already ${order.status}, cannot advance further`,
      });
    }

    const currentIndex = STATUS_FLOW.indexOf(order.status);
    const nextStatus = STATUS_FLOW[currentIndex + 1];

    if (!nextStatus) {
      return res
        .status(400)
        .json({ success: false, message: "No next status available" });
    }

    order.status = nextStatus;
    order.statusHistory.push({
      status: nextStatus,
      note: "Updated by admin",
    });

    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Order status updated", order });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update status" });
  }
};
