const express = require("express");
const {
  createClient,
  getAllClients,
  editClient,
  deleteClient,
  getFile,
} = require("../controllers/clientController");
const { verifyToken } = require("../middlewares/authMiddleware");
const clientRouter = express.Router();
const { upload } = require("../utils/fileUpload");

clientRouter.post(
  "/register",
  verifyToken,
  upload.array("images"),
  createClient
);
clientRouter.get("/", verifyToken, getAllClients);
clientRouter.put("/client/:id", verifyToken, editClient);
clientRouter.delete("/client/:id", verifyToken, deleteClient);
module.exports = clientRouter;
