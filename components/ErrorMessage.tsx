import type React from "react"
import { AlertTriangle } from "lucide-react"

interface ErrorMessageProps {
  message: string
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div
      className="lg:col-span-2 bg-red-50 border-l-4 border-red-400 text-red-800 p-6 rounded-xl shadow-nx"
      role="alert"
    >
      <div className="flex items-center mb-2">
        <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
        <p className="font-bold">Something went wrong</p>
      </div>
      <p className="whitespace-pre-line leading-relaxed">{message}</p>
      {message.includes("dietary restrictions") && (
        <div className="mt-4 p-4 bg-red-100 rounded-lg border border-red-200">
          <p className="font-semibold text-sm mb-1">💡 Helpful Tip:</p>
          <p className="text-sm">
            Try being more specific with your dietary restrictions. For example, instead of just "plant-based", you
            could say "strict vegan - no animal products including meat, dairy, eggs, or honey".
          </p>
        </div>
      )}
    </div>
  )
}

export default ErrorMessage
