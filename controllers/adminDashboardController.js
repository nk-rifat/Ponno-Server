const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

exports.getDashboardSummary = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      pendingOrders,
      totalProducts,
      outOfStockProducts,
      totalCustomers,
      revenueResult,
      recentOrders,
      revenueByDay,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      User.countDocuments({ role: "user" }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("delivery.name delivery.phone total status createdAt")
        .lean(),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Fill missing days with 0 so the chart has all 7 days
    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      const key = date.toISOString().split("T")[0];

      const found = revenueByDay.find((d) => d._id === key);
      chartData.push({
        date: key,
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0,
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        totalProducts,
        outOfStockProducts,
        totalCustomers,
        totalRevenue: revenueResult[0]?.total || 0,
      },
      chartData,
      recentOrders,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to load dashboard summary" });
  }
};
