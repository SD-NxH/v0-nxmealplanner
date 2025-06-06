import type React from "react"
import NxHealthLogo from "./icons/NxHealthLogo"

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-neutral-800/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-nx-xl flex flex-col items-center">
        <div className="animate-pulse mb-4">
          <NxHealthLogo className="w-16 h-16" />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-primary mb-4"></div>
        <p className="text-primary-dark font-semibold">Generating your personalized meal plan...</p>
        <p className="text-sm text-neutral-600 mt-1">This may take a few moments</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
