const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true, // bcrypt로 암호화된 문자열 저장
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
