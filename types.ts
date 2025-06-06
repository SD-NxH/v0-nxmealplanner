export interface MealPreferences {
  dietaryRestrictions: string
  preferredCuisines: string
  numberOfDays: number
  includeBreakfast: boolean
  includeLunch: boolean
  includeDinner: boolean
  includeSnacks: boolean
  calorieTarget?: number
  otherRequests?: string
}

export interface Meal {
  name: string
  description: string
  calories?: number
}

export interface DayMealPlan {
  day: string
  meals: {
    breakfast?: Meal
    lunch?: Meal
    dinner?: Meal
    snacks?: Meal
  }
}

export interface GroceryListItem {
  item: string
  quantity: string
  category?: string
}

export interface GeneratedPlan {
  mealPlan: DayMealPlan[]
  groceryList: GroceryListItem[]
}
