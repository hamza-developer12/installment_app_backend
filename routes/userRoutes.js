const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  addEmployee,
  deleteUser,
  getAllUsers,
  editEmployee,
  getSingleEmployee,
  getAllAdmins,
  deleteAdmin,
  getSingleAdmin,
  checkLogStatus,
  editAdmin,
  logoutUser
} = require("../controllers/userController");
const sendMail = require("../utils/sendMail");
const { verifyToken } = require("../middlewares/authMiddleware");
const { verify } = require("jsonwebtoken");
const userRouter = express.Router();

userRouter.post("/user/register", registerUser);
userRouter.post("/user/login", loginUser);
userRouter.post("/user/forgot-password", forgotPassword);
userRouter.put("/user/reset-password/:id/:token", resetPassword);
userRouter.post("/user/add-employee", verifyToken, addEmployee);
userRouter.delete("/user/remove-user/:id", verifyToken, deleteUser);
userRouter.get("/users/", verifyToken, getAllUsers);
userRouter.put("/users/user/edit-user/:id", verifyToken, editEmployee);
userRouter.get("/users/user/:id", verifyToken, getSingleEmployee);
userRouter.get("/users/admins", verifyToken, getAllAdmins);
userRouter.get("/users/admin/:id", verifyToken, getSingleAdmin);
userRouter.put("/users/user/edit-admin/:id", verifyToken, editAdmin);
userRouter.delete("/users/admin/:id", verifyToken, deleteAdmin);
userRouter.get("/user/log-status", checkLogStatus);
userRouter.get("/user/logout", verifyToken, logoutUser);
module.exports = userRouter;
