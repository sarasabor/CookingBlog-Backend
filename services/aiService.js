import OpenAI from "openai";
import Groq from "groq-sdk";

// Initialize AI clients (Groq preferred as it's free and faster!)
const groq = process.env.GROQ_API_KEY
  ? new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })
  : null;

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Use Groq if available (free!), otherwise OpenAI
const aiClient = groq || openai;
const aiProvider = groq ? "Groq" : openai ? "OpenAI" : null;

/**
 * Detect if user wants recipes or just conversation
 */
const detectRecipeIntent = async (prompt, lang = "en") => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Keywords that indicate recipe request
  const recipeKeywords = {
    en: ['recipe', 'cook', 'make', 'prepare', 'dish', 'meal', 'food', 'cuisine', 'eat', 'dinner', 'lunch', 'breakfast', 'dessert', 'snack', 'suggest', 'recommend', 'want', 'need', 'craving', 'hungry'],
    fr: ['recette', 'cuisiner', 'faire', 'préparer', 'plat', 'repas', 'nourriture', 'cuisine', 'manger', 'dîner', 'déjeuner', 'petit-déjeuner', 'dessert', 'collation', 'suggérer', 'recommander', 'veux', 'besoin', 'envie', 'faim'],
    ar: ['وصفة', 'طبخ', 'صنع', 'تحضير', 'طبق', 'وجبة', 'طعام', 'أكل', 'عشاء', 'غداء', 'فطور', 'حلويات', 'اقتراح', 'أريد', 'أحتاج', 'جائع']
  };
  
  // Conversational keywords that indicate NO recipe request
  const conversationalKeywords = {
    en: ['hello', 'hi', 'hey', 'thanks', 'thank you', 'bye', 'goodbye', 'how are you', 'what is', 'who are you', 'help', 'explain', 'tell me about', 'what does', 'why', 'when', 'where', 'how to', 'can you'],
    fr: ['bonjour', 'salut', 'merci', 'au revoir', 'comment vas-tu', 'qui es-tu', 'aide', 'explique', 'dis-moi', 'qu\'est-ce', 'pourquoi', 'quand', 'où', 'comment'],
    ar: ['مرحبا', 'السلام', 'شكرا', 'وداعا', 'كيف حالك', 'من أنت', 'مساعدة', 'اشرح', 'أخبرني', 'ما هو', 'لماذا', 'متى', 'أين']
  };
  
  const keywords = recipeKeywords[lang] || recipeKeywords.en;
  const conversational = conversationalKeywords[lang] || conversationalKeywords.en;
  
  // Check if it's clearly conversational
  const isConversational = conversational.some(keyword => lowerPrompt.includes(keyword));
  if (isConversational && lowerPrompt.length < 50) {
    return false; // It's just conversation
  }
  
  // Check if it's a recipe request
  const isRecipe = keywords.some(keyword => lowerPrompt.includes(keyword));
  
  // Default: if mentions ingredients or mood, assume recipe request
  if (!isRecipe && !isConversational) {
    return lowerPrompt.length > 20; // Longer messages are likely recipe requests
  }
  
  return isRecipe;
};

/**
 * Generate recipe suggestions using OpenAI GPT
 * @param {Object} params - Parameters for recipe generation
 * @param {string} params.prompt - User's request in natural language
 * @param {string} params.mood - User's mood (optional)
 * @param {Array<string>} params.ingredients - Available ingredients (optional)
 * @param {number} params.servings - Number of servings
 * @param {string} params.lang - Language (en, fr, ar)
 * @returns {Promise<Object>} - Generated recipes and message
 */
export const generateRecipeSuggestions = async ({ 
  prompt, 
  mood, 
  ingredients = [], 
  servings = 2, 
  lang = "en" 
}) => {
  if (!aiClient) {
    throw new Error("No AI provider configured. Please set GROQ_API_KEY (free!) or OPENAI_API_KEY in your environment variables.");
  }

  console.log(`🤖 Using AI Provider: ${aiProvider}`);
  
  // Step 1: Detect if user wants recipes or just conversation
  const isRecipeRequest = await detectRecipeIntent(prompt, lang);

  // Build the system prompt based on language
  const systemPrompts = {
    en: `You are a professional chef and culinary expert with expertise in cuisines from around the world. Your role is to suggest creative, delicious, and practical recipes based on user requests.

IMPORTANT: Each time you generate recipes, they MUST be completely different from previous suggestions. Think creatively and explore diverse cuisines, cooking techniques, and flavor profiles.

Guidelines:
- Generate 3 UNIQUE and DIVERSE recipe suggestions that are DIFFERENT each time
- Explore different cuisines: Mediterranean, Asian, Latin American, Middle Eastern, African, European, etc.
- Vary cooking methods: grilling, roasting, steaming, sautéing, baking, braising, etc.
- Mix difficulty levels across the 3 recipes
- Each recipe should be complete with ingredients and instructions
- Consider the user's mood, available ingredients, and preferences
- Provide recipes that are realistic and achievable
- Include cooking time, difficulty level, and nutritional highlights
- Be CREATIVE and INNOVATIVE - surprise the user with unexpected but delicious combinations

Format your response as a JSON object with this exact structure:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "Brief description (2-3 sentences)",
      "ingredients": [
        {"name": "ingredient name", "quantity": "amount", "unit": "measurement"}
      ],
      "instructions": [
        "Step 1 instruction",
        "Step 2 instruction"
      ],
      "cookTime": 30,
      "difficulty": "easy|medium|hard",
      "tags": ["tag1", "tag2"],
      "nutritionHighlights": "Brief nutrition info"
    }
  ]
}`,
    fr: `Vous êtes un chef professionnel et expert culinaire avec une expertise dans les cuisines du monde entier. Votre rôle est de suggérer des recettes créatives, délicieuses et pratiques basées sur les demandes des utilisateurs.

IMPORTANT: À chaque fois que vous générez des recettes, elles DOIVENT être complètement différentes des suggestions précédentes. Pensez de manière créative et explorez diverses cuisines, techniques de cuisson et profils de saveurs.

Directives:
- Générez 3 suggestions de recettes UNIQUES et DIVERSIFIÉES qui sont DIFFÉRENTES à chaque fois
- Explorez différentes cuisines: méditerranéenne, asiatique, latino-américaine, moyen-orientale, africaine, européenne, etc.
- Variez les méthodes de cuisson: grillades, rôtissage, vapeur, sauté, cuisson au four, braisage, etc.
- Mélangez les niveaux de difficulté parmi les 3 recettes
- Chaque recette doit être complète avec ingrédients et instructions
- Considérez l'humeur de l'utilisateur, les ingrédients disponibles et les préférences
- Fournissez des recettes réalistes et réalisables
- Incluez le temps de cuisson, le niveau de difficulté et les points nutritionnels
- Soyez CRÉATIF et INNOVANT - surprenez l'utilisateur avec des combinaisons inattendues mais délicieuses

Formatez votre réponse comme un objet JSON avec cette structure exacte:
{
  "recipes": [
    {
      "title": "Nom de la recette",
      "description": "Brève description (2-3 phrases)",
      "ingredients": [
        {"name": "nom de l'ingrédient", "quantity": "quantité", "unit": "mesure"}
      ],
      "instructions": [
        "Instruction étape 1",
        "Instruction étape 2"
      ],
      "cookTime": 30,
      "difficulty": "facile|moyen|difficile",
      "tags": ["tag1", "tag2"],
      "nutritionHighlights": "Brève info nutritionnelle"
    }
  ]
}`,
    ar: `أنت طاهٍ محترف وخبير في الطهي. دورك هو اقتراح وصفات إبداعية ولذيذة وعملية بناءً على طلبات المستخدمين.

الإرشادات:
- قم بإنشاء 3 اقتراحات وصفات فريدة ومتنوعة
- يجب أن تكون كل وصفة كاملة مع المكونات والتعليمات
- ضع في اعتبارك مزاج المستخدم والمكونات المتاحة والتفضيلات
- قدم وصفات واقعية وقابلة للتحقيق
- قم بتضمين وقت الطهي ومستوى الصعوبة والنقاط الغذائية
- كن مبدعاً ولكن عملياً

قم بتنسيق ردك ككائن JSON بهذا الهيكل بالضبط:
{
  "recipes": [
    {
      "title": "اسم الوصفة",
      "description": "وصف موجز (2-3 جمل)",
      "ingredients": [
        {"name": "اسم المكون", "quantity": "الكمية", "unit": "الوحدة"}
      ],
      "instructions": [
        "تعليمات الخطوة 1",
        "تعليمات الخطوة 2"
      ],
      "cookTime": 30,
      "difficulty": "سهل|متوسط|صعب",
      "tags": ["tag1", "tag2"],
      "nutritionHighlights": "معلومات غذائية موجزة"
    }
  ]
}`
  };

  // Build user prompt with context and randomization
  const timestamp = Date.now();
  const randomSeed = Math.floor(Math.random() * 1000);
  
  // Add variety elements to ensure different recipes each time
  const cuisineStyles = ['traditional', 'fusion', 'modern', 'rustic', 'gourmet', 'comfort food', 'healthy', 'indulgent'];
  const randomStyle = cuisineStyles[Math.floor(Math.random() * cuisineStyles.length)];
  
  let userPrompt = prompt;
  
  if (mood) {
    const moodTexts = {
      en: `I'm feeling ${mood}.`,
      fr: `Je me sens ${mood}.`,
      ar: `أشعر بـ ${mood}.`
    };
    userPrompt += ` ${moodTexts[lang] || moodTexts.en}`;
  }
  
  if (ingredients.length > 0) {
    const ingredientTexts = {
      en: `I have these ingredients available: ${ingredients.join(", ")}.`,
      fr: `J'ai ces ingrédients disponibles: ${ingredients.join(", ")}.`,
      ar: `لدي هذه المكونات المتاحة: ${ingredients.join("، ")}.`
    };
    userPrompt += ` ${ingredientTexts[lang] || ingredientTexts.en}`;
  }
  
  const servingTexts = {
    en: `I need to cook for ${servings} ${servings === 1 ? 'person' : 'people'}.`,
    fr: `Je dois cuisiner pour ${servings} ${servings === 1 ? 'personne' : 'personnes'}.`,
    ar: `أحتاج للطهي لـ ${servings} ${servings === 1 ? 'شخص' : 'أشخاص'}.`
  };
  userPrompt += ` ${servingTexts[lang] || servingTexts.en}`;
  
  // Add creativity prompt with randomization
  const creativityTexts = {
    en: `Please suggest ${randomStyle} style recipes. Make them creative and different from typical recipes. Request ID: ${randomSeed}`,
    fr: `Veuillez suggérer des recettes de style ${randomStyle}. Rendez-les créatives et différentes des recettes typiques. ID de demande: ${randomSeed}`,
    ar: `يرجى اقتراح وصفات بأسلوب ${randomStyle}. اجعلها إبداعية ومختلفة عن الوصفات النموذجية. معرف الطلب: ${randomSeed}`
  };
  userPrompt += ` ${creativityTexts[lang] || creativityTexts.en}`;

  try {
    console.log(`🤖 Calling ${aiProvider} with prompt:`, userPrompt);
    console.log(`📋 Intent detected: ${isRecipeRequest ? 'RECIPE REQUEST' : 'CONVERSATION'}`);

    // Select the appropriate model based on provider
    const model = groq 
      ? (process.env.GROQ_MODEL || "llama-3.3-70b-versatile")  // Groq models (updated to latest)
      : (process.env.OPENAI_MODEL || "gpt-4o-mini");           // OpenAI models

    // If it's NOT a recipe request, just have a conversation
    if (!isRecipeRequest) {
      const conversationPrompt = {
        en: `You are a friendly AI chef assistant. The user just said: "${prompt}". 
Respond naturally and warmly as a chef would. Keep it brief and conversational.
Do NOT generate recipes unless specifically asked.
If they're just greeting you, saying thanks, or asking a simple question, just respond appropriately without recipes.`,
        fr: `Vous êtes un assistant chef IA amical. L'utilisateur vient de dire: "${prompt}".
Répondez naturellement et chaleureusement comme un chef le ferait. Soyez bref et conversationnel.
NE générez PAS de recettes sauf si on vous le demande spécifiquement.
S'ils vous saluent, vous remercient ou posent une question simple, répondez simplement sans recettes.`,
        ar: `أنت مساعد طاهٍ ذكي ودود. قال المستخدم للتو: "${prompt}".
أجب بشكل طبيعي ودافئ كما يفعل الطاهي. كن موجزاً ومحادثاً.
لا تقم بإنشاء وصفات إلا إذا طُلب منك ذلك على وجه التحديد.
إذا كانوا يحيونك فقط أو يشكرونك أو يطرحون سؤالاً بسيطاً، فقط أجب بشكل مناسب بدون وصفات.`
      };

      const completion = await aiClient.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: conversationPrompt[lang] || conversationPrompt.en
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      const conversationResponse = completion.choices[0].message.content;
      console.log(`✅ ${aiProvider} Conversation Response: ${conversationResponse.substring(0, 100)}...`);

      return {
        message: conversationResponse,
        recipes: [],
        isConversation: true
      };
    }

    // If it IS a recipe request, generate recipes with JSON format
    // Build completion options
    const completionOptions = {
      model: model,
      messages: [
        {
          role: "system",
          content: systemPrompts[lang] || systemPrompts.en
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 1.0, // Maximum creativity for diverse recipes
      max_tokens: 2500,
      top_p: 0.95 // Nucleus sampling for more variety
    };

    // Only add response_format for OpenAI (Groq doesn't support it)
    if (!groq && openai) {
      completionOptions.response_format = { type: "json_object" };
    }

    const completion = await aiClient.chat.completions.create(completionOptions);

    const responseContent = completion.choices[0].message.content;
    console.log(`✅ ${aiProvider} Response received`);

    // Parse the JSON response
    let recipesData;
    try {
      // Clean the response: remove markdown code blocks if present
      let cleanedContent = responseContent.trim();
      
      // Remove markdown code blocks (```json ... ``` or ``` ... ```)
      const codeBlockMatch = cleanedContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        cleanedContent = codeBlockMatch[1].trim();
      }
      
      // Remove any leading text before the JSON object
      const jsonStart = cleanedContent.indexOf('{');
      if (jsonStart > 0) {
        cleanedContent = cleanedContent.substring(jsonStart);
      }
      
      // Remove any trailing text after the JSON object
      const jsonEnd = cleanedContent.lastIndexOf('}');
      if (jsonEnd > 0 && jsonEnd < cleanedContent.length - 1) {
        cleanedContent = cleanedContent.substring(0, jsonEnd + 1);
      }

      console.log("🧹 Cleaned response (first 200 chars):", cleanedContent.substring(0, 200));

      const parsed = JSON.parse(cleanedContent);
      console.log("📦 Parsed AI response:", JSON.stringify(parsed).substring(0, 200));
      
      // Handle both array and object with recipes array
      if (Array.isArray(parsed)) {
        recipesData = parsed;
      } else if (parsed.recipes && Array.isArray(parsed.recipes)) {
        recipesData = parsed.recipes;
      } else {
        console.error("❌ Unexpected response format:", parsed);
        throw new Error("Invalid response format from AI");
      }

      if (!recipesData || recipesData.length === 0) {
        throw new Error("No recipes generated by AI");
      }
    } catch (parseError) {
      console.error("❌ Error parsing OpenAI response:", parseError);
      console.error("Response content:", responseContent);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }

    // Transform AI recipes to match our application format
    const transformedRecipes = recipesData.map((recipe, index) => ({
      _id: `ai-generated-${Date.now()}-${index}`,
      title: {
        en: recipe.title,
        fr: recipe.title,
        ar: recipe.title
      },
      description: {
        en: recipe.description,
        fr: recipe.description,
        ar: recipe.description
      },
      ingredients: recipe.ingredients.map(ing => ({
        name: {
          en: ing.name,
          fr: ing.name,
          ar: ing.name
        },
        quantity: ing.quantity,
        unit: ing.unit || ""
      })),
      instructions: {
        en: recipe.instructions,
        fr: recipe.instructions,
        ar: recipe.instructions
      },
      cookTime: recipe.cookTime || 30,
      difficulty: recipe.difficulty || "medium",
      tags: recipe.tags || [],
      image: "/placeholder-recipe.jpg",
      isAIGenerated: true,
      generatedAt: new Date().toISOString(),
      nutritionHighlights: recipe.nutritionHighlights || ""
    }));

    // Generate a friendly message
    const messages = {
      en: `I've created ${transformedRecipes.length} unique recipes just for you! These are freshly generated based on your request. Each recipe is tailored to your preferences and available ingredients. Enjoy cooking! 🍳✨`,
      fr: `J'ai créé ${transformedRecipes.length} recettes uniques rien que pour vous ! Elles sont fraîchement générées selon votre demande. Chaque recette est adaptée à vos préférences et ingrédients disponibles. Bon appétit ! 🍳✨`,
      ar: `لقد أنشأت ${transformedRecipes.length} وصفات فريدة خصيصًا لك! تم إنشاؤها حديثًا بناءً على طلبك. كل وصفة مصممة خصيصًا لتفضيلاتك والمكونات المتاحة. استمتع بالطهي! 🍳✨`
    };

    return {
      message: messages[lang] || messages.en,
      recipes: transformedRecipes,
      isAIGenerated: true,
      prompt: userPrompt
    };

  } catch (error) {
    console.error(`❌ ${aiProvider} API Error:`, error);
    
    // Provide helpful error messages
    if (error.status === 401) {
      throw new Error(`Invalid ${aiProvider} API key. Please check your configuration.`);
    } else if (error.status === 429) {
      throw new Error(`${aiProvider} API rate limit exceeded. Please try again later.`);
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error(`Unable to connect to ${aiProvider} API. Please check your internet connection.`);
    }
    
    throw new Error(`AI service error: ${error.message}`);
  }
};

export default {
  generateRecipeSuggestions
};

