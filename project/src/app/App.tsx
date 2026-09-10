import { useState } from "react";
import {
  Search, Star, MessageSquare, Bookmark, Plus, LogIn, LogOut,
  Copy, Shield, Users, BarChart2, Settings, Bell, Filter, TrendingUp,
  Eye, AlertCircle, Check, ArrowLeft, ToggleLeft, ToggleRight, Zap,
  Bot, Brain, Code2, BookOpen, Lightbulb, PenTool, Globe, Flame,
  Puzzle, FolderHeart, UserRound, MessageCircleQuestion, Share2,
  Lock, Unlock, X, BadgeCheck, Layers, ChevronDown,
  HelpCircle, ThumbsUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "feed" | "login" | "create" | "admin" | "detail" | "collections" | "profile" | "requests";
type Role = "guest" | "user" | "admin";
type AIModel = "Claude" | "ChatGPT" | "Gemini" | "Llama" | "Midjourney" | "Stable Diffusion";

interface Prompt {
  id: number;
  postType: "prompt" | "fragment";
  fragmentLabel?: string;
  title: string;
  titleTh: string;
  body: string;
  tags: string[];
  author: string;
  models: AIModel[];
  stars: number;
  comments: number;
  views: number;
  weeklyStars: number;
  weeklyCopies: number;
  starred: boolean;
  bookmarked: boolean;
  allowStars: boolean;
  allowComments: boolean;
  status: "active" | "flagged" | "hidden";
  createdAt: string;
  category: string;
  imageStyle?: string;
}

interface Collection {
  id: number;
  name: string;
  icon: string;
  color: string;
  promptIds: number[];
  isPublic: boolean;
}

interface RequestReply {
  id: number;
  author: string;
  body: string;
  attachedPromptId?: number;
  createdAt: string;
}

interface Request {
  id: number;
  title: string;
  body: string;
  category: string;
  author: string;
  createdAt: string;
  replies: RequestReply[];
  bestReplyId?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["ทั้งหมด", "การเขียน", "โปรแกรมมิ่ง", "การตลาด", "กฎหมาย", "การศึกษา", "ข้อมูล", "การเจนภาพ"];
const IMAGE_SUBTAGS = ["ทุกสไตล์", "Realistic", "Anime", "Illustration", "3D Render", "Pixel Art", "Photography", "Concept Art"];
const AI_MODELS: AIModel[] = ["Claude", "ChatGPT", "Gemini", "Llama", "Midjourney", "Stable Diffusion"];

const FRAGMENT_LABELS = ["กำหนด Tone", "กำหนด Format ผลลัพธ์", "เพิ่ม Context", "จำกัดความยาว", "กำหนด Persona", "เพิ่ม Constraint", "กำหนดภาษา", "ตั้งค่า Output"];

const MODEL_COLORS: Record<AIModel, string> = {
  "Claude":            "text-orange-400 bg-orange-400/10 border-orange-400/25",
  "ChatGPT":           "text-green-400 bg-green-400/10 border-green-400/25",
  "Gemini":            "text-blue-400 bg-blue-400/10 border-blue-400/25",
  "Llama":             "text-purple-400 bg-purple-400/10 border-purple-400/25",
  "Midjourney":        "text-pink-400 bg-pink-400/10 border-pink-400/25",
  "Stable Diffusion":  "text-sky-400 bg-sky-400/10 border-sky-400/25",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "การเขียน":    <PenTool size={13} />,
  "โปรแกรมมิ่ง": <Code2 size={13} />,
  "การตลาด":    <TrendingUp size={13} />,
  "กฎหมาย":     <BookOpen size={13} />,
  "การศึกษา":   <Lightbulb size={13} />,
  "ข้อมูล":     <BarChart2 size={13} />,
  "การเจนภาพ":  <Globe size={13} />,
};

const IMAGE_STYLE_COLORS: Record<string, string> = {
  "Realistic":    "text-sky-400 bg-sky-400/10 border-sky-400/25",
  "Anime":        "text-pink-400 bg-pink-400/10 border-pink-400/25",
  "Illustration": "text-violet-400 bg-violet-400/10 border-violet-400/25",
  "3D Render":    "text-amber-400 bg-amber-400/10 border-amber-400/25",
  "Pixel Art":    "text-lime-400 bg-lime-400/10 border-lime-400/25",
  "Photography":  "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  "Concept Art":  "text-rose-400 bg-rose-400/10 border-rose-400/25",
};

const COLLECTION_PRESETS = [
  { icon: "📚", color: "#7c6ef5" }, { icon: "🚀", color: "#00c9a7" },
  { icon: "💡", color: "#f59e0b" }, { icon: "🎨", color: "#e03e8c" },
  { icon: "🔧", color: "#3b82f6" }, { icon: "📝", color: "#10b981" },
];

const ADMIN_STATS = {
  totalPrompts: 342, totalUsers: 1284, totalStars: 18420,
  weeklyGrowth: [14, 22, 18, 35, 29, 41, 38],
  topCategories: [
    { name: "โปรแกรมมิ่ง", count: 98 }, { name: "การเขียน", count: 74 },
    { name: "การศึกษา", count: 61 }, { name: "การตลาด", count: 55 },
    { name: "ข้อมูล", count: 33 },
  ],
};

const SAMPLE_COMMENTS = [
  { id: 1, author: "ปริยา ก.", body: "ใช้แล้วได้ผลดีมากเลยครับ ขอบคุณที่แชร์!", time: "2 ชั่วโมงที่แล้ว" },
  { id: 2, author: "วิชัย ส.", body: "สามารถปรับให้ใช้กับ Claude ได้ไหมครับ?", time: "1 วันที่แล้ว" },
  { id: 3, author: "มาลี ท.", body: "เพิ่ม context เกี่ยวกับกลุ่มเป้าหมายด้วยนะคะ จะได้ผลลัพธ์ดีขึ้น", time: "2 วันที่แล้ว" },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_PROMPTS: Prompt[] = [
  { id: 1, postType: "prompt", title: "Thai Story Writer", titleTh: "นักเขียนเรื่องสั้นภาษาไทย", body: "คุณคือนักเขียนเรื่องสั้นภาษาไทยผู้เชี่ยวชาญ ช่วยสร้างเรื่องราวในแนว[ประเภทเรื่อง] สำหรับ[กลุ่มผู้อ่าน] ที่มีความลึกซึ้งทางอารมณ์ บรรยายฉาก ตัวละคร และความรู้สึกอย่างละเอียด ความยาวประมาณ[ความยาว]", tags: ["เขียนสร้างสรรค์", "ภาษาไทย", "เรื่องสั้น"], author: "สมชาย ว.", models: ["Claude"], stars: 248, comments: 34, views: 1820, weeklyStars: 42, weeklyCopies: 87, starred: false, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-18", category: "การเขียน" },
  { id: 2, postType: "prompt", title: "Code Reviewer TH", titleTh: "ผู้ตรวจโค้ดภาษาไทย", body: "Act as a senior software engineer. Review the provided [language] code in Thai. Point out bugs, security vulnerabilities, and performance issues. Suggest improvements with code examples. Be specific and constructive.", tags: ["programming", "code-review", "Thai"], author: "ปริยา ก.", models: ["ChatGPT", "Claude"], stars: 412, comments: 61, views: 3540, weeklyStars: 78, weeklyCopies: 145, starred: true, bookmarked: true, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-15", category: "โปรแกรมมิ่ง" },
  { id: 3, postType: "prompt", title: "Marketing Copy Thai", titleTh: "เขียนโฆษณาภาษาไทย", body: "คุณเป็นนักเขียนโฆษณาชาวไทยมืออาชีพ สร้างข้อความทางการตลาดสำหรับ[สินค้า/บริการ] ที่โดนใจ[กลุ่มเป้าหมาย] ใช้ภาษาที่กระตุ้นอารมณ์ สร้างความน่าเชื่อถือ ในสไตล์[โทนการสื่อสาร]", tags: ["การตลาด", "โฆษณา", "คัดลอก"], author: "วิชัย ส.", models: ["Gemini"], stars: 183, comments: 22, views: 1240, weeklyStars: 31, weeklyCopies: 60, starred: false, bookmarked: false, allowStars: true, allowComments: false, status: "active", createdAt: "2024-06-12", category: "การตลาด" },
  { id: 4, postType: "prompt", title: "Thai Legal Drafter", titleTh: "ร่างเอกสารกฎหมาย", body: "คุณเป็นทนายความผู้เชี่ยวชาญด้านกฎหมายไทย ช่วยร่าง[ประเภทเอกสาร] โดยใช้ภาษากฎหมายที่ถูกต้องตามมาตรฐาน ครอบคลุมทุกประเด็นสำคัญ คู่สัญญา ได้แก่ [ฝ่ายที่ 1] และ [ฝ่ายที่ 2]", tags: ["กฎหมาย", "สัญญา", "เอกสาร"], author: "นภา ร.", models: ["Claude"], stars: 97, comments: 11, views: 780, weeklyStars: 18, weeklyCopies: 33, starred: false, bookmarked: true, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-10", category: "กฎหมาย" },
  { id: 5, postType: "prompt", title: "Thai Teacher Assistant", titleTh: "ผู้ช่วยครูไทย", body: "คุณเป็นครูไทยผู้มีประสบการณ์สูง ช่วยอธิบายบทเรียนวิชา[วิชา] ระดับ[ระดับชั้น] ในรูปแบบที่เข้าใจง่าย ยกตัวอย่างที่เกี่ยวข้องกับชีวิตประจำวัน", tags: ["การศึกษา", "สอน", "ครู"], author: "มาลี ท.", models: ["Claude", "ChatGPT", "Gemini"], stars: 331, comments: 47, views: 2650, weeklyStars: 55, weeklyCopies: 120, starred: false, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-08", category: "การศึกษา" },
  { id: 6, postType: "prompt", title: "Data Analyst TH", titleTh: "วิเคราะห์ข้อมูลไทย", body: "You are a senior data analyst. Analyze the provided dataset about [ข้อมูลเกี่ยวกับ] and generate insights in Thai. Create executive summaries, identify trends, anomalies, and actionable recommendations.", tags: ["data", "analytics", "Thai"], author: "ธนา ป.", models: ["Llama"], stars: 156, comments: 19, views: 1100, weeklyStars: 24, weeklyCopies: 47, starred: false, bookmarked: false, allowStars: false, allowComments: true, status: "flagged", createdAt: "2024-06-05", category: "ข้อมูล" },
  { id: 7, postType: "prompt", title: "Thai Resume Writer", titleTh: "เขียน Resume ภาษาไทย", body: "คุณเป็นผู้เชี่ยวชาญด้าน HR ช่วยเขียน Resume สำหรับตำแหน่ง[ตำแหน่งงาน] ในอุตสาหกรรม[อุตสาหกรรม] โดยเน้นประสบการณ์และทักษะที่เกี่ยวข้อง", tags: ["resume", "สมัครงาน", "HR"], author: "กัญญา บ.", models: ["ChatGPT"], stars: 274, comments: 38, views: 2100, weeklyStars: 46, weeklyCopies: 95, starred: false, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-20", category: "การเขียน" },
  { id: 8, postType: "prompt", title: "Python Tutor TH", titleTh: "ครูสอน Python ภาษาไทย", body: "คุณเป็นครูสอน Python ที่อธิบายเป็นภาษาไทยได้อย่างชัดเจน ช่วยสอนเรื่อง[หัวข้อ] ระดับ[ระดับ] ใช้ตัวอย่างที่เข้าใจง่าย", tags: ["python", "เขียนโปรแกรม", "สอน"], author: "อนุชา ม.", models: ["Claude", "ChatGPT"], stars: 389, comments: 55, views: 3200, weeklyStars: 67, weeklyCopies: 130, starred: false, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-19", category: "โปรแกรมมิ่ง" },
  { id: 9, postType: "prompt", title: "Social Media Caption TH", titleTh: "เขียน Caption โซเชียล", body: "คุณเป็นผู้เชี่ยวชาญ Social Media Marketing ช่วยเขียน Caption สำหรับ[แพลตฟอร์ม] เกี่ยวกับ[หัวข้อ] ให้โดนใจ[กลุ่มเป้าหมาย]", tags: ["โซเชียล", "caption", "Instagram", "TikTok"], author: "ฝัน ค.", models: ["Gemini", "ChatGPT"], stars: 512, comments: 73, views: 4100, weeklyStars: 98, weeklyCopies: 210, starred: true, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-21", category: "การตลาด" },
  { id: 10, postType: "prompt", title: "Thai Debate Coach", titleTh: "โค้ชการโต้วาที", body: "คุณเป็นโค้ชการโต้วาทีและการพูดในที่สาธารณะ ช่วยฝึกการโต้แย้งอย่างมีเหตุผล ในหัวข้อ[หัวข้อการโต้วาที] ฝ่าย[ฝ่าย]", tags: ["โต้วาที", "การพูด", "ทักษะ"], author: "ภูมิ ว.", models: ["Claude", "ChatGPT", "Gemini"], stars: 143, comments: 17, views: 890, weeklyStars: 22, weeklyCopies: 41, starred: false, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-17", category: "การศึกษา" },
  { id: 11, postType: "prompt", title: "SQL Query Builder TH", titleTh: "สร้าง SQL Query อธิบายไทย", body: "You are a database expert. Help write, optimize, and explain SQL queries in Thai. I need to [สิ่งที่ต้องการ] from table [ชื่อตาราง] with conditions [เงื่อนไข].", tags: ["SQL", "database", "โปรแกรมมิ่ง"], author: "ณัฐ ส.", models: ["ChatGPT", "Claude"], stars: 298, comments: 41, views: 2450, weeklyStars: 51, weeklyCopies: 100, starred: false, bookmarked: true, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-14", category: "โปรแกรมมิ่ง" },
  { id: 12, postType: "prompt", title: "Thai Financial Planner", titleTh: "วางแผนการเงินส่วนตัว", body: "คุณเป็นที่ปรึกษาทางการเงินส่วนตัว ช่วยวางแผนการเงินสำหรับ[เป้าหมาย] ด้วยรายได้ต่อเดือน[รายได้] บาท ค่าใช้จ่ายประจำ[ค่าใช้จ่าย] บาท", tags: ["การเงิน", "ลงทุน", "ออม"], author: "จิรา พ.", models: ["Gemini"], stars: 367, comments: 49, views: 2980, weeklyStars: 63, weeklyCopies: 122, starred: false, bookmarked: false, allowStars: true, allowComments: false, status: "active", createdAt: "2024-06-11", category: "ข้อมูล" },
  { id: 13, postType: "prompt", title: "Contract Review TH", titleTh: "ตรวจสอบสัญญาภาษาไทย", body: "คุณเป็นทนายความผู้เชี่ยวชาญตรวจสอบสัญญาภาษาไทย ระบุข้อความที่เสี่ยง ช่องโหว่ทางกฎหมาย และข้อกำหนดที่ไม่เป็นธรรมในสัญญา[ประเภทสัญญา]", tags: ["กฎหมาย", "สัญญา", "ตรวจสอบ"], author: "สุรชัย อ.", models: ["Claude"], stars: 201, comments: 26, views: 1560, weeklyStars: 34, weeklyCopies: 70, starred: false, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-09", category: "กฎหมาย" },
  { id: 14, postType: "prompt", title: "Thai Poem Generator", titleTh: "แต่งกลอนภาษาไทย", body: "คุณเป็นกวีภาษาไทยผู้เชี่ยวชาญ แต่ง[ประเภทกลอน] เกี่ยวกับ[หัวข้อ] ในอารมณ์[อารมณ์] โดยรักษาฉันทลักษณ์และสัมผัสที่งดงาม", tags: ["กลอน", "กวี", "วรรณกรรม"], author: "อรอุมา ล.", models: ["Claude", "ChatGPT"], stars: 445, comments: 62, views: 3600, weeklyStars: 74, weeklyCopies: 155, starred: false, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-22", category: "การเขียน" },
  { id: 15, postType: "prompt", title: "UX Feedback TH", titleTh: "วิจารณ์ UX/UI ภาษาไทย", body: "You are a senior UX designer. Review the provided UI for [ชื่อแอป/หน้า] and give detailed feedback in Thai covering usability, visual hierarchy, accessibility, and specific improvement suggestions.", tags: ["UX", "UI", "design", "feedback"], author: "พิชา ร.", models: ["Llama", "ChatGPT"], stars: 178, comments: 23, views: 1340, weeklyStars: 29, weeklyCopies: 58, starred: false, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-16", category: "โปรแกรมมิ่ง" },
  { id: 16, postType: "prompt", title: "Anime Portrait Generator", titleTh: "เจนรูปอนิเมะ Midjourney", body: "A beautiful [คำอธิบายตัวละคร], anime art style, Studio Ghibli inspired, soft watercolor background, expressive eyes, flowing hair, warm golden hour lighting, highly detailed, 4K, masterpiece --ar 2:3 --style raw --v 6", tags: ["Midjourney", "portrait", "อนิเมะ"], author: "ฝัน ค.", models: ["Midjourney"], stars: 631, comments: 84, views: 5200, weeklyStars: 120, weeklyCopies: 280, starred: true, bookmarked: true, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-23", category: "การเจนภาพ", imageStyle: "Anime" },
  { id: 17, postType: "prompt", title: "Hyperrealistic Portrait", titleTh: "ภาพถ่ายจริง Ultra HD", body: "Photorealistic portrait of [subject], shot with Sony A7R V, 85mm f/1.4 lens, natural daylight, shallow depth of field, ultra sharp focus, skin texture detail, cinematic color grading, 8K resolution --ar 3:4 --style raw --v 6.1", tags: ["Midjourney", "Stable Diffusion", "portrait"], author: "ณัฐ ส.", models: ["Midjourney", "Stable Diffusion"], stars: 445, comments: 57, views: 3800, weeklyStars: 85, weeklyCopies: 172, starred: false, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-22", category: "การเจนภาพ", imageStyle: "Realistic" },
  { id: 18, postType: "prompt", title: "Thai Temple Concept Art", titleTh: "Concept Art วัดไทยแฟนตาซี", body: "Epic fantasy Thai temple floating in the clouds, [สภาพแวดล้อม], ancient architecture with golden spires, lotus flowers, magical blue light rays, volumetric fog, concept art style, ArtStation trending --ar 16:9 --v 6", tags: ["concept art", "วัดไทย", "แฟนตาซี"], author: "อนุชา ม.", models: ["Midjourney"], stars: 389, comments: 46, views: 3100, weeklyStars: 66, weeklyCopies: 134, starred: false, bookmarked: true, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-21", category: "การเจนภาพ", imageStyle: "Concept Art" },
  { id: 19, postType: "prompt", title: "3D Product Render", titleTh: "เรนเดอร์สินค้า 3D", body: "3D render of [ชื่อสินค้า], on a minimalist [สีพื้นหลัง] studio background, soft shadow, professional product photography lighting, octane render, ultra realistic material, commercial advertisement quality --ar 1:1 --v 6", tags: ["3D", "product", "commercial"], author: "กัญญา บ.", models: ["Midjourney", "Stable Diffusion"], stars: 276, comments: 31, views: 2200, weeklyStars: 48, weeklyCopies: 95, starred: false, bookmarked: false, allowStars: true, allowComments: false, status: "active", createdAt: "2024-06-20", category: "การเจนภาพ", imageStyle: "3D Render" },
  { id: 20, postType: "prompt", title: "Thai Street Pixel Art", titleTh: "Pixel Art ถนนไทย", body: "Pixel art scene of a busy [สถานที่] street at [เวลา], neon signs in Thai script, tuk-tuk, street food stalls, warm orange lanterns, 16-bit SNES style, 64x64 tile, vibrant colors, retro game aesthetic", tags: ["pixel art", "Bangkok", "retro"], author: "ภูมิ ว.", models: ["Stable Diffusion"], stars: 512, comments: 68, views: 4300, weeklyStars: 95, weeklyCopies: 200, starred: true, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-19", category: "การเจนภาพ", imageStyle: "Pixel Art" },
  { id: 21, postType: "prompt", title: "Watercolor Illustration TH", titleTh: "ภาพ Illustration สีน้ำ", body: "Delicate watercolor illustration of [subject], soft [สีหลัก] pastel palette, loose brushstrokes, white paper texture showing through, botanical elements, dreamy atmosphere, Japanese watercolor style --ar 4:5 --v 6", tags: ["illustration", "watercolor", "สีน้ำ"], author: "อรอุมา ล.", models: ["Midjourney", "Stable Diffusion"], stars: 334, comments: 42, views: 2700, weeklyStars: 58, weeklyCopies: 116, starred: false, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-18", category: "การเจนภาพ", imageStyle: "Illustration" },
  // Fragments
  { id: 100, postType: "fragment", fragmentLabel: "กำหนด Tone", title: "Professional Tone", titleTh: "โทน Professional & น่าเชื่อถือ", body: "ใช้ภาษาที่เป็นทางการ กระชับ ชัดเจน น่าเชื่อถือ หลีกเลี่ยงคำแสลงและภาษาไม่เป็นทางการ ทุกประโยคต้องอ่านแล้วรู้สึกถึงความเป็นมืออาชีพ", tags: ["tone", "professional", "formal"], author: "สมชาย ว.", models: ["Claude", "ChatGPT", "Gemini"], stars: 89, comments: 12, views: 650, weeklyStars: 18, weeklyCopies: 45, starred: false, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-22", category: "การเขียน" },
  { id: 101, postType: "fragment", fragmentLabel: "กำหนด Format ผลลัพธ์", title: "Bullet Point Output", titleTh: "ผลลัพธ์เป็น Bullet Points", body: "แสดงผลลัพธ์ทั้งหมดในรูปแบบ bullet points ที่กระชับ แต่ละ bullet ไม่เกิน 1 บรรทัด จัดกลุ่มหัวข้อหลักด้วย **หัวข้อ** ก่อนรายการย่อย", tags: ["format", "bullet", "output"], author: "ปริยา ก.", models: ["Claude", "ChatGPT", "Gemini", "Llama"], stars: 134, comments: 18, views: 980, weeklyStars: 27, weeklyCopies: 68, starred: false, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-21", category: "การเขียน" },
  { id: 102, postType: "fragment", fragmentLabel: "จำกัดความยาว", title: "Concise 100 Words", titleTh: "จำกัด 100 คำ กระชับ", body: "ตอบให้กระชับที่สุด ความยาวไม่เกิน 100 คำ ตัดส่วนที่ไม่จำเป็นออก เน้นใจความสำคัญเท่านั้น ถ้าเกินให้สรุปให้สั้นลง", tags: ["length", "concise", "short"], author: "วิชัย ส.", models: ["Claude", "ChatGPT", "Gemini", "Llama"], stars: 76, comments: 9, views: 520, weeklyStars: 14, weeklyCopies: 35, starred: false, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-20", category: "การเขียน" },
  { id: 103, postType: "fragment", fragmentLabel: "เพิ่ม Context", title: "Thai Market Context", titleTh: "Context ตลาดไทย", body: "คำนึงถึงบริบทของตลาดไทยเสมอ: วัฒนธรรมไทย ความเชื่อท้องถิ่น พฤติกรรมผู้บริโภคชาวไทย กฎหมายไทย และแนวโน้มตลาดปัจจุบันในประเทศไทย", tags: ["context", "Thailand", "local"], author: "มาลี ท.", models: ["Claude", "ChatGPT", "Gemini"], stars: 58, comments: 7, views: 410, weeklyStars: 11, weeklyCopies: 28, starred: false, bookmarked: false, allowStars: true, allowComments: true, status: "active", createdAt: "2024-06-19", category: "การตลาด" },
];

const INITIAL_COLLECTIONS: Collection[] = [
  { id: 1, name: "ชุดติวสอบ", icon: "📚", color: "#7c6ef5", promptIds: [5, 10], isPublic: true },
  { id: 2, name: "Marketing Kit", icon: "📣", color: "#f59e0b", promptIds: [3, 9, 7], isPublic: false },
];

const INITIAL_REQUESTS: Request[] = [
  {
    id: 1, title: "ขอ Prompt สรุป Meeting Notes ภาษาไทย", body: "ต้องการ prompt ที่แปลง meeting notes ภาษาอังกฤษให้เป็นสรุปภาษาไทยแบบ bullet point พร้อม action items และผู้รับผิดชอบ", category: "การทำงาน", author: "สมชาย ว.", createdAt: "2024-06-23",
    replies: [{ id: 1, author: "ปริยา ก.", body: "ลองใช้ prompt Code Reviewer TH ดัดแปลงได้นะคะ", attachedPromptId: 2, createdAt: "2024-06-23" }], bestReplyId: 1,
  },
  {
    id: 2, title: "ต้องการ Prompt เขียน Email ปฏิเสธอย่างสุภาพ", body: "อยากได้ prompt ที่ช่วยเขียน email ปฏิเสธการเชิญ/ข้อเสนอต่างๆ อย่างสุภาพในบริบทธุรกิจไทย", category: "การเขียน", author: "กัญญา บ.", createdAt: "2024-06-22",
    replies: [{ id: 2, author: "วิชัย ส.", body: "ลองเอา Fragment tone professional ไปใส่กับ prompt เขียนของเดิมดูครับ", createdAt: "2024-06-22" }], bestReplyId: undefined,
  },
  {
    id: 3, title: "ขอ Prompt วิเคราะห์คู่แข่ง SWOT ภาษาไทย", body: "ต้องการ prompt ที่ช่วยวิเคราะห์ SWOT ของคู่แข่งในตลาดไทย ครอบคลุมทั้ง Product, Price, Place, Promotion", category: "การตลาด", author: "ธนา ป.", createdAt: "2024-06-21",
    replies: [], bestReplyId: undefined,
  },
  {
    id: 4, title: "Prompt ช่วยออกแบบ Database Schema", body: "ต้องการ prompt ที่ช่วย design database schema จาก requirements ภาษาไทย พร้อม ER diagram เป็น text และ SQL DDL", category: "โปรแกรมมิ่ง", author: "อนุชา ม.", createdAt: "2024-06-20",
    replies: [{ id: 4, author: "ณัฐ ส.", body: "SQL Query Builder TH ของผมปรับใช้ได้ครับ แค่เพิ่ม schema design ใน prompt", attachedPromptId: 11, createdAt: "2024-06-20" }], bestReplyId: 4,
  },
];

// ─── UI Primitives ────────────────────────────────────────────────────────────

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap" style={{ background: "#DCEEE8", color: "#1F6F58", border: "1px solid #B8DDD3" }}>
      {label}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", className = "", disabled = false }: {
  children: React.ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "outline" | "danger" | "subtle";
  size?: "sm" | "md"; className?: string; disabled?: boolean;
}) {
  const base = "inline-flex items-center gap-1.5 font-medium rounded transition-all duration-150 cursor-pointer disabled:opacity-40";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-black/[0.04]",
    outline: "border border-border text-foreground hover:bg-black/[0.04]",
    danger: "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20",
    subtle: "bg-black/[0.04] text-muted-foreground hover:bg-black/[0.06] hover:text-foreground",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#00c9a7", "#7c6ef5", "#f59e0b", "#e03e8c", "#3b82f6"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
      style={{ width: size, height: size, background: color, color: "#FFFFFF", fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>
      {initials}
    </div>
  );
}

function ModelBadges({ models }: { models: AIModel[] }) {
  const show = models.slice(0, 2);
  const rest = models.length - 2;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {show.map(m => (
        <span key={m} className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${MODEL_COLORS[m]}`}>{m}</span>
      ))}
      {rest > 0 && <span className="text-[10px] font-mono text-muted-foreground">+{rest}</span>}
    </div>
  );
}

function SavePicker({ promptId, collections, bookmarked, onToggleBookmark, onToggle, onClose }: {
  promptId: number; collections: Collection[]; bookmarked: boolean;
  onToggleBookmark: () => void; onToggle: (colId: number) => void; onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-8 z-30 w-56 bg-popover border border-border rounded-xl shadow-2xl p-2" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-2 py-1 mb-1">
        <span className="text-xs text-muted-foreground font-mono">บันทึก</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={12} /></button>
      </div>
      <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/[0.04] text-sm text-left transition-colors"
        onClick={onToggleBookmark}>
        <Bookmark size={14} className={bookmarked ? "text-primary" : "text-muted-foreground"} fill={bookmarked ? "currentColor" : "none"} />
        <span className="flex-1 text-foreground">บันทึกไว้ดูภายหลัง</span>
        {bookmarked && <Check size={12} className="text-primary flex-shrink-0" />}
      </button>
      <div className="h-px bg-border my-1.5" />
      <div className="px-2 pb-1 text-[11px] text-muted-foreground font-mono">เพิ่มเข้าชุด</div>
      {collections.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">ยังไม่มีชุด</p>
      ) : (
        collections.map(col => {
          const inCol = col.promptIds.includes(promptId);
          return (
            <button key={col.id} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/[0.04] text-sm text-left transition-colors"
              onClick={() => onToggle(col.id)}>
              <span>{col.icon}</span>
              <span className="flex-1 text-foreground truncate">{col.name}</span>
              {inCol && <Check size={12} className="text-primary flex-shrink-0" />}
            </button>
          );
        })
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ role, screen, setScreen, setRole, search, setSearch }: {
  role: Role; screen: Screen; setScreen: (s: Screen) => void; setRole: (r: Role) => void;
  search: string; setSearch: (v: string) => void;
}) {
  return (
    <header className="sticky top-0 z-50 flex items-center gap-4 px-5 h-16 border-b border-border bg-background/80 backdrop-blur-md">
      <button className="flex items-center gap-2 flex-shrink-0 hover:opacity-85 transition-opacity" onClick={() => setScreen("feed")}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "linear-gradient(135deg, #E8A33D 0%, #4B3F72 100%)" }}>
          <Zap size={18} className="text-white" fill="currentColor" />
        </div>
        <span className="hidden sm:inline font-extrabold text-xl tracking-tight">
          <span style={{ color: "var(--accent)" }}>Thai</span><span style={{ color: "var(--primary)" }}>PromptHub</span>
        </span>
      </button>

      <div className="relative flex-1 max-w-xl mx-auto">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full pl-11 pr-4 py-2.5 text-base bg-secondary border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="ค้นหา Prompt เช่น เขียนแคปชั่น, สรุปงาน..."
          value={search}
          onChange={e => { setSearch(e.target.value); if (screen !== "feed") setScreen("feed"); }}
        />
      </div>

      <nav className="hidden lg:flex items-center gap-0.5 flex-shrink-0">
        <button className={`px-3 py-1.5 text-sm rounded transition-colors ${screen === "requests" ? "text-foreground bg-black/[0.07]" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setScreen("requests")}>ขอ Prompt</button>
        {role !== "guest" && <button className={`px-3 py-1.5 text-sm rounded transition-colors ${screen === "collections" ? "text-foreground bg-black/[0.07]" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setScreen("collections")}>ชุดของฉัน</button>}
        {role === "admin" && <button className={`px-3 py-1.5 text-sm rounded transition-colors ${screen === "admin" ? "text-foreground bg-black/[0.07]" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setScreen("admin")}>Admin</button>}
      </nav>

      <div className="flex items-center gap-2 flex-shrink-0">
        {role === "guest" ? (
          <Btn variant="primary" size="md" className="!rounded-full" onClick={() => setScreen("login")}><LogIn size={14} /> เข้าสู่ระบบ</Btn>
        ) : (
          <div className="flex items-center gap-2">
            <Btn variant="primary" size="md" className="!rounded-full" onClick={() => setScreen("create")}><Plus size={14} /> สร้าง Prompt</Btn>
            <button className="relative p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors">
              <Bell size={16} /><span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
            <Avatar name={role === "admin" ? "Admin TH" : "สมชาย ว."} size={28} />
            <Btn variant="ghost" size="sm" onClick={() => { setRole("guest"); setScreen("feed"); }}><LogOut size={13} /></Btn>
          </div>
        )}
      </div>
    </header>
  );
}

// ─── Prompt Card ──────────────────────────────────────────────────────────────

function PromptCard({ prompt, role, onStar, onBookmark, onClick, onAuthorClick, collections, onToggleCollection }: {
  prompt: Prompt; role: Role; onStar: () => void; onBookmark: () => void; onClick: () => void;
  onAuthorClick: () => void; collections: Collection[]; onToggleCollection: (colId: number) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showColPicker, setShowColPicker] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const isFragment = prompt.postType === "fragment";

  return (
    <div className={`group relative flex items-center gap-4 p-4 rounded-xl border bg-card transition-all duration-200 cursor-pointer ${isFragment ? "border-violet-500/20 hover:border-violet-500/40" : "border-border hover:border-black/10 hover:bg-black/[0.02]"}`}
      onClick={onClick}>

      <button onClick={e => { e.stopPropagation(); onAuthorClick(); }} className="flex-shrink-0 hover:opacity-80 transition-opacity" title={prompt.author}>
        <Avatar name={prompt.author} size={40} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {isFragment && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-violet-400 bg-violet-400/10 border border-violet-400/20 px-1.5 py-0.5 rounded">
              <Puzzle size={9} /> Fragment
            </span>
          )}
          {CATEGORY_ICONS[prompt.category] && <span className="text-primary">{CATEGORY_ICONS[prompt.category]}</span>}
          <span className="text-[11px] font-mono text-muted-foreground">{prompt.category}</span>
          {isFragment && prompt.fragmentLabel && (
            <span className="text-[10px] font-mono text-violet-400 bg-violet-400/10 border border-violet-400/20 px-1.5 py-0.5 rounded">{prompt.fragmentLabel}</span>
          )}
          {prompt.imageStyle && (
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${IMAGE_STYLE_COLORS[prompt.imageStyle] ?? ""}`}>{prompt.imageStyle}</span>
          )}
          {prompt.status === "flagged" && (
            <span className="inline-flex items-center gap-1 text-[10px] text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
              <AlertCircle size={9} /> flagged
            </span>
          )}
        </div>
        <h3 className="font-semibold text-foreground leading-tight text-sm truncate">{prompt.titleTh}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1 mt-0.5">{prompt.body}</p>
        <div className="flex flex-wrap items-center gap-1 mt-1.5">
          {prompt.tags.map(tag => <Tag key={tag} label={tag} />)}
        </div>
      </div>

      <div className="hidden md:flex flex-shrink-0 w-32">
        <ModelBadges models={prompt.models} />
      </div>

      <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground flex-shrink-0 pl-3 border-l border-border">
        <span className="flex items-center gap-1"><Eye size={13} /> {prompt.views.toLocaleString()}</span>
        {prompt.allowStars ? (
          <button className={`flex items-center gap-1 transition-colors ${prompt.starred ? "text-amber-500 font-semibold" : "text-muted-foreground hover:text-amber-500"} ${role === "guest" ? "cursor-not-allowed opacity-50" : ""}`}
            onClick={e => { e.stopPropagation(); if (role !== "guest") onStar(); }}>
            <Star size={13} fill={prompt.starred ? "currentColor" : "none"} />{prompt.stars}
          </button>
        ) : (
          <span className="flex items-center gap-1 opacity-40"><Star size={13} /> {prompt.stars}</span>
        )}
        <span className="flex items-center gap-1"><MessageSquare size={13} /> {prompt.comments}</span>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 pl-3 border-l border-border">
        {role !== "guest" && (
          <div className="relative">
            <button className={`p-1.5 rounded-lg transition-colors ${prompt.bookmarked || collections.some(c => c.promptIds.includes(prompt.id)) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-black/[0.04]"}`}
              title="บันทึก" onClick={e => { e.stopPropagation(); setShowColPicker(v => !v); }}>
              <Bookmark size={15} fill={prompt.bookmarked || collections.some(c => c.promptIds.includes(prompt.id)) ? "currentColor" : "none"} />
            </button>
            {showColPicker && (
              <SavePicker promptId={prompt.id} collections={collections} bookmarked={prompt.bookmarked}
                onToggleBookmark={() => onBookmark()}
                onToggle={colId => { onToggleCollection(colId); }}
                onClose={() => setShowColPicker(false)} />
            )}
          </div>
        )}
        <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.04] transition-colors" onClick={handleCopy}>
          {copied ? <Check size={15} className="text-primary" /> : <Copy size={15} />}
        </button>
      </div>
    </div>
  );
}

// ─── Top Categories Podium ────────────────────────────────────────────────────

function TopCategoriesPodium({ prompts }: { prompts: Prompt[] }) {
  const active = prompts.filter(p => p.status === "active" && p.postType === "prompt");

  const categoryStats = CATEGORIES.filter(c => c !== "ทั้งหมด").map(cat => {
    const catPrompts = active.filter(p => p.category === cat);
    return {
      name: cat,
      count: catPrompts.length,
      totalStars: catPrompts.reduce((s, p) => s + p.stars, 0),
      totalViews: catPrompts.reduce((s, p) => s + p.views, 0),
      score: catPrompts.reduce((s, p) => s + p.stars + p.views / 10, 0),
    };
  }).sort((a, b) => b.score - a.score).slice(0, 3);

  if (categoryStats.length < 3) return null;

  const podiumOrder = [categoryStats[1], categoryStats[0], categoryStats[2]]; // 2nd, 1st, 3rd
  const podiumConfig = [
    { rank: 2, medal: "🥈", height: "h-24", barColor: "bg-black/[0.06]", borderColor: "border-black/10", textColor: "text-muted-foreground", rankSize: "text-2xl" },
    { rank: 1, medal: "🥇", height: "h-32", barColor: "bg-yellow-400/20", borderColor: "border-yellow-500/30", textColor: "text-yellow-700", rankSize: "text-3xl" },
    { rank: 3, medal: "🥉", height: "h-16", barColor: "bg-orange-400/15", borderColor: "border-orange-400/25", textColor: "text-orange-600", rankSize: "text-xl" },
  ];

  return (
    <div className="mb-7">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🏆</span>
        <h2 className="text-base font-semibold text-foreground">หมวดหมู่ยอดนิยม</h2>
        <span className="text-xs text-muted-foreground font-mono ml-auto">คำนวณจากดาว + ยอดดู</span>
      </div>

      <div className="flex items-end justify-center gap-3">
        {podiumOrder.map((cat, i) => {
          const cfg = podiumConfig[i];
          return (
            <div key={cat.name} className="flex-1 flex flex-col items-center gap-2 max-w-[220px]">
              {/* Medal + name above podium */}
              <div className="text-center">
                <div className={`${cfg.rankSize} mb-1`}>{cfg.medal}</div>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  {CATEGORY_ICONS[cat.name] && <span className={cfg.textColor}>{CATEGORY_ICONS[cat.name]}</span>}
                  <p className={`text-base font-semibold ${cfg.textColor}`}>{cat.name}</p>
                </div>
                <p className="text-sm text-muted-foreground font-mono">{cat.count} prompts</p>
              </div>

              {/* Podium bar */}
              <div className={`w-full ${cfg.height} ${cfg.barColor} border ${cfg.borderColor} rounded-t-xl flex flex-col items-center justify-center gap-1.5 px-2`}>
                <p className={`text-base font-bold font-mono ${cfg.textColor}`}>
                  ⭐ {cat.totalStars.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  👁 {cat.totalViews.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Base */}
      <div className="h-2 bg-black/[0.04] border border-border rounded-b-xl border-t-0" />
    </div>
  );
}

// ─── Feed Screen ──────────────────────────────────────────────────────────────

function FeedScreen({ role, prompts, setPrompts, setScreen, setDetailId, setProfileAuthor, collections, setCollections, search }: {
  role: Role; prompts: Prompt[]; setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>;
  setScreen: (s: Screen) => void; setDetailId: (id: number) => void;
  setProfileAuthor: (a: string) => void; collections: Collection[];
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>; search: string;
}) {
  const [category, setCategory] = useState("ทั้งหมด");
  const [modelFilter, setModelFilter] = useState<"ทั้งหมด" | AIModel>("ทั้งหมด");
  const [imageStyle, setImageStyle] = useState("ทุกสไตล์");
  const [sort, setSort] = useState<"newest" | "stars" | "views">("stars");
  const [showFragments, setShowFragments] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const activeFilterCount = [
    category !== "ทั้งหมด",
    modelFilter !== "ทั้งหมด",
    imageStyle !== "ทุกสไตล์",
    showFragments,
  ].filter(Boolean).length;

  function resetFilters() {
    setCategory("ทั้งหมด");
    setModelFilter("ทั้งหมด");
    setImageStyle("ทุกสไตล์");
    setShowFragments(false);
  }

  const filtered = prompts
    .filter(p => p.status !== "hidden")
    .filter(p => showFragments ? p.postType === "fragment" : p.postType === "prompt")
    .filter(p => category === "ทั้งหมด" || p.category === category)
    .filter(p => modelFilter === "ทั้งหมด" || p.models.includes(modelFilter))
    .filter(p => category !== "การเจนภาพ" || imageStyle === "ทุกสไตล์" || p.imageStyle === imageStyle)
    .filter(p =>
      p.titleTh.includes(search) || p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.body.includes(search) || p.tags.some(t => t.includes(search))
    )
    .sort((a, b) => sort === "newest" ? b.id - a.id : sort === "stars" ? b.stars - a.stars : b.views - a.views);

  function toggleStar(id: number) {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, starred: !p.starred, stars: p.starred ? p.stars - 1 : p.stars + 1 } : p));
  }
  function toggleBookmark(id: number) {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p));
  }
  function handleToggleCollection(promptId: number, colId: number) {
    setCollections(prev => prev.map(c => c.id === colId
      ? { ...c, promptIds: c.promptIds.includes(promptId) ? c.promptIds.filter(id => id !== promptId) : [...c.promptIds, promptId] }
      : c));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {role === "guest" && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl border border-primary/20 bg-primary/5 text-sm text-muted-foreground">
          <Bot size={16} className="text-primary flex-shrink-0" />
          <span>กำลังดูในฐานะ Guest — <button className="text-primary hover:underline" onClick={() => setScreen("login")}>เข้าสู่ระบบ</button> เพื่อให้ดาว คอมเมนต์ และบุ๊กมาร์ก</span>
        </div>
      )}

      <TopCategoriesPodium prompts={prompts} />

      {/* Sort + Filter button */}
      <div className="flex gap-2 mb-3">
        <select className="text-sm bg-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          value={sort} onChange={e => setSort(e.target.value as typeof sort)}>
          <option value="stars">ยอดนิยม</option>
          <option value="newest">ล่าสุด</option>
          <option value="views">ดูมากสุด</option>
        </select>
        <button
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${showFilterPanel || activeFilterCount > 0 ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-black/[0.12]"}`}
          onClick={() => setShowFilterPanel(v => !v)}>
          <Filter size={14} />
          ตัวกรอง
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="mb-4 p-4 rounded-xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">ตัวกรอง</span>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={resetFilters}>
                  รีเซ็ต
                </button>
              )}
              <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowFilterPanel(false)}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Post type */}
          <div>
            <p className="text-[11px] font-mono text-muted-foreground mb-2">ประเภทโพสต์</p>
            <div className="flex gap-2">
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${!showFragments ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                onClick={() => setShowFragments(false)}>
                <Brain size={12} /> Prompt เต็ม
              </button>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${showFragments ? "bg-violet-500/10 border-violet-500/40 text-violet-400" : "border-border text-muted-foreground hover:text-foreground"}`}
                onClick={() => setShowFragments(true)}>
                <Puzzle size={12} /> Fragment
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-[11px] font-mono text-muted-foreground mb-2">หมวดหมู่</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button key={cat}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border transition-all ${category === cat ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                  onClick={() => { setCategory(cat); setImageStyle("ทุกสไตล์"); }}>
                  {CATEGORY_ICONS[cat]}{cat}
                </button>
              ))}
            </div>
          </div>

          {/* Image style (conditional) */}
          {category === "การเจนภาพ" && (
            <div>
              <p className="text-[11px] font-mono text-muted-foreground mb-2">สไตล์ภาพ</p>
              <div className="flex flex-wrap gap-1.5">
                {IMAGE_SUBTAGS.map(s => (
                  <button key={s}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${imageStyle === s ? (s === "ทุกสไตล์" ? "bg-black/[0.06] text-foreground border-black/[0.12]" : `${IMAGE_STYLE_COLORS[s]}`) : "border-border text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setImageStyle(s)}>{s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Model */}
          <div>
            <p className="text-[11px] font-mono text-muted-foreground mb-2">ชนิด AI</p>
            <div className="flex flex-wrap gap-1.5">
              {(["ทั้งหมด", ...AI_MODELS] as const).map(m => (
                <button key={m}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${modelFilter === m ? (m === "ทั้งหมด" ? "bg-black/[0.06] text-foreground border-black/[0.12]" : `${MODEL_COLORS[m as AIModel]}`) : "border-border text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setModelFilter(m as typeof modelFilter)}>{m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter summary chips */}
      {activeFilterCount > 0 && !showFilterPanel && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {category !== "ทั้งหมด" && (
            <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary font-mono">
              {CATEGORY_ICONS[category]} {category}
              <button onClick={() => { setCategory("ทั้งหมด"); setImageStyle("ทุกสไตล์"); }}><X size={10} /></button>
            </span>
          )}
          {imageStyle !== "ทุกสไตล์" && (
            <span className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border font-mono ${IMAGE_STYLE_COLORS[imageStyle]}`}>
              {imageStyle}<button onClick={() => setImageStyle("ทุกสไตล์")}><X size={10} /></button>
            </span>
          )}
          {modelFilter !== "ทั้งหมด" && (
            <span className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border font-mono ${MODEL_COLORS[modelFilter as AIModel]}`}>
              {modelFilter}<button onClick={() => setModelFilter("ทั้งหมด")}><X size={10} /></button>
            </span>
          )}
          {showFragments && (
            <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-violet-500/10 border border-violet-500/25 text-violet-400 font-mono">
              <Puzzle size={10} /> Fragment<button onClick={() => setShowFragments(false)}><X size={10} /></button>
            </span>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground font-mono mb-4">{filtered.length} {showFragments ? "fragments" : "prompts"}</p>

      <div className="flex flex-col gap-3">
        {filtered.map(p => (
          <PromptCard key={p.id} prompt={p} role={role}
            onStar={() => toggleStar(p.id)} onBookmark={() => toggleBookmark(p.id)}
            onClick={() => { setDetailId(p.id); setScreen("detail"); }}
            onAuthorClick={() => { setProfileAuthor(p.author); setScreen("profile"); }}
            collections={collections} onToggleCollection={colId => handleToggleCollection(p.id, colId)} />
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <Search size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">ไม่พบ {showFragments ? "fragment" : "prompt"} ที่ค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ setRole, setScreen }: { setRole: (r: Role) => void; setScreen: (s: Screen) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  function handleLogin(role: Role) { setRole(role); setScreen("feed"); }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4"><Zap size={22} className="text-primary" /></div>
          <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>{mode === "login" ? "เข้าสู่ระบบ" : "สร้างบัญชี"}</h1>
          <p className="text-sm text-muted-foreground mt-1">ThaiPromptHub</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">อีเมล</label>
            <input className="w-full px-3 py-2.5 text-sm bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">รหัสผ่าน</label>
            <input className="w-full px-3 py-2.5 text-sm bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            onClick={() => handleLogin("user")}>{mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</button>
          {mode === "login" && (
            <>
              <div className="relative flex items-center gap-3"><div className="flex-1 h-px bg-border" /><span className="text-xs text-muted-foreground">หรือ</span><div className="flex-1 h-px bg-border" /></div>
              <button className="w-full py-2.5 rounded-lg border border-red-500/30 bg-red-500/5 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                onClick={() => handleLogin("admin")}><Shield size={14} /> เข้าในฐานะ Admin (ทดสอบ)</button>
            </>
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          {mode === "login" ? "ยังไม่มีบัญชี? " : "มีบัญชีแล้ว? "}
          <button className="text-primary hover:underline" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}</button>
        </p>
        <button className="flex items-center gap-1 text-xs text-muted-foreground mx-auto mt-3 hover:text-foreground transition-colors" onClick={() => setScreen("feed")}>
          <ArrowLeft size={12} /> กลับไปดู Prompt
        </button>
      </div>
    </div>
  );
}

// ─── Create Screen ────────────────────────────────────────────────────────────

function CreateScreen({ setScreen, setPrompts, builderFragments, setBuilderFragments }: {
  setScreen: (s: Screen) => void;
  setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>;
  builderFragments: Prompt[];
  setBuilderFragments: React.Dispatch<React.SetStateAction<Prompt[]>>;
}) {
  const [postType, setPostType] = useState<"prompt" | "fragment">("prompt");
  const [fragmentLabel, setFragmentLabel] = useState(FRAGMENT_LABELS[0]);
  const [titleTh, setTitleTh] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("การเขียน");
  const [selectedModels, setSelectedModels] = useState<AIModel[]>(["Claude"]);
  const [selectedImageStyle, setSelectedImageStyle] = useState("Realistic");
  const [tags, setTags] = useState("");
  const [allowStars, setAllowStars] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [saved, setSaved] = useState(false);

  const variables = [...new Set((body.match(/\[([^\]]+)\]/g) ?? []).map(m => m.slice(1, -1)))];

  function toggleModel(m: AIModel) {
    setSelectedModels(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  }

  function insertFragment(frag: Prompt) {
    setBody(prev => prev + (prev ? "\n\n" : "") + frag.body);
    setBuilderFragments(prev => prev.filter(f => f.id !== frag.id));
  }

  function handleSubmit() {
    if (!titleTh || !body) return;
    const newPrompt: Prompt = {
      id: Date.now(), postType, fragmentLabel: postType === "fragment" ? fragmentLabel : undefined,
      title: title || titleTh, titleTh, body, category,
      models: selectedModels.length ? selectedModels : ["Claude"],
      imageStyle: category === "การเจนภาพ" ? selectedImageStyle : undefined,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      author: "สมชาย ว.", stars: 0, comments: 0, views: 0,
      weeklyStars: 0, weeklyCopies: 0,
      starred: false, bookmarked: false, allowStars, allowComments,
      status: "active", createdAt: new Date().toISOString().slice(0, 10),
    };
    setPrompts(prev => [newPrompt, ...prev]);
    setSaved(true);
    setTimeout(() => { setSaved(false); setScreen("feed"); }, 1200);
  }

  const Toggle = ({ val, onToggle }: { val: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={`transition-colors ${val ? "text-primary" : "text-muted-foreground"}`}>
      {val ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button className="p-1.5 text-muted-foreground hover:text-foreground rounded" onClick={() => setScreen("feed")}><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>สร้างโพสต์ใหม่</h1>
          <p className="text-xs text-muted-foreground">แชร์กับชุมชน ThaiPromptHub</p>
        </div>
      </div>

      {/* Type toggle */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6 w-fit">
        {(["prompt", "fragment"] as const).map(t => (
          <button key={t}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm transition-all ${postType === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setPostType(t)}>
            {t === "prompt" ? <><Brain size={13} /> Prompt เต็ม</> : <><Puzzle size={13} /> Fragment</>}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {/* Fragment label */}
        {postType === "fragment" && (
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">ประเภท Fragment</label>
            <div className="flex flex-wrap gap-1.5">
              {FRAGMENT_LABELS.map(l => (
                <button key={l} type="button"
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${fragmentLabel === l ? "border-violet-500/40 bg-violet-500/10 text-violet-400" : "border-border text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setFragmentLabel(l)}>{l}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Builder fragments */}
        {builderFragments.length > 0 && (
          <div className="p-3 rounded-xl border border-violet-500/20 bg-violet-500/5 space-y-2">
            <p className="text-xs font-mono text-violet-400 flex items-center gap-1.5"><Layers size={12} /> Fragments ในคลัง — คลิกแทรกเข้า Prompt</p>
            {builderFragments.map(f => (
              <div key={f.id} className="flex items-center justify-between gap-2 bg-card border border-border rounded-lg px-3 py-2">
                <div>
                  <p className="text-xs text-violet-400 font-mono">{f.fragmentLabel}</p>
                  <p className="text-xs text-foreground">{f.titleTh}</p>
                </div>
                <div className="flex gap-1">
                  <Btn variant="subtle" size="sm" onClick={() => insertFragment(f)}>แทรก</Btn>
                  <button className="p-1 text-muted-foreground hover:text-foreground" onClick={() => setBuilderFragments(p => p.filter(x => x.id !== f.id))}><X size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">ชื่อ (ภาษาไทย) *</label>
            <input className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="เช่น นักเขียนเรื่องสั้น" value={titleTh} onChange={e => setTitleTh(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">ชื่อ (อังกฤษ)</label>
            <input className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="e.g. Story Writer" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">หมวดหมู่</label>
            <select className="w-full text-sm bg-secondary border border-border rounded-lg px-3 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.filter(c => c !== "ทั้งหมด").map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">ใช้ได้ดีกับ (multi-select)</label>
            <div className="flex flex-wrap gap-1.5">
              {AI_MODELS.map(m => (
                <button key={m} type="button"
                  className={`px-2 py-1 rounded-lg text-[11px] border transition-all ${selectedModels.includes(m) ? MODEL_COLORS[m] : "border-border text-muted-foreground hover:text-foreground"}`}
                  onClick={() => toggleModel(m)}>{m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {category === "การเจนภาพ" && (
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">สไตล์ภาพ</label>
            <div className="flex flex-wrap gap-1.5">
              {IMAGE_SUBTAGS.filter(s => s !== "ทุกสไตล์").map(s => (
                <button key={s} type="button"
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${selectedImageStyle === s ? IMAGE_STYLE_COLORS[s] : "border-border text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setSelectedImageStyle(s)}>{s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-muted-foreground">เนื้อหา Prompt *</label>
            <span className="text-[11px] text-muted-foreground font-mono">ใส่ตัวแปรด้วย <span className="text-primary">[ชื่อตัวแปร]</span></span>
          </div>
          <textarea className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            placeholder="เขียน prompt ที่นี่..." rows={6} value={body} onChange={e => setBody(e.target.value)}
            style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }} />
          {variables.length > 0 && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-muted-foreground font-mono">ตัวแปรที่พบ:</span>
              {variables.map(v => <span key={v} className="text-[11px] font-mono text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">[{v}]</span>)}
            </div>
          )}
          <p className="text-right text-[11px] text-muted-foreground mt-1 font-mono">{body.length} ตัวอักษร</p>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Tags (คั่นด้วยลูกน้ำ)</label>
          <input className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="เช่น เขียนสร้างสรรค์, ภาษาไทย" value={tags} onChange={e => setTags(e.target.value)} />
          {tags && <div className="flex flex-wrap gap-1 mt-2">{tags.split(",").map(t => t.trim()).filter(Boolean).map(t => <Tag key={t} label={t} />)}</div>}
        </div>

        {postType === "prompt" && (
          <div className="p-4 rounded-xl bg-secondary border border-border space-y-3">
            <p className="text-xs font-semibold text-foreground">ตั้งค่าการโต้ตอบ</p>
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-foreground">เปิดรับดาว</p><p className="text-xs text-muted-foreground">ผู้ใช้อื่นสามารถให้ดาวได้</p></div>
              <button onClick={() => setAllowStars(v => !v)} className={`transition-colors ${allowStars ? "text-primary" : "text-muted-foreground"}`}>{allowStars ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}</button>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-foreground">เปิดรับคอมเมนต์</p><p className="text-xs text-muted-foreground">ผู้ใช้อื่นสามารถแสดงความคิดเห็นได้</p></div>
              <button onClick={() => setAllowComments(v => !v)} className={`transition-colors ${allowComments ? "text-primary" : "text-muted-foreground"}`}>{allowComments ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}</button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Btn variant="outline" onClick={() => setScreen("feed")}>ยกเลิก</Btn>
          <button
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${saved ? "bg-green-500 text-white" : !titleTh || !body || selectedModels.length === 0 ? "bg-primary/30 text-primary-foreground/50 cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
            onClick={handleSubmit} disabled={!titleTh || !body || selectedModels.length === 0}>
            {saved ? <span className="flex items-center justify-center gap-2"><Check size={14} /> บันทึกแล้ว!</span> : `เผยแพร่ ${postType === "fragment" ? "Fragment" : "Prompt"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Screen ────────────────────────────────────────────────────────────

function DetailScreen({ promptId, prompts, setPrompts, role, setScreen, setProfileAuthor, collections, setCollections, onAddToBuilder }: {
  promptId: number; prompts: Prompt[]; setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>;
  role: Role; setScreen: (s: Screen) => void; setProfileAuthor: (a: string) => void;
  collections: Collection[]; setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
  onAddToBuilder: (f: Prompt) => void;
}) {
  const prompt = prompts.find(p => p.id === promptId);
  const [comment, setComment] = useState("");
  const [copied, setCopied] = useState(false);
  const [showColPicker, setShowColPicker] = useState(false);
  const [addedToBuilder, setAddedToBuilder] = useState(false);

  // Variable placeholder state
  const variables = [...new Set((prompt?.body.match(/\[([^\]]+)\]/g) ?? []).map(m => m.slice(1, -1)))];
  const [varValues, setVarValues] = useState<Record<string, string>>({});

  if (!prompt) return null;

  function toggleStar() {
    setPrompts(prev => prev.map(p => p.id === promptId ? { ...p, starred: !p.starred, stars: p.starred ? p.stars - 1 : p.stars + 1 } : p));
  }
  function handleToggleCollection(colId: number) {
    setCollections(prev => prev.map(c => c.id === colId
      ? { ...c, promptIds: c.promptIds.includes(promptId) ? c.promptIds.filter(id => id !== promptId) : [...c.promptIds, promptId] }
      : c));
  }
  function toggleBookmark() {
    setPrompts(prev => prev.map(p => p.id === promptId ? { ...p, bookmarked: !p.bookmarked } : p));
  }

  function resolvedBody() {
    let text = prompt.body;
    variables.forEach(v => { text = text.replaceAll(`[${v}]`, varValues[v] || `[${v}]`); });
    return text;
  }

  function handleCopy() {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleAddToBuilder() {
    onAddToBuilder(prompt);
    setAddedToBuilder(true);
    setTimeout(() => setAddedToBuilder(false), 1500);
  }

  const isFragment = prompt.postType === "fragment";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors" onClick={() => setScreen("feed")}>
        <ArrowLeft size={14} /> กลับ
      </button>

      <div className={`border rounded-2xl p-5 mb-4 ${isFragment ? "border-violet-500/25 bg-violet-500/5" : "bg-card border-border"}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {isFragment && <span className="inline-flex items-center gap-1 text-[11px] font-mono text-violet-400 bg-violet-400/10 border border-violet-400/20 px-2 py-0.5 rounded"><Puzzle size={10} /> Fragment · {prompt.fragmentLabel}</span>}
              {!isFragment && CATEGORY_ICONS[prompt.category] && <span className="text-primary">{CATEGORY_ICONS[prompt.category]}</span>}
              {!isFragment && <span className="text-[11px] font-mono text-muted-foreground">{prompt.category}</span>}
            </div>
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>{prompt.titleTh}</h1>
            <p className="text-sm text-muted-foreground">{prompt.title}</p>
            <div className="mt-2"><ModelBadges models={prompt.models} /></div>
          </div>
          <button onClick={() => { setProfileAuthor(prompt.author); setScreen("profile"); }} className="flex-shrink-0 ml-3 hover:opacity-80 transition-opacity" title={`ดูโปรไฟล์ ${prompt.author}`}>
            <Avatar name={prompt.author} size={40} />
          </button>
        </div>

        {/* Variable fill form */}
        {variables.length > 0 && (
          <div className="mb-4 p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
            <p className="text-xs font-mono text-primary flex items-center gap-1.5"><BadgeCheck size={12} /> กรอกค่าแทนตัวแปรก่อน Copy</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {variables.map(v => (
                <div key={v}>
                  <label className="block text-[11px] text-muted-foreground mb-1 font-mono">[{v}]</label>
                  <input className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder={`ใส่ ${v}...`} value={varValues[v] ?? ""}
                    onChange={e => setVarValues(prev => ({ ...prev, [v]: e.target.value }))} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative bg-secondary/60 border border-border rounded-xl p-4 mb-4">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>{resolvedBody()}</p>
          <button className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/[0.06] transition-all" onClick={handleCopy}>
            {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
          </button>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">{prompt.tags.map(t => <Tag key={t} label={t} />)}</div>

        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Eye size={11} /> {prompt.views.toLocaleString()}</span>
            <span className="flex items-center gap-1"><Star size={11} /> {prompt.stars}</span>
            <span className="flex items-center gap-1"><MessageSquare size={11} /> {prompt.comments}</span>
          </div>
          <button className="font-mono hover:text-foreground transition-colors" onClick={() => { setProfileAuthor(prompt.author); setScreen("profile"); }}>
            {prompt.author} · {prompt.createdAt}
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {isFragment ? (
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${addedToBuilder ? "border-violet-500/40 bg-violet-500/10 text-violet-400" : role === "guest" ? "border-border text-muted-foreground/40 cursor-not-allowed" : "border-violet-500/30 bg-violet-500/5 text-violet-400 hover:bg-violet-500/10"}`}
            onClick={() => role !== "guest" && handleAddToBuilder()} disabled={role === "guest"}>
            <Layers size={14} />{addedToBuilder ? "เพิ่มแล้ว!" : "เพิ่มเข้า Prompt Builder"}
          </button>
        ) : (
          prompt.allowStars && (
            <button
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${prompt.starred ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400" : role === "guest" ? "border-border text-muted-foreground/40 cursor-not-allowed" : "border-border text-muted-foreground hover:border-yellow-400/40 hover:text-yellow-400"}`}
              onClick={() => role !== "guest" && toggleStar()}>
              <Star size={14} fill={prompt.starred ? "currentColor" : "none"} />
              {prompt.starred ? "ให้ดาวแล้ว" : "ให้ดาว"} ({prompt.stars})
            </button>
          )
        )}

        <button
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-accent/20 bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-all"
          onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "คัดลอกแล้ว!" : "คัดลอก"}
          {variables.some(v => varValues[v]) ? " (พร้อมตัวแปร)" : ""}
        </button>

        {role !== "guest" && (
          <div className="relative">
            <button
              className={`h-full px-3 rounded-xl border transition-all ${prompt.bookmarked || collections.some(c => c.promptIds.includes(prompt.id)) ? "border-primary/30 text-primary" : "border-border text-muted-foreground hover:text-primary hover:border-primary/30"}`}
              onClick={() => setShowColPicker(v => !v)} title="บันทึก">
              <Bookmark size={16} fill={prompt.bookmarked || collections.some(c => c.promptIds.includes(prompt.id)) ? "currentColor" : "none"} />
            </button>
            {showColPicker && (
              <SavePicker promptId={prompt.id} collections={collections} bookmarked={prompt.bookmarked}
                onToggleBookmark={toggleBookmark}
                onToggle={handleToggleCollection} onClose={() => setShowColPicker(false)} />
            )}
          </div>
        )}
      </div>

      {prompt.allowComments && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>
            ความคิดเห็น ({SAMPLE_COMMENTS.length})
          </h3>
          <div className="space-y-3 mb-4">
            {SAMPLE_COMMENTS.map(c => (
              <div key={c.id} className="flex gap-3">
                <Avatar name={c.author} size={28} />
                <div className="flex-1 bg-card border border-border rounded-xl px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{c.author}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">{c.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>{c.body}</p>
                </div>
              </div>
            ))}
          </div>
          {role !== "guest" ? (
            <div className="flex gap-2">
              <Avatar name="สมชาย ว." size={28} />
              <div className="flex-1 flex gap-2">
                <input className="flex-1 px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="เขียนความคิดเห็น..." value={comment} onChange={e => setComment(e.target.value)} />
                <Btn variant="primary" size="sm" disabled={!comment}>โพสต์</Btn>
              </div>
            </div>
          ) : (
            <p className="text-xs text-center text-muted-foreground py-3 border border-dashed border-border rounded-lg">
              <button className="text-primary hover:underline" onClick={() => setScreen("login")}>เข้าสู่ระบบ</button> เพื่อแสดงความคิดเห็น
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Admin Screen ─────────────────────────────────────────────────────────────

function AdminScreen({ prompts, setPrompts }: { prompts: Prompt[]; setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>> }) {
  const [tab, setTab] = useState<"overview" | "posts" | "users">("overview");
  const flagged = prompts.filter(p => p.status === "flagged");
  function setStatus(id: number, status: Prompt["status"]) { setPrompts(prev => prev.map(p => p.id === id ? { ...p, status } : p)); }

  const MOCK_USERS = [
    { id: 1, name: "สมชาย ว.", email: "somchai@example.com", posts: 12, joined: "2024-03-01", status: "active" },
    { id: 2, name: "ปริยา ก.", email: "pariya@example.com", posts: 8, joined: "2024-04-15", status: "active" },
    { id: 3, name: "วิชัย ส.", email: "wichai@example.com", posts: 5, joined: "2024-05-02", status: "active" },
    { id: 4, name: "นภา ร.", email: "napa@example.com", posts: 3, joined: "2024-05-20", status: "suspended" },
    { id: 5, name: "มาลี ท.", email: "malee@example.com", posts: 19, joined: "2024-02-11", status: "active" },
  ];
  const BAR_MAX = Math.max(...ADMIN_STATS.weeklyGrowth);
  const DAYS = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center"><Shield size={16} className="text-red-400" /></div>
        <div><h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>Admin Dashboard</h1><p className="text-xs text-muted-foreground">จัดการโพสต์ ผู้ใช้ และสถิติ</p></div>
      </div>
      <div className="flex gap-1 mb-6 bg-secondary rounded-xl p-1 w-fit">
        {(["overview", "posts", "users"] as const).map(t => (
          <button key={t} className={`px-4 py-1.5 text-sm rounded-lg transition-all ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTab(t)}>{t === "overview" ? "ภาพรวม" : t === "posts" ? "โพสต์" : "ผู้ใช้"}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Prompt ทั้งหมด", value: ADMIN_STATS.totalPrompts, icon: <Globe size={14} />, color: "text-blue-400" },
              { label: "ผู้ใช้ทั้งหมด", value: ADMIN_STATS.totalUsers.toLocaleString(), icon: <Users size={14} />, color: "text-primary" },
              { label: "ดาวทั้งหมด", value: ADMIN_STATS.totalStars.toLocaleString(), icon: <Star size={14} />, color: "text-yellow-400" },
              { label: "รอตรวจสอบ", value: flagged.length, icon: <AlertCircle size={14} />, color: "text-orange-400" },
            ].map(stat => (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
                <div className={`flex items-center gap-1.5 text-xs ${stat.color} mb-2`}>{stat.icon}<span className="font-mono">{stat.label}</span></div>
                <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-mono text-muted-foreground mb-4">โพสต์ใหม่รายวัน (7 วันล่าสุด)</p>
              <div className="flex items-end gap-1.5 h-28">
                {ADMIN_STATS.weeklyGrowth.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-primary/30 hover:bg-primary/50 rounded-t transition-colors" style={{ height: `${(v / BAR_MAX) * 100}%` }} />
                    <span className="text-[10px] text-muted-foreground font-mono">{DAYS[i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-mono text-muted-foreground mb-4">หมวดหมู่ยอดนิยม</p>
              <div className="space-y-2.5">
                {ADMIN_STATS.topCategories.map(cat => {
                  const pct = Math.round((cat.count / ADMIN_STATS.totalPrompts) * 100);
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between text-xs mb-1"><span className="text-foreground">{cat.name}</span><span className="font-mono text-muted-foreground">{cat.count} ({pct}%)</span></div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "posts" && (
        <div className="space-y-3">
          {flagged.length > 0 && <div className="p-3 rounded-xl bg-orange-400/5 border border-orange-400/20 flex items-center gap-2 text-sm text-orange-400"><AlertCircle size={14} />{flagged.length} โพสต์รอการตรวจสอบ</div>}
          {prompts.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.status === "active" ? "bg-green-400" : p.status === "flagged" ? "bg-orange-400" : "bg-red-400"}`} />
                  {p.postType === "fragment" && <Puzzle size={11} className="text-violet-400 flex-shrink-0" />}
                  <p className="text-sm font-medium text-foreground truncate">{p.titleTh}</p>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{p.author} · {p.category} · ⭐ {p.stars} 💬 {p.comments}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {p.status !== "active" && <Btn variant="outline" size="sm" onClick={() => setStatus(p.id, "active")}>อนุมัติ</Btn>}
                {p.status !== "hidden" && <Btn variant="danger" size="sm" onClick={() => setStatus(p.id, "hidden")}>ซ่อน</Btn>}
                {p.status === "hidden" && <Btn variant="outline" size="sm" onClick={() => setStatus(p.id, "active")}>แสดง</Btn>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-2">
          {MOCK_USERS.map(u => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl">
              <Avatar name={u.name} size={32} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{u.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{u.email} · {u.posts} prompts · เข้าร่วม {u.joined}</p>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded font-mono border ${u.status === "active" ? "text-green-400 border-green-400/20 bg-green-400/5" : "text-red-400 border-red-400/20 bg-red-400/5"}`}>
                {u.status === "active" ? "ใช้งาน" : "ระงับ"}
              </span>
              <Btn variant="ghost" size="sm"><Settings size={12} /></Btn>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── My Collections Screen ────────────────────────────────────────────────────

function MyCollectionsScreen({ collections, setCollections, prompts, setScreen, setDetailId }: {
  collections: Collection[]; setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
  prompts: Prompt[]; setScreen: (s: Screen) => void; setDetailId: (id: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(collections[0]?.id ?? null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPreset, setNewPreset] = useState(0);
  const [copied, setCopied] = useState(false);

  const col = collections.find(c => c.id === selected);
  const colPrompts = prompts.filter(p => col?.promptIds.includes(p.id));

  function createCollection() {
    if (!newName) return;
    const p = COLLECTION_PRESETS[newPreset];
    const newCol: Collection = { id: Date.now(), name: newName, icon: p.icon, color: p.color, promptIds: [], isPublic: false };
    setCollections(prev => [...prev, newCol]);
    setSelected(newCol.id);
    setCreating(false);
    setNewName("");
  }

  function togglePublic(id: number) {
    setCollections(prev => prev.map(c => c.id === id ? { ...c, isPublic: !c.isPublic } : c));
  }

  function removeFromCol(promptId: number) {
    setCollections(prev => prev.map(c => c.id === selected ? { ...c, promptIds: c.promptIds.filter(id => id !== promptId) } : c));
  }

  function deleteCollection(id: number) {
    setCollections(prev => prev.filter(c => c.id !== id));
    setSelected(collections.find(c => c.id !== id)?.id ?? null);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <FolderHeart size={20} className="text-primary" />
        <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>ชุด Prompt ของฉัน</h1>
        <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          onClick={() => setCreating(true)}><Plus size={13} /> สร้างชุดใหม่</button>
      </div>

      {creating && (
        <div className="mb-6 p-4 bg-card border border-border rounded-2xl space-y-3">
          <p className="text-sm font-semibold text-foreground">ชุดใหม่</p>
          <input className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="ชื่อชุด เช่น ชุดติวสอบ..." value={newName} onChange={e => setNewName(e.target.value)} />
          <div className="flex gap-2 flex-wrap">
            {COLLECTION_PRESETS.map((p, i) => (
              <button key={i} className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border-2 transition-all ${newPreset === i ? "border-primary scale-110" : "border-transparent hover:scale-105"}`}
                style={{ background: p.color + "22" }} onClick={() => setNewPreset(i)}>{p.icon}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <Btn variant="outline" size="sm" onClick={() => setCreating(false)}>ยกเลิก</Btn>
            <Btn variant="primary" size="sm" onClick={createCollection} disabled={!newName}>สร้าง</Btn>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0 space-y-1">
          {collections.map(c => (
            <button key={c.id}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${selected === c.id ? "bg-card border border-border text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04]"}`}
              onClick={() => setSelected(c.id)}>
              <span>{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{c.name}</p>
                <p className="text-[11px] font-mono text-muted-foreground">{c.promptIds.length} prompts</p>
              </div>
            </button>
          ))}
          {collections.length === 0 && <p className="text-xs text-muted-foreground px-3 py-2">ยังไม่มีชุด</p>}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {col ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{col.icon}</span>
                <div className="flex-1">
                  <h2 className="font-bold text-foreground" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>{col.name}</h2>
                  <p className="text-xs text-muted-foreground font-mono">{col.promptIds.length} prompts</p>
                </div>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => togglePublic(col.id)}>
                  {col.isPublic ? <><Unlock size={12} /> สาธารณะ</> : <><Lock size={12} /> ส่วนตัว</>}
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                  {copied ? <><Check size={12} /> คัดลอกแล้ว!</> : <><Share2 size={12} /> แชร์</>}
                </button>
                <button className="px-2.5 py-1.5 rounded-lg border border-destructive/20 text-destructive text-xs hover:bg-destructive/10 transition-colors"
                  onClick={() => deleteCollection(col.id)}>ลบ</button>
              </div>

              {colPrompts.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-border rounded-xl">
                  <FolderHeart size={28} className="mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">ยังไม่มี prompt ในชุดนี้</p>
                  <p className="text-xs text-muted-foreground mt-1">เพิ่มได้จากปุ่ม <Bookmark size={10} className="inline" /> ในการ์ด</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {colPrompts.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl hover:border-black/10 transition-colors cursor-pointer"
                      onClick={() => { setDetailId(p.id); setScreen("detail"); }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.titleTh}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.author} · {p.category} · ⭐ {p.stars}</p>
                      </div>
                      <ModelBadges models={p.models} />
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                        onClick={e => { e.stopPropagation(); removeFromCol(p.id); }}><X size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-muted-foreground">
              <FolderHeart size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">เลือกชุดจากด้านซ้าย</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Creator Profile Screen ───────────────────────────────────────────────────

function CreatorProfileScreen({ author, prompts, role, following, setFollowing, setScreen, setDetailId }: {
  author: string; prompts: Prompt[]; role: Role;
  following: string[]; setFollowing: React.Dispatch<React.SetStateAction<string[]>>;
  setScreen: (s: Screen) => void; setDetailId: (id: number) => void;
}) {
  const authorPrompts = prompts.filter(p => p.author === author && p.status === "active");
  const isFollowing = following.includes(author);
  const totalStars = authorPrompts.reduce((sum, p) => sum + p.stars, 0);
  const totalCopies = authorPrompts.reduce((sum, p) => sum + p.weeklyCopies * 4, 0);
  const avgStars = authorPrompts.length ? (totalStars / authorPrompts.length).toFixed(1) : "0";

  const badges: { icon: string; label: string; condition: boolean }[] = [
    { icon: "🌟", label: "Top Creator", condition: totalStars > 1000 },
    { icon: "🔥", label: "Trending", condition: authorPrompts.some(p => p.weeklyStars > 60) },
    { icon: "📚", label: "Prolific", condition: authorPrompts.length >= 5 },
    { icon: "🎨", label: "Image Expert", condition: authorPrompts.some(p => p.category === "การเจนภาพ") },
  ].filter(b => b.condition);

  function toggleFollow() {
    setFollowing(prev => prev.includes(author) ? prev.filter(a => a !== author) : [...prev, author]);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors" onClick={() => setScreen("feed")}>
        <ArrowLeft size={14} /> กลับ
      </button>

      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <Avatar name={author} size={64} />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>{author}</h1>
            <p className="text-sm text-muted-foreground mb-3">สมาชิก ThaiPromptHub</p>
            {badges.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {badges.map(b => (
                  <span key={b.label} className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg border border-yellow-400/20 bg-yellow-400/5 text-yellow-400">
                    {b.icon} {b.label}
                  </span>
                ))}
              </div>
            )}
            {role !== "guest" && (
              <button
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${isFollowing ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/5" : "border-border text-foreground hover:bg-black/[0.04]"}`}
                onClick={toggleFollow}>
                <UserRound size={14} />{isFollowing ? "กำลังติดตาม" : "ติดตาม"}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
          {[
            { label: "Prompts", value: authorPrompts.length },
            { label: "ดาวรวม", value: totalStars.toLocaleString() },
            { label: "ดาวเฉลี่ย", value: avgStars },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold text-foreground" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>{s.value}</p>
              <p className="text-xs text-muted-foreground font-mono">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-sm font-semibold text-foreground mb-3" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>
        Prompt ทั้งหมด ({authorPrompts.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {authorPrompts.map(p => (
          <button key={p.id} className="text-left flex items-start gap-3 p-3 bg-card border border-border rounded-xl hover:border-black/10 transition-colors"
            onClick={() => { setDetailId(p.id); setScreen("detail"); }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                {p.postType === "fragment" && <Puzzle size={11} className="text-violet-400" />}
                <span className="text-xs font-mono text-muted-foreground">{p.category}</span>
              </div>
              <p className="text-sm font-semibold text-foreground truncate">{p.titleTh}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star size={10} /> {p.stars}</span>
                <span className="flex items-center gap-1"><Eye size={10} /> {p.views.toLocaleString()}</span>
              </div>
            </div>
            <ModelBadges models={p.models} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Request Board Screen ─────────────────────────────────────────────────────

function RequestBoardScreen({ requests, setRequests, prompts, role, setScreen, setDetailId }: {
  requests: Request[]; setRequests: React.Dispatch<React.SetStateAction<Request[]>>;
  prompts: Prompt[]; role: Role; setScreen: (s: Screen) => void; setDetailId: (id: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(requests[0]?.id ?? null);
  const [creating, setCreating] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyPromptId, setReplyPromptId] = useState<number | undefined>(undefined);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCat, setNewCat] = useState("การเขียน");

  const req = requests.find(r => r.id === selected);

  function submitRequest() {
    if (!newTitle || !newBody) return;
    const r: Request = { id: Date.now(), title: newTitle, body: newBody, category: newCat, author: "สมชาย ว.", createdAt: new Date().toISOString().slice(0, 10), replies: [] };
    setRequests(prev => [r, ...prev]);
    setSelected(r.id);
    setCreating(false);
    setNewTitle(""); setNewBody("");
  }

  function submitReply() {
    if (!replyText || !selected) return;
    const reply: RequestReply = { id: Date.now(), author: "สมชาย ว.", body: replyText, attachedPromptId: replyPromptId, createdAt: new Date().toISOString().slice(0, 10) };
    setRequests(prev => prev.map(r => r.id === selected ? { ...r, replies: [...r.replies, reply] } : r));
    setReplyText(""); setReplyPromptId(undefined);
  }

  function setBest(reqId: number, replyId: number) {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, bestReplyId: r.bestReplyId === replyId ? undefined : replyId } : r));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircleQuestion size={20} className="text-primary" />
        <div>
          <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>กระดาน ขอ Prompt</h1>
          <p className="text-xs text-muted-foreground">ขอให้ชุมชนช่วยสร้าง prompt ที่คุณต้องการ</p>
        </div>
        {role !== "guest" && (
          <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            onClick={() => setCreating(v => !v)}><Plus size={13} /> ตั้งกระทู้</button>
        )}
      </div>

      {creating && (
        <div className="mb-6 p-4 bg-card border border-border rounded-2xl space-y-3">
          <p className="text-sm font-semibold text-foreground">ตั้งกระทู้ขอ Prompt</p>
          <input className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="หัวข้อที่ต้องการ..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          <textarea className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            placeholder="อธิบายสิ่งที่ต้องการ..." rows={3} value={newBody} onChange={e => setNewBody(e.target.value)}
            style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }} />
          <div className="flex items-center gap-3">
            <select className="text-sm bg-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none"
              value={newCat} onChange={e => setNewCat(e.target.value)}>
              {CATEGORIES.filter(c => c !== "ทั้งหมด").map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="flex gap-2 ml-auto">
              <Btn variant="outline" size="sm" onClick={() => setCreating(false)}>ยกเลิก</Btn>
              <Btn variant="primary" size="sm" onClick={submitRequest} disabled={!newTitle || !newBody}>ตั้งกระทู้</Btn>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {/* Request list */}
        <div className="w-64 flex-shrink-0 space-y-2">
          {requests.map(r => (
            <button key={r.id}
              className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${selected === r.id ? "bg-card border-border" : "border-transparent hover:bg-black/[0.03]"}`}
              onClick={() => setSelected(r.id)}>
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-snug truncate">{r.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-muted-foreground">{r.category}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{r.replies.length} ตอบ</span>
                    {r.bestReplyId && <span className="text-[10px] font-mono text-green-400">✓ มีคำตอบ</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Thread */}
        <div className="flex-1 min-w-0">
          {req ? (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={req.author} size={36} />
                  <div>
                    <p className="font-semibold text-foreground" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>{req.title}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{req.author} · {req.category} · {req.createdAt}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>{req.body}</p>
              </div>

              <p className="text-xs font-mono text-muted-foreground">{req.replies.length} คำตอบ</p>

              {req.replies.map(reply => {
                const attachedPrompt = reply.attachedPromptId ? prompts.find(p => p.id === reply.attachedPromptId) : undefined;
                const isBest = req.bestReplyId === reply.id;
                return (
                  <div key={reply.id} className={`rounded-xl border p-4 ${isBest ? "border-green-400/30 bg-green-400/5" : "border-border bg-card"}`}>
                    <div className="flex items-start gap-3">
                      <Avatar name={reply.author} size={28} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-foreground">{reply.author}</span>
                          <span className="text-[11px] font-mono text-muted-foreground">{reply.createdAt}</span>
                          {isBest && <span className="text-[10px] font-mono text-green-400 bg-green-400/10 border border-green-400/20 px-1.5 py-0.5 rounded">✓ คำตอบที่ดีที่สุด</span>}
                        </div>
                        <p className="text-sm text-muted-foreground" style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }}>{reply.body}</p>
                        {attachedPrompt && (
                          <button className="mt-2 flex items-center gap-2 w-full text-left p-2.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                            onClick={() => { setDetailId(attachedPrompt.id); setScreen("detail"); }}>
                            <Zap size={12} className="text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-primary truncate">{attachedPrompt.titleTh}</p>
                              <p className="text-[11px] text-muted-foreground font-mono">{attachedPrompt.category} · ⭐ {attachedPrompt.stars}</p>
                            </div>
                          </button>
                        )}
                      </div>
                      {role !== "guest" && req.author === "สมชาย ว." && (
                        <button className={`flex-shrink-0 p-1.5 rounded-lg text-xs transition-colors ${isBest ? "text-green-400 bg-green-400/10" : "text-muted-foreground hover:text-green-400 hover:bg-green-400/10"}`}
                          onClick={() => setBest(req.id, reply.id)} title="เลือกเป็นคำตอบที่ดีที่สุด">
                          <ThumbsUp size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {req.replies.length === 0 && (
                <div className="py-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                  <HelpCircle size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">ยังไม่มีคำตอบ</p>
                </div>
              )}

              {role !== "guest" ? (
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-foreground">ตอบกระทู้</p>
                  <textarea className="w-full px-3 py-2.5 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    placeholder="คำแนะนำ หรือ prompt ที่ตรงกับความต้องการ..." rows={3} value={replyText} onChange={e => setReplyText(e.target.value)}
                    style={{ fontFamily: "'IBM Plex Sans Thai', sans-serif" }} />
                  <div className="flex items-center gap-2">
                    <select className="flex-1 text-sm bg-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none"
                      value={replyPromptId ?? ""} onChange={e => setReplyPromptId(e.target.value ? Number(e.target.value) : undefined)}>
                      <option value="">แนบ Prompt (ไม่บังคับ)</option>
                      {prompts.filter(p => p.status === "active").map(p => <option key={p.id} value={p.id}>{p.titleTh}</option>)}
                    </select>
                    <Btn variant="primary" size="sm" onClick={submitReply} disabled={!replyText}>ส่งคำตอบ</Btn>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-center text-muted-foreground py-3 border border-dashed border-border rounded-lg">
                  <button className="text-primary hover:underline" onClick={() => setScreen("login")}>เข้าสู่ระบบ</button> เพื่อตอบกระทู้
                </p>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-muted-foreground">
              <MessageCircleQuestion size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">เลือกกระทู้จากด้านซ้าย</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("feed");
  const [role, setRole] = useState<Role>("guest");
  const [search, setSearch] = useState("");
  const [prompts, setPrompts] = useState<Prompt[]>(INITIAL_PROMPTS);
  const [detailId, setDetailId] = useState<number>(1);
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS);
  const [following, setFollowing] = useState<string[]>([]);
  const [profileAuthor, setProfileAuthor] = useState<string>("");
  const [builderFragments, setBuilderFragments] = useState<Prompt[]>([]);
  const [requests, setRequests] = useState<Request[]>(INITIAL_REQUESTS);

  return (
    <div className="min-h-screen bg-background">
      <Navbar role={role} screen={screen} setScreen={setScreen} setRole={setRole} search={search} setSearch={setSearch} />

      {screen === "feed" && (
        <FeedScreen role={role} prompts={prompts} setPrompts={setPrompts} setScreen={setScreen}
          setDetailId={setDetailId} setProfileAuthor={setProfileAuthor}
          collections={collections} setCollections={setCollections} search={search} />
      )}
      {screen === "login" && <LoginScreen setRole={setRole} setScreen={setScreen} />}
      {screen === "create" && (
        <CreateScreen setScreen={setScreen} setPrompts={setPrompts}
          builderFragments={builderFragments} setBuilderFragments={setBuilderFragments} />
      )}
      {screen === "detail" && (
        <DetailScreen promptId={detailId} prompts={prompts} setPrompts={setPrompts}
          role={role} setScreen={setScreen} setProfileAuthor={setProfileAuthor}
          collections={collections} setCollections={setCollections}
          onAddToBuilder={f => setBuilderFragments(prev => prev.some(x => x.id === f.id) ? prev : [...prev, f])} />
      )}
      {screen === "admin" && <AdminScreen prompts={prompts} setPrompts={setPrompts} />}
      {screen === "collections" && (
        <MyCollectionsScreen collections={collections} setCollections={setCollections}
          prompts={prompts} setScreen={setScreen} setDetailId={setDetailId} />
      )}
      {screen === "profile" && (
        <CreatorProfileScreen author={profileAuthor} prompts={prompts} role={role}
          following={following} setFollowing={setFollowing} setScreen={setScreen} setDetailId={setDetailId} />
      )}
      {screen === "requests" && (
        <RequestBoardScreen requests={requests} setRequests={setRequests}
          prompts={prompts} role={role} setScreen={setScreen} setDetailId={setDetailId} />
      )}
    </div>
  );
}
