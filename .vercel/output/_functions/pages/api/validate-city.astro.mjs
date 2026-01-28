export { r as renderers } from '../../chunks/_@astro-renderers_1ISMqT13.mjs';

const POST = async ({ request }) => {
  try {
    const { city, language } = await request.json();
    if (!city || typeof city !== "string") {
      return new Response(
        JSON.stringify({
          isValid: false,
          message: "City name is required"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const isValid = await validateCityWithPerplexity(city, language);
    if (isValid) {
      return new Response(
        JSON.stringify({
          isValid: true,
          message: language === "ru" ? `Город ${city} найден в Шри-Ланке` : `City ${city} found in Sri Lanka`
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({
          isValid: false,
          message: language === "ru" ? `Город "${city}" не найден в Шри-Ланке. Проверьте название.` : `City "${city}" not found in Sri Lanka. Please check the name.`
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("City validation error:", error);
    return new Response(
      JSON.stringify({
        isValid: false,
        message: "Validation error. Please try again."
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
async function validateCityWithPerplexity(cityName, language) {
  const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
  if (!PERPLEXITY_API_KEY) {
    console.warn("PERPLEXITY_API_KEY not set. Using fallback validation.");
    return fallbackCityValidation(cityName);
  }
  try {
    const prompt = language === "ru" ? `Существует ли город или населённый пункт с названием "${cityName}" в Шри-Ланке? Ответь только "да" или "нет" и укажи правильное написание, если есть.` : `Does a city or town named "${cityName}" exist in Sri Lanka? Answer only "yes" or "no" and provide the correct spelling if available.`;
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "You are a geographic expert on Sri Lanka. Answer concisely with yes/no."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 100
      })
    });
    if (!response.ok) {
      console.error("Perplexity API error:", response.status);
      return fallbackCityValidation(cityName);
    }
    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.toLowerCase() || "";
    if (answer.includes("yes") || answer.includes("да") || answer.includes("существует")) {
      return true;
    }
    if (answer.includes("no") || answer.includes("нет") || answer.includes("не существует")) {
      return false;
    }
    return fallbackCityValidation(cityName);
  } catch (error) {
    console.error("Perplexity validation error:", error);
    return fallbackCityValidation(cityName);
  }
}
function fallbackCityValidation(cityName) {
  const normalizedCity = cityName.toLowerCase().trim();
  const knownCities = [
    // Популярные туристические
    "unawatuna",
    "унаватуна",
    "mirissa",
    "мирисса",
    "hikkaduwa",
    "хиккадува",
    "tangalle",
    "тангалле",
    "weligama",
    "велигама",
    "galle",
    "галле",
    "ahangama",
    "аханагама",
    // Крупные города
    "colombo",
    "коломбо",
    "kandy",
    "канди",
    "negombo",
    "негомбо",
    "jaffna",
    "джаффна",
    "trincomalee",
    "тринкомали",
    "batticaloa",
    "баттикалоа",
    "anuradhapura",
    "анурадхапура",
    "polonnaruwa",
    "полоннарува",
    // Южное побережье
    "matara",
    "матара",
    "hambantota",
    "хамбантота",
    "bentota",
    "бентота",
    "beruwala",
    "берувала",
    "kalutara",
    "калутара",
    "koggala",
    "коггала",
    "dikwella",
    "диквелла",
    "hiriketiya",
    "хирикетия",
    // Восточное побережье
    "arugam bay",
    "аругам бэй",
    "arugambay",
    "аругамбей",
    "nilaveli",
    "нилавели",
    "passikudah",
    "пассикудах",
    "kalkudah",
    "калкудах",
    // Западное побережье
    "mount lavinia",
    "маунт лавиния",
    "wadduwa",
    "ваддува",
    "aluthgama",
    "алутгама",
    "induruwa",
    "индурува",
    "kosgoda",
    "косгода",
    "balapitiya",
    "балапития",
    // Центральная часть
    "ella",
    "элла",
    "nuwara eliya",
    "нувара элия",
    "haputale",
    "хапутале",
    "bandarawela",
    "бандаравела",
    "badulla",
    "бадулла",
    "dambulla",
    "дамбулла",
    "sigiriya",
    "сигирия",
    "kegalle",
    "кегалле",
    "ratnapura",
    "ратнапура",
    // Другие популярные места
    "yala",
    "яла",
    "udawalawe",
    "удавалаве",
    "kitulgala",
    "китулгала",
    "pinnawala",
    "пиннавала",
    "chilaw",
    "чилау",
    "puttalam",
    "путталам",
    "mannar",
    "маннар",
    "vavuniya",
    "вавуния",
    "kurunegala",
    "курунегала",
    "gampaha",
    "гампаха",
    "moratuwa",
    "моратува",
    "dehiwala",
    "дехивала"
  ];
  if (knownCities.includes(normalizedCity)) {
    return true;
  }
  const fuzzyMatch = knownCities.some((city) => {
    return levenshteinDistance(normalizedCity, city) <= 2;
  });
  return fuzzyMatch;
}
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        // deletion
        matrix[i][j - 1] + 1,
        // insertion
        matrix[i - 1][j - 1] + cost
        // substitution
      );
    }
  }
  return matrix[len1][len2];
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
