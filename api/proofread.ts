import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  // Set CORS headers if needed
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Faqat POST so‘rovlari qabul qilinadi.',
    });
  }

  try {
    const { text, language = 'auto', mode = 'errors_only' } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Iltimos, tekshirish uchun matn kiriting.',
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Matn hajmi 5000 belgidan oshmasligi kerak. Hozirda: ' + text.length + ' ta belgi.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY sozlanmagan. Vercel muhit o‘zgaruvchilarida (Environment Variables) GEMINI_API_KEY ni sozlang.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const langInstruction =
      language === 'uz-latn'
        ? "Matn tili: O'zbek tili (Lotin alifbosi). Barcha tuzatishlar qat'iy o'zbek tili me'yorlariga mos bo'lsin."
        : language === 'uz-cyrl'
        ? "Matn tili: Ўзбек тили (Кирилл алифбоси). Барча тузатишлар ўзбек кирилл алифбоси қоидаларига мувофиқ бўлсин."
        : language === 'ru'
        ? "Matn tili: Rus tili (Русский язык). Все исправления должны строго соответствовать правилам русской орфографии и пунктуации."
        : language === 'en'
        ? "Matn tili: Ingliz tili (English). Ensure proper spelling, grammar, and punctuation."
        : "Matn tilini avtomatik aniqla (O'zbek lotin, O'zbek kirill, Rus, yoki Ingliz).";

    const modeInstruction =
      mode === 'improve_style'
        ? "Rejim: 'Uslubni ham yaxshila'. Imlo, grammatika va tinish belgilarini tuzatishdan tashqari, gaplarning ravonligi, so'zlarning to'g'ri tanlanishi va uslubiy ravonligini yaxshila. Lekin matnning asosiy ma'nosi va g'oyasini o'zgartirma."
        : "Rejim: 'Faqat xatolarni tuzat'. Qat'iy talab: matnning ma'nosini va uslubini o'zgartirma! Faqatgina imlo (orfografiya), grammatika va tinish belgilari (punktuatsiya) xatolarini to'g'rilagin. Xato bo'lmagan so'zlarni shunchaki sinonimlariga almashtirma.";

    const systemInstruction = `Sen yuqori malakali professional muharrir, tilshunos va matn korrektori sanalasan.
Vazifang: Foydalanuvchi taqdim etgan matnni tahlil qilib, xatolarni tuzatish va qilingan har bir o'zgarishga o'zbek tilida aniq izoh berish.

Talablar va Qoidalar:
1. ${langInstruction}
2. ${modeInstruction}
3. Ma'noni aslo buzma yoki o'zgartirma, faqat xatolarni tuzat.
4. O'zbek tili (lotin) uchun: o' va g' harflari hamda tutuq belgisini (masalan: o'qish, g'alaba, ma'lumot, e'tibor, go'zal) to'g'ri qo'llagin.
5. Har bir o'zgarishni 'changes' massivida bitta-bitta ko'rsat:
   - 'original': xato yozilgan so'z yoki ibora (original matndan aniq parcha)
   - 'fixed': to'g'rilangan ko'rinishi
   - 'reason': o'zbek tilida londa va tushunarli sabab (masalan: "'bugun' so'zi birga yoziladi", "Vergul yetishmayotgan edi", "Imlo xatosi: 'kitoblar' o'rniga 'kitoblar'")
   - 'type': 'spelling' (imlo), 'grammar' (grammatika), 'punctuation' (tinish belgisi), yoki 'style' (uslub)
6. Agar matnda hech qanday xato bo'lmasa, 'changes' bo'sh massiv bo'lsin [] va 'corrected_text' asl matn bilan bir xil bo'lsin.
7. Natijani belgilangan JSON sxemasida qaytar.`;

    const config = {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detected_language: {
            type: Type.STRING,
            description: "Til kodi: 'uz-latn', 'uz-cyrl', 'ru', yoki 'en'",
          },
          language_label: {
            type: Type.STRING,
            description: "Til nomi o'zbek tilida, masalan: 'O‘zbekcha (lotin)', 'O‘zbekcha (kirill)', 'Ruscha', 'Inglizcha'",
          },
          corrected_text: {
            type: Type.STRING,
            description: "To'liq to'g'rilangan matn",
          },
          changes: {
            type: Type.ARRAY,
            description: "Matnda qilingan barcha tuzatishlar ro'yxati",
            items: {
              type: Type.OBJECT,
              properties: {
                original: {
                  type: Type.STRING,
                  description: "Xato bo'lgan asl so'z yoki ibora",
                },
                fixed: {
                  type: Type.STRING,
                  description: "Tuzatilgan so'z yoki ibora",
                },
                reason: {
                  type: Type.STRING,
                  description: "O'zbek tilidagi qisqa va aniq izoh",
                },
                type: {
                  type: Type.STRING,
                  description: "Xato turi: 'spelling', 'grammar', 'punctuation', yoki 'style'",
                },
              },
              required: ['original', 'fixed', 'reason', 'type'],
            },
          },
        },
        required: ['detected_language', 'language_label', 'corrected_text', 'changes'],
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: text,
      config,
    });

    const responseText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(responseText);

    return res.status(200).json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Vercel API error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Matnni tahlil qilishda kutilmagan xatolik yuz berdi.',
    });
  }
}
