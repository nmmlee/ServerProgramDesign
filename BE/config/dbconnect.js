const mongoose = require("mongoose");
require("dotenv").config();

// async, await
const dbConnect = async () => {
  try {
    // db 접속 경로를 설정(process.env는 env파일 안에 있는 무언가를 가져오게 해줌)
    const connect = await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log("DB Connected");
  } catch (err) {
    console.log(err);
  }
};

module.exports = dbConnect;
