const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // 레시피 이름
    },
    content: {
      type: String,
      required: true, // 레시피 전문
    },
    savedAt: {
      type: String, // ISO string
      default: () => new Date().toISOString(),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // 소유 사용자
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Recipe", recipeSchema);
