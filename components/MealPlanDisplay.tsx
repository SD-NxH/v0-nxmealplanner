import type React from "react"
import type { DayMealPlan, Meal } from "../types"
import { Zap } from "lucide-react"

interface MealPlanDisplayProps {
  mealPlan: DayMealPlan[]
}

const MealCard: React.FC<{ mealName: string; meal?: Meal }> = ({ mealName, meal }) => {
  if (!meal) return null

  const getMealIcon = (mealName: string) => {
    switch (mealName.toLowerCase()) {
      case "breakfast":
        return "🌅"
      case "lunch":
        return "☀️"
      case "dinner":
        return "🌙"
      case "snacks":
        return "🍎"
      default:
        return "🍽️"
    }
  }

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-accent-light/20 to-secondary-light/20 rounded-xl border border-accent/30 hover:shadow-nx transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-primary-dark flex items-center">
          <span className="mr-2 text-lg">{getMealIcon(mealName)}</span>
          {mealName}
        </h4>
        {meal.calories && (
          <div className="flex items-center text-xs text-neutral-600 bg-white px-2 py-1 rounded-full">
            <Zap className="w-3 h-3 mr-1" />
            {meal.calories} cal
          </div>
        )}
      </div>
      <p className="text-sm text-neutral-800 font-medium mb-1">{meal.name}</p>
      <p className="text-xs text-neutral-600 leading-relaxed">{meal.description}</p>
    </div>
  )
}

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ mealPlan }) => {
  if (!mealPlan || mealPlan.length === 0) {
    return <p className="text-neutral-500">No meal plan generated.</p>
  }

  return (
    <div className="space-y-6">
      {mealPlan.map((dayPlan, index) => (
        <div
          key={index}
          className="p-5 bg-white rounded-xl shadow-nx border border-neutral-100 hover:shadow-nx-lg transition-all duration-200"
        >
          <div className="flex items-center mb-4 pb-3 border-b border-neutral-100">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">
              {index + 1}
            </div>
            <h3 className="text-xl font-bold text-primary-dark">{dayPlan.day}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <MealCard mealName="Breakfast" meal={dayPlan.meals.breakfast} />
              <MealCard mealName="Lunch" meal={dayPlan.meals.lunch} />
            </div>
            <div>
              <MealCard mealName="Dinner" meal={dayPlan.meals.dinner} />
              <MealCard mealName="Snacks" meal={dayPlan.meals.snacks} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MealPlanDisplay
