const {createOrder, getAllOrders, getOrdersByClient, getSingleOrder, updateOrder} = require("../controllers/orderController");
const {verifyToken} = require("../middlewares/authMiddleware");

const orderRouter = require("express").Router();

orderRouter.post("/create-order", verifyToken, createOrder);
orderRouter.get("/", verifyToken, getAllOrders)
orderRouter.get("/order/:id", verifyToken, getSingleOrder);
orderRouter.put ("/update-order/:id", verifyToken, updateOrder)
module.exports=orderRouter;