const generateToken = require("../helpers/generateToken");
const { hashPassword, comparePassword } = require("../helpers/passwordHashing");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const tokenModel = require("../models/tokenModel");
const sendMail = require("../utils/sendMail");
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  let user;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ msg: "Please provide all details", success: false });
  }

  try {
    user = await userModel.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ msg: "User Already Exists", success: false });
    }

    const createUser = await userModel.create({
      name: name,
      email: email,
      password: await hashPassword(password),
    });
    await createUser.save();
    return res
      .status(201)
      .json({ msg: "User Created Successfully", success: true });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

// API For Admin/Employee Login

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ msg: "Please provide login credentials", success: false });
    }
    existingUser = await userModel.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ msg: "User Not Foundd", success: false });
    }
    const matchPassword = await comparePassword(
      password,
      existingUser.password
    );
    if (!matchPassword) {
      return res.status(400).json({
        msg: "Invalid email or password",
        success: false,
      });
    }
    const user = {
      name: existingUser.name,
      id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
      owner: existingUser.owner,
    };
    const token = generateToken(user);
    const oneDay = 7 * 24 * 60 * 60 * 1000;
    const expiryDate = new Date(Date.now() + oneDay);
    res.cookie("token", token, {
      expires: expiryDate,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });

    return res.status(200).json({
      msg: "Login Successfull",
      success: true,
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ msg: "Please provide Email" });
  }
  let user;
  try {
    user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }
    const secret = process.env.JWT_SECRET;
    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, secret, {
      expiresIn: "5m",
    });
    const encodedToken = encodeURIComponent(token.replace(/\./g, "sum"));

    const link = `${process.env.FRONTEND_URL}/reset-password/${user._id}/${encodedToken}`;
    // const decodedToken = decodeURIComponent(encodedToken.replace(/%/g, "."));
    let newToken;
    newToken = await tokenModel.create({
      token: token,
    });
    await newToken.save();
    sendMail(
      process.env.SMTP_USERNAME,
      user.email,
      "Reset Password",
      `This link will be valid for 5 minutes: <br/>
      <a href="${link}">${link}</a>`
    ).then(() => {
      return res.status(200).json({ msg: "Password Reset link has been sent" });
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  let existingToken;
  let existingUser;

  try {
    existingToken = await tokenModel.findOne({ token: token });

    if (!existingToken) {
      return res.status(400).json({ msg: "Invalid Token" });
    }
    if (!jwt.verify(token, process.env.JWT_SECRET)) {
      return res.status(400).json({ msg: "Token Expired" });
    }
    existingUser = await userModel.findById(id);

    if (
      existingUser &&
      jwt.decode(token).id === jwt.decode(existingToken.token).id
    ) {
      const hashedPassword = await hashPassword(password);
      let updateUser = await userModel.findByIdAndUpdate(existingUser._id, {
        password: hashedPassword,
      });

      await updateUser.save();
      await existingToken.deleteOne();

      return res.status(200).json({ msg: "Password Updated Successfully" });
    }

    return res.status(400).json({ msg: "Invalid Token or User" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ msg: "Link Expired" });
    }

    return res.status(500).json({ msg: error.message });
  }
};

const addEmployee = async (req, res) => {
  const user = req.user;
  let existingUser = await userModel.findById(user.id);
  if (existingUser.role === 0) {
    return res.status(401).json({ msg: "UnAuthorize" });
  } else if (existingUser.role === 1 || existingUser.owner === true) {
    const { name, email, password } = req.body;
    let existingEmployee;

    try {
      existingEmployee = await userModel.findOne({ email: email });
      if (existingEmployee) {
        return res.status(400).json({ msg: "Employee Already Registered" });
      }
      if (!name || !email || !password) {
        return res.status(400).json({ msg: "Please Provide all the details" });
      }
      let newEmployee = await userModel.create({
        name: name,
        email: email,
        password: await hashPassword(password),
      });
      await newEmployee.save();
      return res.status(201).json({ msg: "Employee Registered Successfully" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
};

const deleteUser = async (req, res) => {
  const user = req.user;
  let adminUser;
  adminUser = await userModel.findById(user.id);
  if (adminUser.role === 1 || adminUser.owner === true) {
    const { id } = req.params;
    let existingUser;
    try {
      existingUser = await userModel.findByIdAndDelete(id);
      if (!existingUser) {
        return res.status(404).json({ msg: "User Not Found" });
      }
      return res.status(200).json({ msg: "User Removed Successfully" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  } else {
    return res.status(400).json({ msg: "Unauthorize" });
  }
};

const getAllUsers = async (req, res) => {
  const user = req.user;
  let adminUser;
  adminUser = await userModel.findById(user.id);
  if (adminUser.role === 1 || adminUser.owner === true) {
    let users;
    try {
      users = await userModel
        .find({ role: 0 }, "-password -role ")
        .sort({ createdAt: -1 });
      if (!users) {
        return res.status(400).json({ msg: "User Not Found" });
      }
      if (users.length === 0) {
        return res.status(404).json({ msg: "No User Found" });
      }
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  } else {
    return res.status(401).json({ msg: "Not Authorize" });
  }
};

const editEmployee = async (req, res) => {
  const user = req.user;
  let adminUser;
  adminUser = await userModel.findById(user.id);
  if (adminUser.role === 1 || adminUser.owner === true) {
    const { id } = req.params;
    const { name, email, role } = req.body;
    let user;
    try {
      user = await userModel.findByIdAndUpdate(id, {
        name: name || user.name,
        email: email || user.email,
        role: role || user.role,
      });
      await user.save();
      return res.status(200).json({ msg: "Employee Updated Successfully" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  } else {
    return res.status(401).json({ msg: "Unauthorize" });
  }
};
const getSingleEmployee = async (req, res) => {
  const user = req.user;
  let adminUser;

  adminUser = await userModel.findById(user.id);
  if (adminUser.role === 1 || adminUser.owner === true) {
    const { id } = req.params;
    if (id.length < 12) {
      return res.status(400).json({ msg: "Employee Not Found" });
    }
    let user;
    try {
      const userId = new mongoose.Types.ObjectId(id);

      user = await userModel.findById(userId);
      if (!user) {
        return res.status(400).json({ msg: "Employee Not Found" });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ msg: "Something went wrong" });
    }
  } else {
    return res.status(401).json({ msg: "Not Authorize" });
  }
};

const getAllAdmins = async (req, res) => {
  let user = req.user;
  let owner;
  try {
    owner = await userModel.findOne({ _id: user.id });
    if (owner.role === 1 && owner.owner === true) {
      let admins;
      admins = await userModel.find(
        { role: 1, owner: false },
        "-password -owner"
      );
      if (!admins) {
        return res.status(404).json({ msg: "No Admin Found" });
      }
      return res.status(200).json(admins);
    } else {
      return res.status(401).json({ msg: "Unauthorize" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  const user = req.user;
  let owner;

  owner = await userModel.findById(user.id);
  if (owner.role === 1 && owner.owner === true) {
    const { id } = req.params;
    if (id.length < 12) {
      return res.status(400).json({ msg: "Admin Not Found" });
    }
    let adminUser;
    try {
      const userId = new mongoose.Types.ObjectId(id);

      adminUser = await userModel.findOneAndDelete({ _id: userId, role: 1 });
      if (!adminUser) {
        return res.status(400).json({ msg: "Admin Not Found" });
      }
      return res.status(200).json({ msg: "Admin Deleted Successfully" });
    } catch (error) {
      return res.status(500).json({ msg: "Something went wrong" });
    }
  } else {
    return res.status(401).json({ msg: "Not Authorize" });
  }
};

const editAdmin = async (req, res) => {
  const user = req.user;
  let owner;
  owner = await userModel.findById(user.id);
  if (owner.role === 1 && owner.owner === true) {
    const { id } = req.params;
    const { name, email, role } = req.body;
    let admin;
    try {
      admin = await userModel.findByIdAndUpdate(id, {
        name: name || admin.name,
        email: email || admin.email,
        role: role || admin.role,
      });
      await admin.save();
      return res.status(200).json({ msg: "Admin Updated Successfully" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  } else {
    return res.status(401).json({ msg: "Unauthorize" });
  }
};

// Check Login Status...........
const checkLogStatus = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ msg: false });
  }
  const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
  if (!verifyToken) {
    return res.status(401).json({ msg: false });
  }
  let user;
  try {
    user = await userModel.findById(verifyToken.id, "-password");
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }
    return res.status(200).json({
      id: user._id,
      name: user.name,
      role: user.role,
      owner: user.owner,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
};
const getSingleAdmin = async (req, res) => {
  const user = req.user;
  let owner;

  owner = await userModel.findOne({ _id: user.id, owner: true });
  if (owner.role === 1 && owner.owner === true) {
    const { id } = req.params;
    if (id.length < 12) {
      return res.status(400).json({ msg: "Admin Not Found" });
    }
    let user;
    try {
      const userId = new mongoose.Types.ObjectId(id);

      user = await userModel.findOne(
        { _id: userId, role: 1, owner: false },
        "-password "
      );
      if (!user) {
        return res.status(400).json({ msg: "Admin Not Found" });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ msg: "Something went wrong" });
    }
  } else {
    return res.status(401).json({ msg: "Not Authorize" });
  }
};
const logoutUser = async(req,res) => {
  res.clearCookie('token');
  res.status(200).json({msg: "Logout Successfull"});
}
module.exports = {
  registerUser,
  loginUser,
  addEmployee,
  forgotPassword,
  resetPassword,
  deleteUser,
  getAllUsers,
  editEmployee,
  getSingleEmployee,
  getAllAdmins,
  deleteAdmin,
  getSingleAdmin,
  editAdmin,
  checkLogStatus,
  logoutUser
};
