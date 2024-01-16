const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    numberOfInstallments: {
      type: Number,
      required: true,
    },
    installmentsRemaining: {
      type: Number,
      required: true,
    },
    amountRemaining: {
      type: Number,
      required: true,
    },
    pricePaid: {
      type: Number,
      requierd: true,
    },
    installmentsPaid: [
      {
        type: Number,
      },
    ],
    nextInstallmentAmount: {
      type: Number,
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    installmentPaidBy: [{ type: String, required: true }],
    date: [
      {
        type: Date,
        required: true,
      },
    ], // Date...
    // Employee Id
    // Product Warranty
  },
  { timestamps: true }
);

module.exports = mongoose.model("Orders", orderSchema);
