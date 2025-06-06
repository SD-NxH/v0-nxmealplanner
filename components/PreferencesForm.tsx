"use client"

import type React from "react"
import { useState } from "react"
import type { MealPreferences } from "../types"
import { Sparkles } from "lucide-react"

interface PreferencesFormProps {
  onSubmit: (preferences: MealPreferences) => void
  isLoading: boolean
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ onSubmit, isLoading }) => {
  const [preferences, setPreferences] = useState<MealPreferences>({
    dietaryRestrictions: "",
    preferredCuisines: "",
    numberOfDays: 7,
    includeBreakfast: true,
    includeLunch: true,
    includeDinner: true,
    includeSnacks: false,
    calorieTarget: undefined,
    otherRequests: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement
      setPreferences((prev) => ({ ...prev, [name]: checked }))
    } else if (type === "number") {
      setPreferences((prev) => ({ ...prev, [name]: value ? Number.parseInt(value, 10) : undefined }))
    } else {
      setPreferences((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (preferences.numberOfDays < 1) {
      alert("Number of days must be at least 1.")
      return
    }
    onSubmit(preferences)
  }

  const inputClass =
    "mt-1 block w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all duration-200"
  const labelClass = "block text-sm font-semibold text-neutral-700 mb-1"
  const checkboxLabelClass = "ml-3 text-sm text-neutral-700 font-medium"
  const fieldsetClass = "mt-6"
  const legendClass = "text-base font-semibold text-primary-dark mb-3"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-primary-dark mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-primary" />
          Your Meal Preferences
        </h2>
        <p className="text-sm text-neutral-600">
          Tell us about your dietary needs and preferences to create your perfect meal plan.
        </p>
      </div>

      <div>
        <label htmlFor="dietaryRestrictions" className={labelClass}>
          Dietary Restrictions & Allergies
        </label>
        <textarea
          id="dietaryRestrictions"
          name="dietaryRestrictions"
          rows={3}
          value={preferences.dietaryRestrictions}
          onChange={handleChange}
          className={inputClass}
          placeholder="e.g., vegan, gluten-free, nut allergies, dairy-free"
        />
      </div>

      <div>
        <label htmlFor="preferredCuisines" className={labelClass}>
          Preferred Cuisines
        </label>
        <textarea
          id="preferredCuisines"
          name="preferredCuisines"
          rows={2}
          value={preferences.preferredCuisines}
          onChange={handleChange}
          className={inputClass}
          placeholder="e.g., Mediterranean, Asian, Mexican, Italian"
        />
      </div>

      <div>
        <label htmlFor="numberOfDays" className={labelClass}>
          Meal Plan Duration (Days)
        </label>
        <input
          type="number"
          id="numberOfDays"
          name="numberOfDays"
          value={preferences.numberOfDays}
          onChange={handleChange}
          className={inputClass}
          min="1"
          max="14"
          required
        />
      </div>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Meals to Include:</legend>
        <div className="grid grid-cols-2 gap-3">
          {["Breakfast", "Lunch", "Dinner", "Snacks"].map((mealType) => (
            <div key={mealType} className="flex items-center bg-neutral-50 p-3 rounded-lg">
              <input
                id={`include${mealType}`}
                name={`include${mealType.charAt(0).toUpperCase() + mealType.slice(1).toLowerCase()}`}
                type="checkbox"
                checked={
                  preferences[
                    `include${mealType.charAt(0).toUpperCase() + mealType.slice(1).toLowerCase()}` as keyof MealPreferences
                  ] as boolean
                }
                onChange={handleChange}
                className="h-4 w-4 text-primary border-neutral-300 rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor={`include${mealType}`} className={checkboxLabelClass}>
                {mealType}
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="calorieTarget" className={labelClass}>
          Daily Calorie Target (Optional)
        </label>
        <input
          type="number"
          id="calorieTarget"
          name="calorieTarget"
          value={preferences.calorieTarget || ""}
          onChange={handleChange}
          className={inputClass}
          placeholder="e.g., 2000"
          min="0"
        />
      </div>

      <div>
        <label htmlFor="otherRequests" className={labelClass}>
          Additional Preferences
        </label>
        <textarea
          id="otherRequests"
          name="otherRequests"
          rows={3}
          value={preferences.otherRequests}
          onChange={handleChange}
          className={inputClass}
          placeholder="e.g., quick 30-minute meals, budget-friendly options, family-friendly"
        />
      </div>

      <div className="pt-6 border-t border-neutral-200">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-nx text-base font-semibold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating Your Personalized Plan...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate My Meal Plan
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default PreferencesForm
