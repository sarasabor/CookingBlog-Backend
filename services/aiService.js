import OpenAI from "openai";

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

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
  if (!openai) {
    throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.");
  }

  // Build the system prompt based on language
  const systemPrompts = {
    en: `You are a professional chef and culinary expert. Your role is to suggest creative, delicious, and practical recipes based on user requests. 

Guidelines:
- Generate 3 unique and diverse recipe suggestions
- Each recipe should be complete with ingredients and instructions
- Consider the user's mood, available ingredients, and preferences
- Provide recipes that are realistic and achievable
- Include cooking time, difficulty level, and nutritional highlights
- Be creative but practical

Format your response as a JSON array with this exact structure:
[
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
]`,
    fr: `Vous êtes un chef professionnel et expert culinaire. Votre rôle est de suggérer des recettes créatives, délicieuses et pratiques basées sur les demandes des utilisateurs.

Directives:
- Générez 3 suggestions de recettes uniques et diversifiées
- Chaque recette doit être complète avec ingrédients et instructions
- Considérez l'humeur de l'utilisateur, les ingrédients disponibles et les préférences
- Fournissez des recettes réalistes et réalisables
- Incluez le temps de cuisson, le niveau de difficulté et les points nutritionnels
- Soyez créatif mais pratique

Formatez votre réponse comme un tableau JSON avec cette structure exacte:
[
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
]`,
    ar: `أنت طاهٍ محترف وخبير في الطهي. دورك هو اقتراح وصفات إبداعية ولذيذة وعملية بناءً على طلبات المستخدمين.

الإرشادات:
- قم بإنشاء 3 اقتراحات وصفات فريدة ومتنوعة
- يجب أن تكون كل وصفة كاملة مع المكونات والتعليمات
- ضع في اعتبارك مزاج المستخدم والمكونات المتاحة والتفضيلات
- قدم وصفات واقعية وقابلة للتحقيق
- قم بتضمين وقت الطهي ومستوى الصعوبة والنقاط الغذائية
- كن مبدعاً ولكن عملياً

قم بتنسيق ردك كمصفوفة JSON بهذا الهيكل بالضبط:
[
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
]`
  };

  // Build user prompt with context
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

  try {
    console.log("🤖 Calling OpenAI with prompt:", userPrompt);

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
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
      temperature: 0.8,
      max_tokens: 2500,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0].message.content;
    console.log("✅ OpenAI Response received");

    // Parse the JSON response
    let recipesData;
    try {
      const parsed = JSON.parse(responseContent);
      // Handle both array and object with recipes array
      recipesData = Array.isArray(parsed) ? parsed : (parsed.recipes || []);
    } catch (parseError) {
      console.error("❌ Error parsing OpenAI response:", parseError);
      throw new Error("Failed to parse AI response");
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
    console.error("❌ OpenAI API Error:", error);
    
    // Provide helpful error messages
    if (error.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your configuration.");
    } else if (error.status === 429) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later.");
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error("Unable to connect to OpenAI API. Please check your internet connection.");
    }
    
    throw new Error(`AI service error: ${error.message}`);
  }
};

export default {
  generateRecipeSuggestions
};

