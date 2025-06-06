"use client"

import type React from "react"
import { useState, useCallback } from "react"
import type { MealPreferences, GeneratedPlan } from "./types"
import PreferencesForm from "./components/PreferencesForm"
import MealPlanDisplay from "./components/MealPlanDisplay"
import GroceryListDisplay from "./components/GroceryListDisplay"
import LoadingSpinner from "./components/LoadingSpinner"
import ErrorMessage from "./components/ErrorMessage"
import { generateMealPlanAndList } from "./services/geminiService"
import NxHealthLogo from "./components/icons/NxHealthLogo"
import { ShoppingCart, Utensils } from "lucide-react"

const App: React.FC = () => {
  const [preferences, setPreferences] = useState<MealPreferences | null>(null)
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [showInitialMessage, setShowInitialMessage] = useState<boolean>(true)

  const handleGeneratePlan = useCallback(async (newPreferences: MealPreferences) => {
    setPreferences(newPreferences)
    setIsLoading(true)
    setError(null)
    setGeneratedPlan(null)
    setShowInitialMessage(false)

    try {
      const plan = await generateMealPlanAndList(newPreferences)
      setGeneratedPlan(plan)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.")
      } else {
        setError("An unexpected error occurred.")
      }
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-nx-gradient text-neutral-800 p-4 sm:p-8 font-sans">
      <header className="text-center mb-8 sm:mb-12">
        <div className="flex items-center justify-center mb-4">
          <NxHealthLogo className="w-16 h-16 sm:w-20 sm:h-20 mr-4" />
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-dark">NxMeal Planner</h1>
            <p className="text-sm sm:text-base text-primary font-medium">by NxHealth Solutions</p>
          </div>
        </div>
        <p className="text-lg text-neutral-600 mt-2 max-w-2xl mx-auto">
          Generate personalized meal plans and grocery lists tailored to your dietary needs and preferences
        </p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-1 bg-nx-card p-6 rounded-2xl shadow-nx-lg border border-neutral-200 h-fit">
          <PreferencesForm onSubmit={handleGeneratePlan} isLoading={isLoading} />
        </section>

        <div className="lg:col-span-2 space-y-8">
          {isLoading && <LoadingSpinner />}
          {error && !isLoading && <ErrorMessage message={error} />}

          {!isLoading && !error && generatedPlan && (
            <>
              {generatedPlan.mealPlan && generatedPlan.mealPlan.length > 0 && (
                <div className="bg-nx-card p-6 rounded-2xl shadow-nx-lg border border-neutral-200">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-primary-dark mb-6 flex items-center border-b border-neutral-200 pb-3">
                    <Utensils className="w-7 h-7 sm:w-8 sm:h-8 mr-3 text-primary" />
                    Your Personalized Meal Plan
                  </h2>
                  <MealPlanDisplay mealPlan={generatedPlan.mealPlan} />
                </div>
              )}
              {generatedPlan.groceryList && generatedPlan.groceryList.length > 0 && (
                <div className="bg-nx-card p-6 rounded-2xl shadow-nx-lg border border-neutral-200">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-primary-dark mb-6 flex items-center border-b border-neutral-200 pb-3">
                    <ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8 mr-3 text-primary" />
                    Your Smart Grocery List
                  </h2>
                  <GroceryListDisplay groceryList={generatedPlan.groceryList} />
                </div>
              )}
            </>
          )}

          {!isLoading && !error && !generatedPlan && showInitialMessage && (
            <div className="bg-nx-card p-8 rounded-2xl shadow-nx-lg border border-neutral-200 text-center text-neutral-600 flex flex-col items-center justify-center min-h-[400px]">
              <NxHealthLogo className="w-24 h-24 opacity-70 mb-6" />
              <h2 className="text-2xl font-semibold text-primary-dark mb-3">Welcome to NxMeal Planner</h2>
              <p className="max-w-md text-neutral-600 leading-relaxed">
                Ready to transform your meal planning experience? Our AI-powered system creates personalized meal plans
                that align with your dietary preferences, health goals, and lifestyle needs.
              </p>
              <p className="mt-4 text-sm text-primary font-medium">
                Complete the form on the left to get started with your custom meal plan!
              </p>
            </div>
          )}

          {!isLoading && !error && !generatedPlan && !showInitialMessage && (
            <div className="bg-nx-card p-8 rounded-2xl shadow-nx-lg border border-neutral-200 text-center text-neutral-600 flex flex-col items-center justify-center min-h-[400px]">
              <NxHealthLogo className="w-24 h-24 opacity-50 mb-6" />
              <h2 className="text-2xl font-semibold text-neutral-700 mb-3">Plan Generation in Progress</h2>
              <p className="max-w-md text-neutral-600">
                We're working on creating your personalized meal plan. If this is taking longer than expected, please
                review your preferences and try again.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center mt-12 py-8 border-t border-neutral-200">
        <div className="flex items-center justify-center mb-3">
          <NxHealthLogo className="w-8 h-8 mr-2" />
          <span className="text-primary-dark font-semibold">NxHealth Solutions</span>
        </div>
        <p className="text-sm text-neutral-500">Empowering healthier lives through personalized nutrition planning</p>
        <p className="text-xs text-neutral-400 mt-2">&copy; 2025 NxHealth Solutions. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
