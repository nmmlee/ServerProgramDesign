const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: String,
      enum: ["user", "assistant"], // 사용자는 'user', 제미나이는 'assistant'
      required: true,
    },
    message: {
      type: String,
      required: true, // 대화 내용
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);