import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Shared Gemini SDK client initialized with safety
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in the environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Bazi Reading Route
  app.post("/api/bazi-analyze", async (req, res) => {
    try {
      const { baziData } = req.body;
      if (!baziData) {
        return res.status(400).json({ error: "No Bazi data provided" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        return res.status(400).json({ 
          error: "未检测到有效的 GEMINI_API_KEY。请在 Google AI Studio 右上角点击 Settings -> Secrets，添加名为 GEMINI_API_KEY 的密钥（填入您的真实 Gemini API Key），然后再试一次。" 
        });
      }

      const client = getGeminiClient();
      
      const prompt = `
你是一位精通中国传统命理学（八字神煞、大运流年、格局强弱）的专业命理学大师。请基于以下排盘数据，为缘主提供全面、温和、客观的深度命理分析报告：

【基本信息】
- 性别：${baziData.gender}
- 公历生日：${baziData.birthTimeG}
- 真太阳时：${baziData.birthTimeLST} (出生地经度: ${baziData.longitude}°E, 城市: ${baziData.cityName})

【四柱乾坤（生辰八字）】
- 年柱：${baziData.fourPillars.year.stem.name}${baziData.fourPillars.year.branch.name} (十神: ${baziData.fourPillars.year.stem.tenGod || "无"}, 纳音: ${baziData.fourPillars.year.nayin}, 空亡: ${baziData.fourPillars.year.emptyVoid.join(", ") || "无"}, 神煞: ${baziData.fourPillars.year.shensha.join(", ") || "无"})
- 月柱：${baziData.fourPillars.month.stem.name}${baziData.fourPillars.month.branch.name} (十神: ${baziData.fourPillars.month.stem.tenGod || "无"}, 纳音: ${baziData.fourPillars.month.nayin}, 神煞: ${baziData.fourPillars.month.shensha.join(", ") || "无"})
- 日柱：${baziData.fourPillars.day.stem.name}${baziData.fourPillars.day.branch.name} (日主(天干): ${baziData.fourPillars.day.stem.name}, 纳音: ${baziData.fourPillars.day.nayin}, 空亡: ${baziData.fourPillars.day.emptyVoid.join(", ") || "无"}, 神煞: ${baziData.fourPillars.day.shensha.join(", ") || "无"})
- 时柱：${baziData.fourPillars.hour.stem.name}${baziData.fourPillars.hour.branch.name} (十神: ${baziData.fourPillars.hour.stem.tenGod || "无"}, 纳音: ${baziData.fourPillars.hour.nayin}, 神煞: ${baziData.fourPillars.hour.shensha.join(", ") || "无"})

【地支藏干】
- 年支藏干：${baziData.fourPillars.year.branch.hiddenStems.map((s: any) => `${s.name}(${s.tenGod})`).join(", ")}
- 月支藏干：${baziData.fourPillars.month.branch.hiddenStems.map((s: any) => `${s.name}(${s.tenGod})`).join(", ")}
- 日支藏干：${baziData.fourPillars.day.branch.hiddenStems.map((s: any) => `${s.name}(${s.tenGod})`).join(", ")}
- 时支藏干：${baziData.fourPillars.hour.branch.hiddenStems.map((s: any) => `${s.name}(${s.tenGod})`).join(", ")}

【大运气势】
- 起运年纪：${baziData.daYun.transitAgeDescription} (交运公历时间：${baziData.daYun.transitExactDate})
- 大运前列：${baziData.daYun.cycles.slice(0, 5).map((c: any) => `自${c.startAge}岁起行 [${c.stem}${c.branch}] 运(十神: ${c.tenGod}, 纳音: ${c.nayin}, 星运: ${c.changsheng})`).join("；")}

【当前运势流转（今日运学）】
- 当前流年：${baziData.flowingTime.year} (十神: ${baziData.flowingTime.yearTenGod}, 纳音: ${baziData.flowingTime.yearNayin})
- 当前流月：${baziData.flowingTime.month} (十神: ${baziData.flowingTime.monthTenGod})
- 当前流日：${baziData.flowingTime.day} (十神: ${baziData.flowingTime.dayTenGod})

请务必按照以下严谨、温馨、大器的模块输出一份结构精美的 Markdown 报告，不要胡乱编造，语言要富有国学韵味和哲学内涵：

1. 🌌 **命局格局与五行强弱分析**：详细剖析缘主的日主心性（如${baziData.fourPillars.day.stem.name}木/${baziData.fourPillars.day.stem.name}火等特点）、八字五行分布（金木水火土相对强弱），判定原局的燥湿寒暖与格局（如正印格、食神格、建禄格等），给出力气和调候用神、喜神、忌神建议。
2. 💫 **神煞印记与性格本源**：结合盘中的主要神煞（如天乙贵人、文昌贵人、驿马、桃花等）对性格、天资、精神世界进行细致解读。
3. 💼 **事业宏图与财运指南**：从十神财官禄位出发，分析事业适合方向（学术、企管、创意、商贸等）、财源状态、一生财运高低波动及守财建议。
4. 🩺 **健康关怀与平安指引**：依据五行盛衰，提供养生和身体器官预防保养指引。
5. 🗺️ **大运流年深度解惑与改运建议**：
   - 评点排盘中前列大运行运的起伏（哪段运势利事业，哪段利积累）。
   - 结合当前的流年（${baziData.flowingTime.year}）以及流日流月，给出应对当前运势时局的应对心境、趋利避害的修心建议。
   - 提供极具中国哲理的人生开导。

请用古典沉稳、鼓励乐观的语气回复，排版精美，擅用 Markdown 表格和区块。
`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error("Gemini analysis error:", error);
      res.status(500).json({ error: error.message || "AI Analysis Failed" });
    }
  });

  // Serve static dist folder in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
