const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return token;
};

module.exports = generateToken;
