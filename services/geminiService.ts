import { GoogleGenAI } from "@google/genai"
import type { MealPreferences, GeneratedPlan, DayMealPlan, Meal, GroceryListItem } from "../types"

// Replace this with your actual Gemini API key from https://aistudio.google.com/app/apikey
const API_KEY = "AIzaSyB8loTKfhCvmitfwaDxiCgSf3O1kHpSkAo"

const MODEL_NAME = "gemini-2.0-flash-exp"

// Dietary restriction validation
const DIETARY_KEYWORDS = {
  vegan: {
    keywords: ["vegan", "plant-based", "plant based"],
    forbidden: [
      "meat",
      "chicken",
      "beef",
      "pork",
      "fish",
      "seafood",
      "milk",
      "dairy",
      "cheese",
      "egg",
      "honey",
      "yogurt",
      "butter",
      "cream",
    ],
  },
  vegetarian: {
    keywords: ["vegetarian"],
    forbidden: ["meat", "chicken", "beef", "pork", "fish", "seafood"],
  },
  pescatarian: {
    keywords: ["pescatarian"],
    forbidden: ["meat", "chicken", "beef", "pork"],
  },
  dairyFree: {
    keywords: ["dairy-free", "dairy free", "no dairy"],
    forbidden: ["milk", "cheese", "yogurt", "butter", "cream", "dairy"],
  },
  glutenFree: {
    keywords: ["gluten-free", "gluten free", "no gluten"],
    forbidden: ["wheat", "gluten", "bread", "pasta", "flour", "barley", "rye"],
  },
  eggFree: {
    keywords: ["egg-free", "egg free", "no eggs"],
    forbidden: ["egg", "eggs"],
  },
}

// Check if a meal plan adheres to dietary restrictions
const validateMealPlan = (
  mealPlan: DayMealPlan[],
  groceryList: GroceryListItem[],
  dietaryRestrictions: string,
): { isValid: boolean; violations: string[] } => {
  if (!dietaryRestrictions) {
    return { isValid: true, violations: [] }
  }

  const dietaryRestrictionLower = dietaryRestrictions.toLowerCase()
  const forbiddenIngredients: string[] = []

  // Collect all forbidden ingredients based on dietary keywords
  Object.values(DIETARY_KEYWORDS).forEach((diet) => {
    if (diet.keywords.some((keyword) => dietaryRestrictionLower.includes(keyword))) {
      forbiddenIngredients.push(...diet.forbidden)
    }
  })

  if (forbiddenIngredients.length === 0) {
    return { isValid: true, violations: [] }
  }

  const violations: string[] = []

  // Check meal plan
  mealPlan.forEach((day) => {
    Object.values(day.meals).forEach((meal) => {
      if (!meal) return

      const mealText = `${meal.name} ${meal.description}`.toLowerCase()
      forbiddenIngredients.forEach((ingredient) => {
        if (mealText.includes(ingredient.toLowerCase()) && !violations.includes(ingredient)) {
          violations.push(ingredient)
        }
      })
    })
  })

  // Check grocery list
  groceryList.forEach((item) => {
    forbiddenIngredients.forEach((ingredient) => {
      if (item.item.toLowerCase().includes(ingredient.toLowerCase()) && !violations.includes(ingredient)) {
        violations.push(ingredient)
      }
    })
  })

  return {
    isValid: violations.length === 0,
    violations,
  }
}

// Demo data for testing without API key
const getDemoMealPlan = (preferences: MealPreferences): GeneratedPlan => {
  const days = Array.from({ length: preferences.numberOfDays }, (_, i) => `Day ${i + 1}`)
  const dietaryRestrictions = preferences.dietaryRestrictions.toLowerCase()
  const isVegan = DIETARY_KEYWORDS.vegan.keywords.some((keyword) => dietaryRestrictions.includes(keyword))
  const isVegetarian =
    isVegan || DIETARY_KEYWORDS.vegetarian.keywords.some((keyword) => dietaryRestrictions.includes(keyword))
  const isDairyFree =
    isVegan || DIETARY_KEYWORDS.dairyFree.keywords.some((keyword) => dietaryRestrictions.includes(keyword))
  const isEggFree =
    isVegan || DIETARY_KEYWORDS.eggFree.keywords.some((keyword) => dietaryRestrictions.includes(keyword))
  const isGlutenFree = DIETARY_KEYWORDS.glutenFree.keywords.some((keyword) => dietaryRestrictions.includes(keyword))

  // Sample meals based on dietary restrictions
  const sampleMeals: Record<string, Meal[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  }

  // Vegan breakfast options
  if (isVegan) {
    sampleMeals.breakfast = [
      {
        name: "Overnight Oats with Berries",
        description: "Steel-cut oats with almond milk, chia seeds, and fresh berries",
        calories: 320,
      },
      {
        name: "Avocado Toast",
        description: "Whole grain bread with smashed avocado, cherry tomatoes, and nutritional yeast",
        calories: 280,
      },
      {
        name: "Tofu Scramble",
        description: "Scrambled tofu with turmeric, nutritional yeast, and vegetables",
        calories: 300,
      },
    ]
    sampleMeals.lunch = [
      {
        name: "Buddha Bowl",
        description: "Quinoa with roasted vegetables, chickpeas, and tahini dressing",
        calories: 450,
      },
      { name: "Lentil Soup", description: "Hearty lentil soup with carrots, celery, and spinach", calories: 380 },
      {
        name: "Falafel Wrap",
        description: "Whole wheat tortilla with falafel, hummus, and fresh vegetables",
        calories: 420,
      },
    ]
    sampleMeals.dinner = [
      {
        name: "Chickpea Curry",
        description: "Spiced chickpeas in coconut milk with vegetables over brown rice",
        calories: 520,
      },
      {
        name: "Vegetable Stir-Fry",
        description: "Mixed vegetables with tofu over brown rice with tamari sauce",
        calories: 480,
      },
      {
        name: "Stuffed Bell Peppers",
        description: "Bell peppers filled with quinoa, black beans, and vegetables",
        calories: 420,
      },
    ]
    sampleMeals.snacks = [
      { name: "Apple with Almond Butter", description: "Fresh apple slices with natural almond butter", calories: 180 },
      { name: "Trail Mix", description: "Mixed nuts, seeds, and dried fruit", calories: 150 },
      { name: "Hummus and Veggies", description: "Fresh vegetables with homemade hummus", calories: 120 },
    ]
  }
  // Vegetarian options (includes dairy/eggs unless specified otherwise)
  else if (isVegetarian) {
    sampleMeals.breakfast = [
      {
        name: "Greek Yogurt Parfait",
        description: isDairyFree
          ? "Coconut yogurt with fresh berries and granola"
          : "Greek yogurt with fresh berries and granola",
        calories: 320,
      },
      {
        name: "Avocado Toast",
        description: isEggFree
          ? "Whole grain bread with smashed avocado and cherry tomatoes"
          : "Whole grain bread with smashed avocado and poached egg",
        calories: 280,
      },
      {
        name: "Overnight Oats",
        description: isDairyFree
          ? "Steel-cut oats with almond milk, banana and almond butter"
          : "Steel-cut oats with milk, banana and almond butter",
        calories: 350,
      },
    ]
    sampleMeals.lunch = [
      {
        name: "Mediterranean Bowl",
        description: "Quinoa with chickpeas, cucumber, and tahini dressing",
        calories: 450,
      },
      {
        name: "Caprese Sandwich",
        description: isDairyFree
          ? "Whole grain bread with tomato, basil, and avocado"
          : "Whole grain bread with tomato, mozzarella, and basil",
        calories: 380,
      },
      { name: "Veggie Wrap", description: "Whole wheat tortilla with hummus and fresh vegetables", calories: 320 },
    ]
    sampleMeals.dinner = [
      {
        name: "Eggplant Parmesan",
        description: isDairyFree
          ? "Baked eggplant with nutritional yeast and marinara sauce"
          : "Baked eggplant with mozzarella and parmesan",
        calories: 520,
      },
      {
        name: "Pasta Primavera",
        description: isDairyFree
          ? "Whole wheat pasta with fresh vegetables and olive oil"
          : "Whole wheat pasta with fresh vegetables and parmesan",
        calories: 480,
      },
      { name: "Vegetable Curry", description: "Mixed vegetables in coconut curry sauce over rice", calories: 420 },
    ]
    sampleMeals.snacks = [
      { name: "Apple with Nut Butter", description: "Fresh apple slices with natural almond butter", calories: 180 },
      { name: "Trail Mix", description: "Mixed nuts, seeds, and dried fruit", calories: 150 },
      { name: "Hummus and Veggies", description: "Fresh vegetables with homemade hummus", calories: 120 },
    ]
  }
  // Regular options
  else {
    sampleMeals.breakfast = [
      {
        name: "Greek Yogurt Parfait",
        description: isDairyFree
          ? "Coconut yogurt with fresh berries and granola"
          : "Greek yogurt with fresh berries and granola",
        calories: 320,
      },
      {
        name: "Avocado Toast",
        description: isEggFree
          ? "Whole grain bread with smashed avocado and cherry tomatoes"
          : "Whole grain bread with smashed avocado and poached egg",
        calories: 280,
      },
      {
        name: "Overnight Oats",
        description: isDairyFree
          ? "Steel-cut oats with almond milk, banana and almond butter"
          : "Steel-cut oats with milk, banana and almond butter",
        calories: 350,
      },
    ]
    sampleMeals.lunch = [
      {
        name: "Mediterranean Bowl",
        description: "Quinoa with chickpeas, cucumber, and tahini dressing",
        calories: 450,
      },
      {
        name: "Grilled Chicken Salad",
        description: "Mixed greens with grilled chicken and balsamic vinaigrette",
        calories: 380,
      },
      {
        name: "Tuna Sandwich",
        description: isGlutenFree ? "Lettuce wrap with tuna salad" : "Whole grain bread with tuna salad and lettuce",
        calories: 320,
      },
    ]
    sampleMeals.dinner = [
      {
        name: "Salmon with Roasted Vegetables",
        description: "Baked salmon with seasonal roasted vegetables",
        calories: 520,
      },
      {
        name: "Pasta Primavera",
        description: isGlutenFree
          ? "Gluten-free pasta with fresh vegetables and olive oil"
          : "Whole wheat pasta with fresh vegetables and olive oil",
        calories: 480,
      },
      { name: "Stir-Fry Bowl", description: "Chicken and mixed vegetables over brown rice", calories: 420 },
    ]
    sampleMeals.snacks = [
      { name: "Apple with Almond Butter", description: "Fresh apple slices with natural almond butter", calories: 180 },
      { name: "Trail Mix", description: "Mixed nuts, seeds, and dried fruit", calories: 150 },
      { name: "Hummus and Veggies", description: "Fresh vegetables with homemade hummus", calories: 120 },
    ]
  }

  const mealPlan = days.map((day) => {
    const dayMeals: any = {}

    if (preferences.includeBreakfast) {
      dayMeals.breakfast = sampleMeals.breakfast[Math.floor(Math.random() * sampleMeals.breakfast.length)]
    }
    if (preferences.includeLunch) {
      dayMeals.lunch = sampleMeals.lunch[Math.floor(Math.random() * sampleMeals.lunch.length)]
    }
    if (preferences.includeDinner) {
      dayMeals.dinner = sampleMeals.dinner[Math.floor(Math.random() * sampleMeals.dinner.length)]
    }
    if (preferences.includeSnacks) {
      dayMeals.snacks = sampleMeals.snacks[Math.floor(Math.random() * sampleMeals.snacks.length)]
    }

    return { day, meals: dayMeals }
  })

  // Generate appropriate grocery list based on dietary restrictions
  let groceryList: GroceryListItem[] = []

  if (isVegan) {
    groceryList = [
      { item: "Almond Milk", quantity: "2 cartons", category: "Plant-Based" },
      { item: "Tofu", quantity: "2 blocks", category: "Plant-Based" },
      { item: "Nutritional Yeast", quantity: "1 container", category: "Plant-Based" },
      { item: "Chickpeas", quantity: "3 cans", category: "Pantry" },
      { item: "Black Beans", quantity: "2 cans", category: "Pantry" },
      { item: "Quinoa", quantity: "1 bag", category: "Pantry" },
      { item: "Brown Rice", quantity: "1 bag", category: "Pantry" },
      { item: "Avocados", quantity: "4", category: "Produce" },
      { item: "Bell Peppers", quantity: "6", category: "Produce" },
      { item: "Spinach", quantity: "2 bunches", category: "Produce" },
      { item: "Carrots", quantity: "1 bunch", category: "Produce" },
      { item: "Broccoli", quantity: "2 heads", category: "Produce" },
      { item: "Bananas", quantity: "6", category: "Produce" },
      { item: "Berries", quantity: "2 pints", category: "Produce" },
      { item: "Lemons", quantity: "3", category: "Produce" },
      { item: "Garlic", quantity: "1 head", category: "Produce" },
      { item: "Ginger", quantity: "1 piece", category: "Produce" },
      { item: "Tahini", quantity: "1 jar", category: "Pantry" },
      { item: "Coconut Milk", quantity: "2 cans", category: "Pantry" },
      { item: "Tamari Sauce", quantity: "1 bottle", category: "Pantry" },
      { item: "Olive Oil", quantity: "1 bottle", category: "Pantry" },
      { item: "Almond Butter", quantity: "1 jar", category: "Pantry" },
      { item: "Chia Seeds", quantity: "1 bag", category: "Pantry" },
      { item: "Whole Grain Bread", quantity: "1 loaf", category: "Bakery" },
      { item: "Whole Wheat Tortillas", quantity: "1 pack", category: "Bakery" },
    ]
  } else if (isVegetarian) {
    groceryList = [
      {
        item: isDairyFree ? "Almond Milk" : "Milk",
        quantity: "1 carton",
        category: isDairyFree ? "Plant-Based" : "Dairy",
      },
      {
        item: isDairyFree ? "Coconut Yogurt" : "Greek Yogurt",
        quantity: "2 containers",
        category: isDairyFree ? "Plant-Based" : "Dairy",
      },
      { item: "Chickpeas", quantity: "2 cans", category: "Pantry" },
      { item: "Quinoa", quantity: "1 bag", category: "Pantry" },
      { item: "Avocados", quantity: "4", category: "Produce" },
      { item: "Mixed Greens", quantity: "2 bags", category: "Produce" },
      { item: "Cherry Tomatoes", quantity: "1 pint", category: "Produce" },
      { item: "Cucumber", quantity: "2", category: "Produce" },
      { item: "Eggplant", quantity: "2", category: "Produce" },
      { item: "Bananas", quantity: "6", category: "Produce" },
      { item: "Berries", quantity: "2 pints", category: "Produce" },
      {
        item: isDairyFree ? "Nutritional Yeast" : "Parmesan Cheese",
        quantity: "1 container",
        category: isDairyFree ? "Plant-Based" : "Dairy",
      },
      {
        item: isDairyFree ? "Vegan Mozzarella" : "Mozzarella Cheese",
        quantity: "1 package",
        category: isDairyFree ? "Plant-Based" : "Dairy",
      },
      { item: "Tahini", quantity: "1 jar", category: "Pantry" },
      { item: "Coconut Milk", quantity: "1 can", category: "Pantry" },
      { item: "Olive Oil", quantity: "1 bottle", category: "Pantry" },
      { item: "Almond Butter", quantity: "1 jar", category: "Pantry" },
      { item: "Whole Grain Bread", quantity: "1 loaf", category: "Bakery" },
      { item: "Whole Wheat Pasta", quantity: "1 box", category: "Pantry" },
      {
        item: isEggFree ? "Flax Seeds" : "Eggs",
        quantity: isEggFree ? "1 bag" : "1 dozen",
        category: isEggFree ? "Pantry" : "Dairy",
      },
    ]
  } else {
    groceryList = [
      {
        item: isDairyFree ? "Almond Milk" : "Milk",
        quantity: "1 carton",
        category: isDairyFree ? "Plant-Based" : "Dairy",
      },
      {
        item: isDairyFree ? "Coconut Yogurt" : "Greek Yogurt",
        quantity: "2 containers",
        category: isDairyFree ? "Plant-Based" : "Dairy",
      },
      { item: "Chicken Breast", quantity: "1 lb", category: "Meat" },
      { item: "Salmon Fillets", quantity: "4 pieces", category: "Seafood" },
      { item: "Tuna", quantity: "2 cans", category: "Pantry" },
      { item: "Quinoa", quantity: "1 bag", category: "Pantry" },
      { item: "Avocados", quantity: "4", category: "Produce" },
      { item: "Mixed Greens", quantity: "2 bags", category: "Produce" },
      { item: "Cherry Tomatoes", quantity: "1 pint", category: "Produce" },
      { item: "Cucumber", quantity: "2", category: "Produce" },
      { item: "Seasonal Vegetables", quantity: "2 lbs", category: "Produce" },
      { item: "Bananas", quantity: "6", category: "Produce" },
      { item: "Berries", quantity: "2 pints", category: "Produce" },
      { item: "Olive Oil", quantity: "1 bottle", category: "Pantry" },
      { item: "Almond Butter", quantity: "1 jar", category: "Pantry" },
      { item: isGlutenFree ? "Gluten-Free Bread" : "Whole Grain Bread", quantity: "1 loaf", category: "Bakery" },
      { item: isGlutenFree ? "Gluten-Free Pasta" : "Whole Wheat Pasta", quantity: "1 box", category: "Pantry" },
      { item: "Brown Rice", quantity: "1 bag", category: "Pantry" },
      {
        item: isEggFree ? "Flax Seeds" : "Eggs",
        quantity: isEggFree ? "1 bag" : "1 dozen",
        category: isEggFree ? "Pantry" : "Dairy",
      },
    ]
  }

  return { mealPlan, groceryList }
}

export const generateMealPlanAndList = async (preferences: MealPreferences): Promise<GeneratedPlan> => {
  // If no real API key is provided, use demo mode
  if (!API_KEY || API_KEY === "DEMO_MODE" || API_KEY === "AIzaSyB8loTKfhCvmitfwaDxiCgSf3O1kHpSkAo") {
    console.log("Using demo mode - replace API_KEY with your actual Gemini API key for real AI-generated meal plans")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return getDemoMealPlan(preferences)
  }

  const ai = new GoogleGenAI(API_KEY)

  const mealTypesToInclude = []
  if (preferences.includeBreakfast) mealTypesToInclude.push("Breakfast")
  if (preferences.includeLunch) mealTypesToInclude.push("Lunch")
  if (preferences.includeDinner) mealTypesToInclude.push("Dinner")
  if (preferences.includeSnacks) mealTypesToInclude.push("Snacks")

  // Enhance the prompt with strict dietary adherence instructions
  const dietaryRestrictions = preferences.dietaryRestrictions || "None"

  // Identify specific dietary restrictions
  const dietaryKeywords = []
  Object.entries(DIETARY_KEYWORDS).forEach(([diet, data]) => {
    if (data.keywords.some((keyword) => dietaryRestrictions.toLowerCase().includes(keyword))) {
      dietaryKeywords.push(diet)
    }
  })

  // Build forbidden ingredients list for the prompt
  let forbiddenIngredientsText = ""
  if (dietaryKeywords.length > 0) {
    const allForbiddenIngredients = new Set<string>()
    dietaryKeywords.forEach((diet) => {
      DIETARY_KEYWORDS[diet as keyof typeof DIETARY_KEYWORDS].forbidden.forEach((ingredient) => {
        allForbiddenIngredients.add(ingredient)
      })
    })

    if (allForbiddenIngredients.size > 0) {
      forbiddenIngredientsText = `
IMPORTANT: The user has specified dietary restrictions that prohibit the following ingredients. DO NOT include these in ANY meals or in the grocery list:
${Array.from(allForbiddenIngredients).join(", ")}
`
    }
  }

  const prompt = `
You are an expert meal planning and nutrition AI. Your goal is to generate a personalized meal plan and a consolidated grocery list based on the user's preferences.

Output ONLY a valid JSON object (no surrounding text, no markdown code fences, just the raw JSON) with the exact following structure:
{
  "mealPlan": [
    {
      "day": "string (e.g., 'Day 1', 'Monday')",
      "meals": {
        "breakfast": { "name": "string", "description": "string (brief description)", "calories": number (optional, approximate) },
        "lunch": { "name": "string", "description": "string (brief description)", "calories": number (optional, approximate) },
        "dinner": { "name": "string", "description": "string (brief description)", "calories": number (optional, approximate) },
        "snacks": { "name": "string", "description": "string (brief description)", "calories": number (optional, approximate) }
      }
    }
  ],
  "groceryList": [
    { "item": "string (ingredient name)", "quantity": "string (e.g., '1 lb', '2 heads', '500ml')", "category": "string (e.g., 'Produce', 'Dairy', 'Meat', 'Pantry', 'Spices' - optional but helpful)" }
  ]
}

User Preferences:
- Dietary Restrictions: ${dietaryRestrictions}
- Preferred Cuisines: ${preferences.preferredCuisines || "Any"}
- Number of Days: ${preferences.numberOfDays}
- Meals to Plan: ${mealTypesToInclude.join(", ") || "None specified"}
${preferences.calorieTarget ? `- Approximate Daily Calorie Target: ${preferences.calorieTarget} calories (distribute reasonably across meals)` : ""}
${preferences.otherRequests ? `- Other Requests: ${preferences.otherRequests}` : ""}

${forbiddenIngredientsText}

Important Instructions:
1.  Ensure the "mealPlan" array contains one object for each of the "Number of Days" specified.
2.  For each day in "mealPlan", only include meal objects (breakfast, lunch, dinner, snacks) if they are listed in "Meals to Plan". If a meal type is not requested, do not include its key in the "meals" object for that day.
3.  The "groceryList" must be consolidated, listing each unique ingredient only once with the total quantity required for the entire meal plan.
4.  Provide practical quantities for grocery items (e.g., "1 bunch cilantro", "200g chicken breast").
5.  If "calories" are included, they should be approximate per serving for that meal.
6.  The "category" field in "groceryList" is optional but highly recommended for better organization. Use common grocery store categories.
7.  Be creative and diverse with meal suggestions, fitting the preferences.
8.  The "description" for meals should be concise and appealing.
9.  The "day" field in mealPlan should be like "Day 1", "Day 2", ..., up to the "Number of Days".
10. Respond ONLY with the JSON object. Do not add any introductory text, explanations, or markdown formatting like \`\`\`json ... \`\`\`.

Generate the plan now.
`

  try {
    const model = ai.getGenerativeModel({ model: MODEL_NAME })

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    })

    const response = await result.response
    let jsonStr = response.text().trim()

    // Remove markdown fences if present
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s
    const match = jsonStr.match(fenceRegex)
    if (match && match[1]) {
      jsonStr = match[1].trim()
    }

    const parsedData = JSON.parse(jsonStr) as GeneratedPlan

    // Basic validation of the parsed structure
    if (!parsedData.mealPlan || !parsedData.groceryList) {
      throw new Error("Invalid JSON structure received from API.")
    }

    // Validate against dietary restrictions
    if (dietaryRestrictions && dietaryRestrictions.toLowerCase() !== "none") {
      const validation = validateMealPlan(parsedData.mealPlan, parsedData.groceryList, dietaryRestrictions)

      if (!validation.isValid) {
        throw new Error(
          `The meal plan contains items that don't match your dietary restrictions (${validation.violations.join(
            ", ",
          )}). Please try again or be more specific with your restrictions.`,
        )
      }
    }

    return parsedData
  } catch (error) {
    console.error("Error generating meal plan:", error)
    if (error instanceof Error) {
      if (error.message.includes("API_KEY") || error.message.includes("401") || error.message.includes("403")) {
        throw new Error("Invalid API key. Please check your Gemini API key at https://aistudio.google.com/app/apikey")
      }
      throw new Error(`Failed to generate meal plan: ${error.message}`)
    }
    throw new Error("An unknown error occurred while generating the meal plan.")
  }
}
