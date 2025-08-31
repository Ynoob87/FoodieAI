import { Restaurant } from "@/types";

// 🍽️ AI 配置
const AI_CONFIG = {
  MAX_RECOMMENDATIONS: 5,
  MODEL: "gemini-1.5-flash",
  TEMPERATURE: 0.7, // 提高創造性，讓回應更自然
  MAX_TOKENS: 1500, // 增加 token 數量，讓回應更豐富
} as const;

// 🚀 使用 AI 推薦餐廳
export async function recommendRestaurantsWithAI(params: {
  restaurants: Restaurant[];
  userRequest: string;
  latitude: number;
  longitude: number;
  radius: number;
  userApiKey?: string;
}): Promise<{ ids: string[]; message: string } | null> {
  const { restaurants, userRequest, radius, userApiKey } = params;

  // 取得 API Key
  const apiKey =
    userApiKey ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("缺少 Gemini API Key");
    return null;
  }

  // 建立提示詞
  const prompt = `你是一個貼心的美食顧問，請幫使用者推薦最適合的餐廳。

使用者需求：${userRequest || "想要找好吃的餐廳"}
搜尋範圍：${(radius / 1000).toFixed(1)}km 內，找到 ${restaurants.length} 間餐廳

餐廳資料：
${restaurants
  .map(
    (r) => `
- ${r.name} (ID: ${r.id})
  - 地址：${r.address}
  - 評分：${r.rating}/5
  - 距離：${r.distance}km
  - 價格：${r.priceRange}
`
  )
  .join("")}

請從上述餐廳中選擇最適合的推薦，並回傳 JSON 格式：
{
  "restaurantIds": ["餐廳ID1", "餐廳ID2", "餐廳ID3"],
  "userMessage": "給使用者的友善建議，包含推薦的餐廳名稱和理由"
}

重要：
1. restaurantIds 必須是上面餐廳資料中的實際 ID
2. userMessage 要提到具體的餐廳名稱，但絕對不要顯示任何 ID
3. 推薦的餐廳數量建議 3-5 間
4. 根據使用者需求、評分、距離等因素進行推薦
5. 回應要像朋友聊天一樣自然友善
6. 包含實用建議，如用餐時間、預約建議、特色菜色等
7. 如果有特殊需求（如約會、聚餐、獨食），要特別考慮
8. 結尾要給出鼓勵性的話語
9. 重要：userMessage 中只能提到餐廳名稱，不能出現任何 ID 或技術性內容`;

  try {
    // 呼叫 Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: AI_CONFIG.TEMPERATURE,
          maxOutputTokens: AI_CONFIG.MAX_TOKENS,
        },
      }),
    });

    if (!response.ok) {
      console.error("Gemini API 錯誤:", response.status);
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    // 解析回應
    const result = parseAIResponse(text);
    if (!result) return null;

    return {
      ids: result.restaurantIds.slice(0, AI_CONFIG.MAX_RECOMMENDATIONS),
      message: result.userMessage,
    };
  } catch (error) {
    console.error("AI 推薦失敗:", error);
    return null;
  }
}

// 📊 解析 AI 回應
function parseAIResponse(
  response: string
): { restaurantIds: string[]; userMessage: string } | null {
  try {
    // 清理回應文字
    let cleanText = response.trim();

    // 提取 JSON 內容
    if (cleanText.includes("```json")) {
      const match = cleanText.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) cleanText = match[1].trim();
    }

    // 尋找 JSON
    const jsonStart = cleanText.indexOf("{");
    const jsonEnd = cleanText.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) return null;

    const jsonText = cleanText.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonText);

    // 驗證格式
    if (!parsed.restaurantIds || !Array.isArray(parsed.restaurantIds))
      return null;
    if (!parsed.userMessage || typeof parsed.userMessage !== "string")
      return null;

    return {
      restaurantIds: parsed.restaurantIds,
      userMessage: cleanMessage(parsed.userMessage),
    };
  } catch (error) {
    console.error("解析 AI 回應失敗:", error);
    return null;
  }
}

// 🧹 清理訊息格式
function cleanMessage(message: string): string {
  return message
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .trim();
}

// 🎯 隨機推薦
export async function getRandomRecommendation(params: {
  restaurants: Restaurant[];
  count?: number;
}): Promise<string[]> {
  const { restaurants, count = 3 } = params;

  if (restaurants.length === 0) return [];

  const shuffled = [...restaurants].sort(() => Math.random() - 0.5);
  return shuffled
    .slice(0, Math.min(count, restaurants.length))
    .map((r) => r.id);
}

// 🌟 增強 AI 回應品質
export function enhanceAIResponse(message: string): string {
  // 過濾掉任何 Google Place ID (通常是 ChIJ 開頭的長字串)
  let cleanMessage = message.replace(/ChIJ[a-zA-Z0-9_-]{20,}/g, "");

  // 過濾掉任何 ID 相關的文字
  cleanMessage = cleanMessage.replace(/ID:\s*[a-zA-Z0-9_-]+/g, "");
  cleanMessage = cleanMessage.replace(/\(ID:\s*[a-zA-Z0-9_-]+\)/g, "");

  // 如果回應太短，添加一些友善的內容
  if (cleanMessage.length < 100) {
    return `${cleanMessage}\n\n💡 小提醒：建議您提前預約，特別是熱門時段。祝您用餐愉快！`;
  }

  // 如果沒有結尾鼓勵語，添加一個
  if (
    !cleanMessage.includes("祝您") &&
    !cleanMessage.includes("希望") &&
    !cleanMessage.includes("祝")
  ) {
    return `${cleanMessage}\n\n🎉 希望這些推薦能幫助您找到心儀的餐廳！`;
  }

  return cleanMessage;
}
