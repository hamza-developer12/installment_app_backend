const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const cookie = req.headers.cookie;
  if (cookie) {
    const token = cookie.split("=")[1];
    if (!token) {
      return res.status(401).send("Unauthorized");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.log(err);
      }
      req.user = user;
    });
    next();
  } else {
    return res.status(401).json({ msg: "Unauthorize" });
  }
};
module.exports = { verifyToken };
