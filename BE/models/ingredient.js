const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // 재료명
    },
    quantity: {
      type: Number,
      default: 1, // 개수
    },
    purchaseDate: {
      type: String,
      required: true, // 입고 날짜 (YYYY-MM-DD)
      //  한국 시간(UTC+9)으로 보정하여 현재 날짜를 YYYY-MM-DD 형식의 문자열로 변환
      default: () => {
        const now = new Date();
        const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
        return kst.toISOString().split("T")[0];
      },
    },
    expiry: {
      type: String,
      required: true, // 소비기한 (YYYY-MM-DD)
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // 소유 사용자
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ingredient", ingredientSchema);
