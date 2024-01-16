const clientModel = require("../models/clientModel");
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");
const mongoose = require("mongoose");
const createOrder = async (req, res) => {
  const userId = req.user;
  let user;
  const {
    phoneNumber,
    productName,
    totalPrice,
    pricePaid,
    numberOfInstallments,
    date,
  } = req.body;
  try {
    user = await userModel.findById(userId.id);
    if (user.role === 0 || user.role === 1) {
      let existingClient = await clientModel.findOne({
        phoneNumber: phoneNumber,
      });
      if (!existingClient) {
        return res.status(400).json({ msg: "Client Not Found" });
      }
      const amountRemaining = totalPrice - pricePaid;
      const installmentRemaining = numberOfInstallments - 1;

      const nextInstallmentAmount = amountRemaining / installmentRemaining;
      let order = await orderModel.create({
        productName: productName,
        totalPrice: totalPrice,
        pricePaid: pricePaid,
        numberOfInstallments: numberOfInstallments,

        installmentsRemaining: installmentRemaining,
        installmentsPaid: pricePaid,
        // Changes......
        amountRemaining: amountRemaining,
        nextInstallmentAmount: nextInstallmentAmount,
        // End of changes her.......
        client: existingClient._id,
        installmentPaidBy: "self",
        date: date,
      });
      await order.save();

      await existingClient.orders.push(order);
      await existingClient.save();
      return res.status(201).json({ msg: "Order Created Successfully" });
    } else {
      return res.status(401).json({ msg: "Unauthorized" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const getAllOrders = async (req, res) => {
  const userId = req.user;
  let user;
  try {
    user = await userModel.findById(userId.id);

    if (user.role === 0 || user.role === 1) {
      let orders = await orderModel
        .find()
        .sort({ createdAt: -1 })
        .populate("client");

      if (!orders) {
        return res.status(404).json({ msg: "No Order Created Yet" });
      }
      return res.status(200).json(orders);
    } else {
      return res.status(401).json({ msg: "Unauthorized" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const getOrdersByClient = async (req, res) => {
  const userId = req.user;
  const id = req.params;

  try {
    let user = await userModel.findById(userId.id);
    const objectId = new mongoose.Types.ObjectId(id);
    if (user.role === 0 || user.role === 1) {
      let client = await clientModel
        .findById(objectId)
        .populate("orders")
        .sort({ createdAt: -1 });
      if (!client) {
        return res.status(400).json({ msg: "Client Not Found" });
      }
      return res.status(200).json(client);
    } else {
      return res.status(401).json({ msg: "Unauthorize" });
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer"
      )
    ) {
      return res.status(400).json({ msg: "Invalid id" });
    } else {
      return res.status(500).json({ msg: error.message });
    }
  }
};

const getSingleOrder = async (req, res) => {
  const userId = req.user;
  const { id } = req.params;
  try {
    let user = await userModel.findById(userId.id);
    if (user.role === 1 || user.role === 0) {
      let order = await orderModel.findById(id).populate("client");
      if (!order) {
        return res.status(404).json({ msg: "Order Not Found" });
      }
      return res.status(200).json(order);
    } else {
      return res.status(401).json({ msg: "Unauthorize" });
    }
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ msg: "Invalid Id" });
    }
    return res.status(500).json({ msg: error.message });
  }
};

const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { installmentPaid, date } = req.body;
  let userId = req.user;
  try {
    let user = await userModel.findById(userId.id);
    if (user.role === 0 || user.role === 1) {
      let order = await orderModel.findById(id);
      if (!order) {
        return res.status(404).json({ msg: "Order Not Found" });
      }
      const pricePaid =
        parseFloat(order.pricePaid) + parseFloat(installmentPaid);
      const installmentRemaining = order.installmentsRemaining - 1;
      const amountRemaining = order.amountRemaining - installmentPaid;

      const nextInstallmentAmount =
        installmentRemaining !== 0 ? amountRemaining / installmentRemaining : 0;

      let updatedOrder = await orderModel.findByIdAndUpdate(order._id, {
        pricePaid: pricePaid,
        installmentsRemaining: installmentRemaining,
        amountRemaining: amountRemaining,
        nextInstallmentAmount: nextInstallmentAmount,
      });
      await updatedOrder.save();
      let updateAgainOrder = await orderModel.findById(order._id);
      await updateAgainOrder.installmentsPaid.push(installmentPaid);
      await updateAgainOrder.date.push(date);
      await updateAgainOrder.installmentPaidBy.push("self");
      await updateAgainOrder.save();
      return res.status(200).json({ msg: "Order Updated Successfully" });
    } else {
      return res.status(401).json({ msg: "Unauthorize" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrdersByClient,
  getSingleOrder,
  updateOrder,
};
