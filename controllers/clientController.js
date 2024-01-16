const clientModel = require("../models/clientModel");
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");
const fs = require("fs");
const createClient = async (req, res) => {
  const userId = req.user;
  let user;
  try {
    user = await userModel.findById(userId.id);
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }
    if (user.role === 0 || user.role === 1) {
      const {
        name,
        fatherName,
        email,
        address,
        postalCode,
        phoneNumber,
        idCard,
        guarantorName,
        guarantorIdCard,
      } = req.body;
      console.log(req);
      if (
        !name ||
        !email ||
        !address ||
        !postalCode ||
        !phoneNumber ||
        !idCard
      ) {
        return res.status(400).json({ msg: "Please provide all details" });
      }

      if (!req.files) {
        return res.status(400).json({ msg: "Image Not Found" });
      }
      existingClient = await clientModel.findOne({ phoneNumber });
      if (existingClient) {
        return res.status(400).json({ msg: "Client Already Exists" });
      }
      client = await clientModel.create({
        name,
        fatherName,
        email,
        address,
        postalCode,
        phoneNumber,
        idCard,
        idCardFront: req.files[0]?.filename,
        idCardBack: req.files[1]?.filename,
        guarantorName,
        guarantorIdCard,
        gIdImageFront: req.files[2]?.filename || null,
        gIdImageBack: req.files[3]?.filename || null,
      });
      await client.save();
      return res.status(201).json({ msg: "Client Created Successfully" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const getAllClients = async (req, res) => {
  const userId = req.user;
  let user;
  try {
    user = await userModel.findById(userId.id);
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }
    if (user.role === 0 || user.role === 1) {
      let clients;
      clients = await clientModel.find().sort({ createdAt: -1 });
      if (!clients) {
        return res.status(404).json({ msg: "No Client found" });
      }
      return res.status(200).json(clients);
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const editClient = async (req, res) => {
  const userId = req.user;
  let user;
  try {
    user = await userModel.findById(userId.id);
    if (!user) {
      return res.status(400).json({ msg: "User Not Found" });
    }
    if (user.role === 0 || user.role === 1) {
      const { id } = req.params;
    }
  } catch (error) {}
};
const deleteClient = async (req, res) => {
  const userId = req.user;
  let user;
  try {
    user = await userModel.findById(userId.id);
    if (!user) {
      return res.status(400).json({ msg: "User Not Found" });
    }
    if (user.role === 1 && user.owner === true) {
      const { id } = req.params;
      let existingClient;
      existingClient = await clientModel.findById(id);
      if (!existingClient) {
        return res.status(400).json({ msg: "Client Not Found" });
      }
      let deleteOrders;

      for (let i = 0; i <= existingClient.orders.length; i++) {
        deleteOrders = await orderModel.findByIdAndDelete(
          existingClient.orders[i]._id
        );
      }
      // Working here .....................
      await existingClient.deleteOne();
      return res.status(200).json({ msg: "Client Deleted Successfully" });
    } else {
      return res.status(401).json({ msg: "Unauthorize" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const getFile = async (req, res) => {
  // Assuming req.files is an array of uploaded files
  if (!req.files) {
    return res.status(400).json({ msg: "No files uploaded." });
  }

  for (const file of req.files) {
    if (file.size >= 1000000) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(err);
        } else {
          return res
            .status(400)
            .json({ msg: "File size must be less than 1MB" });
        }
      });
    }
  }
  // If all files are within size limits, you can continue with further logic her
};
module.exports = {
  createClient,
  getAllClients,
  editClient,
  deleteClient,
  getFile,
};
