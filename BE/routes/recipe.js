const express = require('express');
const router = express.Router();

const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const Recipe = require('../models/recipe');
const Chat = require('../models/chat');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate', async (req, res) => {
  try {
    const { userId, ingredients, message } = req.body;

    if (!userId || !ingredients || ingredients.length === 0) {
      return res.status(400).json({ success: false, message: "사용자 ID와 재료 데이터가 필요합니다." });
    }

    const ingredientList = ingredients.join(', ');
    const userMessage = message ? message : `냉장고에 ${ingredientList}이(가) 있어요. 뭐 해먹을 수 있을까요?`;

    await Chat.create({ userId: userId, sender: 'user', message: userMessage });

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
      systemInstruction: "너는 사용자가 제공한 재료만을 사용하여 최적의 레시피를 만드는 요리 블로그 셰프다. 제공되지 않은 주재료(채소, 고기 등)를 절대 임의로 추가하지 마라. 소금, 설탕, 간장 등 기본 양념은 자유롭게 사용 가능하다.",
    });

    const generationConfig = {
      temperature: 0.3,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "요리 이름" },
          content: { type: SchemaType.STRING, description: "전체 레시피 본문 (재료 준비, 상세 조리 단계 포함)" }
        },
        required: ["title", "content"]
      }
    };

    const prompt = `
      현재 냉장고에 있는 재료: ${ingredientList}
      사용자의 추가 요청사항: "${message ? message : '이 재료들로 만들 수 있는 맛있는 레시피를 추천해줘.'}"
      
      위 재료를 주재료로 활용하고, '사용자의 추가 요청사항'을 반드시 반영하여 정성스럽고 자세한 블로그 스타일의 레시피를 작성하라.
      
      조건:
      - 주어진 재료(${ingredientList})가 반드시 메인이 되어야 함.
      - 조리 과정은 5단계 이상으로 구체적으로 작성.
      - 요리 이름은 재료가 돋보이도록 지을 것.
      - 블로그 포스팅처럼 친절한 말투 유지.
      - 🌟 중요: 가독성을 위해 서론, 각 조리 단계, 결론 사이에 반드시 줄바꿈 문자(\\n\\n)를 넣어 단락을 확실하게 구분할 것. 조리 단계는 번호 매기기를 사용할 것.
    `;

    let recipeData;
    let maxRetries = 3;
    let delay = 1500;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig,
        });

        let responseText = result.response.text();
        

        responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        recipeData = JSON.parse(responseText); 
        
        break; 
      } catch (error) {
        console.log(`[시도 ${attempt}/${maxRetries}] 생성 또는 파싱 에러: ${error.message} (다시 시도합니다...)`);
        if (attempt === maxRetries) throw error; 
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    // 2. 레시피 DB 저장
    const newRecipe = new Recipe({
      title: recipeData.title,
      content: recipeData.content,
      userId: userId
    });
    const savedRecipe = await newRecipe.save();

    // 3. AI 응답 메시지 저장
    await Chat.create({
      userId: userId,
      sender: 'assistant',
      message: recipeData.content,
      title: recipeData.title 
    });

    // 4. 프론트엔드로 데이터 전송
    res.status(200).json({ 
      success: true, 
      title: recipeData.title, 
      content: recipeData.content,
      data: savedRecipe 
    });

  } catch (error) {
    console.error("Gemini API Error 최종 실패:", error);
    
    if (error.status === 503) {
      return res.status(503).json({ 
        success: false, 
        message: "현재 AI 셰프에게 주문이 너무 밀려있어요! 🧑‍🍳 잠시 후 다시 시도해주세요." 
      });
    }
    // 프론트엔드 앱이 죽지 않도록 친절한 에러 반환
    res.status(500).json({ success: false, message: "레시피 생성 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
});

module.exports = router;