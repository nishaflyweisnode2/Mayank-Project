const mongoose = require("mongoose");
const schema = mongoose.Schema;
const addressSchema = new mongoose.Schema({
  address1: {
    type: String,
  },
  address2: {
    type: String,
  },
  houseFlat: {
    type: String,
  },
  appartment: {
    type: String,
  },
  landMark: {
    type: String,
  },
  houseType: {
    type: String,
    enum: ["home", "Other"],
  },
  user: {
    type: schema.Types.ObjectId,
    ref: "user",
  },
}, { timestamps: true });
module.exports = mongoose.model("Address", addressSchema);
