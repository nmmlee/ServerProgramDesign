  // routes/recipe.js 상단
  const express = require('express');
  const router = express.Router();
  const { GoogleGenerativeAI } = require('@google/generative-ai');

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

      // 1. 사용자 메시지 저장
      await Chat.create({
        userId: userId,
        sender: 'user',
        message: userMessage
      });

      // 모델 설정 시 systemInstruction을 추가하여 AI의 페르소나를 강력하게 고정합니다.
      const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        systemInstruction: "너는 사용자가 제공한 재료만을 사용하여 최적의 레시피를 만드는 요리 블로그 셰프다. 제공되지 않은 주재료(채소, 고기 등)를 절대 임의로 추가하지 마라. 소금, 설탕, 간장 등 기본 양념은 자유롭게 사용 가능하다.",
      });

      // 답변의 일관성을 위해 temperature를 낮추고 JSON 모드를 활성화합니다.
      const generationConfig = {
        temperature: 0.3, // 낮을수록 엉뚱한 답변(환각)이 줄어듭니다.
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      };

      const prompt = `
        현재 냉장고에 있는 재료: ${ingredientList}
        
        위 재료를 주재료로 활용한 정성스럽고 자세한 블로그 스타일의 레시피를 작성하라.
        
        조건:
        - 주어진 재료(${ingredientList})가 반드시 메인이 되어야 함.
        - 조리 과정은 5단계 이상으로 구체적으로 작성.
        - 요리 이름은 재료가 돋보이도록 지을 것.
        - 블로그 포스팅처럼 친절한 말투 유지.

        반드시 아래 JSON 형식으로만 응답:
        {
          "title": "요리 이름",
          "content": "전체 레시피 본문 (재료 준비, 상세 조리 단계 포함)"
        }
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });

      const responseText = result.response.text();
      const recipeData = JSON.parse(responseText);

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
      console.error("Gemini API Error:", error);
      res.status(500).json({ success: false, message: "레시피 생성 중 서버 오류가 발생했습니다." });
    }
  });

  module.exports = router;