const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, expires: 10 }
);

module.exports = mongoose.model("Token", tokenSchema);
