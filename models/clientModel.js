const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const clientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    fatherName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    idCard: {
      type: Number,
      required: true,
      unique: true,
    },
    idCardFront: {
      type: Object,
      required:true,
    },
    idCardBack: {
      type: Object,
      required:true,
    },
    guarantorName: {
      type: String,
      default: null,
    },
    guarantorIdCard: {
      type: Number,
      default: null,
    },
    gIdImageFront: {
      type: Object,
      default: null,
    },
    gIdImageBack: {
      type: Object,
      default: null,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Orders",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
