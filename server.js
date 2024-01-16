const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routes/userRoutes");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const clientRouter = require("./routes/clientRoutes");
const port = process.env.PORT;
const mongodb = process.env.MONGODB_URL;
const cors = require("cors");
const orderRouter = require("./routes/orderRoutes");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("uploads"));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
mongoose.connect(mongodb).then(() => {
  app.listen(port, () => {
    console.log(`Connected to db and listening on port ${port}`);
  });
});
app.use("/api", userRouter);
app.use("/api/clients", clientRouter);
app.use("/api/orders", orderRouter);
