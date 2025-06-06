import type React from "react"
import type { GroceryListItem } from "../types"
import { Package } from "lucide-react"

interface GroceryListDisplayProps {
  groceryList: GroceryListItem[]
}

const GroceryListDisplay: React.FC<GroceryListDisplayProps> = ({ groceryList }) => {
  if (!groceryList || groceryList.length === 0) {
    return <p className="text-neutral-500">No grocery list generated.</p>
  }

  // Group by category if available
  const categorizedList: { [category: string]: GroceryListItem[] } = groceryList.reduce(
    (acc, item) => {
      const category = item.category || "Miscellaneous"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    },
    {} as { [category: string]: GroceryListItem[] },
  )

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "produce":
        return "🥬"
      case "dairy":
        return "🥛"
      case "meat":
        return "🥩"
      case "seafood":
        return "🐟"
      case "pantry":
        return "🏺"
      case "bakery":
        return "🍞"
      case "plant-based":
        return "🌱"
      case "spices":
        return "🧂"
      default:
        return "📦"
    }
  }

  return (
    <div className="space-y-6">
      {Object.entries(categorizedList).map(([category, items]) => (
        <div key={category} className="bg-white p-5 rounded-xl shadow-nx border border-neutral-100">
          <div className="flex items-center mb-4 pb-2 border-b border-neutral-100">
            <span className="text-2xl mr-3">{getCategoryIcon(category)}</span>
            <h4 className="text-lg font-bold text-primary-dark">{category}</h4>
            <div className="ml-auto bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
              {items.length} items
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-accent-light/20 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <Package className="w-4 h-4 text-primary mr-2" />
                  <span className="font-medium text-neutral-800">{item.item}</span>
                </div>
                <span className="text-sm text-neutral-600 font-medium">{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default GroceryListDisplay
