// node test.js 로 실행

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user"); // User 모델 경로 확인

// MongoDB 연결 URI (본인의 설정에 맞게 수정)
const MONGO_URI = process.env.DB_CONNECTION_STRING;

async function testDB() {
  try {
    // 1. DB 연결
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB 연결 성공!");

    // 2. 데이터 생성 (Create)
    const newUser = new User({
      name: "테스터",
      email: "test@example.com",
      password: "hashed_password_123",
    });
    await newUser.save();
    console.log("📝 데이터 저장 완료:", newUser.name);

    // 3. 데이터 조회 (Read)
    const user = await User.findOne({ email: "test@example.com" });
    console.log("🔍 저장된 데이터 확인:", user);

    // 4. 테스트 데이터 삭제 (Cleanup - 선택사항)
    // await User.deleteOne({ _id: user._id });
    // console.log("🗑️ 테스트 데이터 삭제 완료");
  } catch (error) {
    console.error("❌ 테스트 중 에러 발생:", error);
  } finally {
    // 5. 연결 종료
    mongoose.connection.close();
    console.log("🔌 연결 종료");
  }
}

testDB();
