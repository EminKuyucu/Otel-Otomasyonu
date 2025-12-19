import { useState } from 'react'
import { Star } from 'lucide-react'

console.log('StarRating component loaded')

const StarRating = ({
  rating = 0,
  onRatingChange,
  readonly = false,
  size = 24,
  className = ""
}) => {
  const [hoverRating, setHoverRating] = useState(0)

  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value)
    }
  }

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = readonly
          ? star <= rating
          : star <= (hoverRating || rating)

        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`transition-colors ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
          >
            <Star
              size={size}
              className={`transition-colors ${
                isActive
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-300'
              }`}
            />
          </button>
        )
      })}
      {readonly && (
        <span className="ml-2 text-sm text-gray-600">
          ({rating}/5)
        </span>
      )}
    </div>
  )
}

export default StarRating
