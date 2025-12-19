import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ImageCarousel = ({
  images = [],
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex >= images.length && images.length > 0) {
      setCurrentIndex(0)
    }
  }, [images, currentIndex])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }


  if (images.length === 0 && !canEdit) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center h-64 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📷</div>
          <p>Resim bulunmuyor</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Ana resim gösterimi */}
      <div className="relative h-64 md:h-80 bg-gray-200 rounded-lg overflow-hidden">
        {images.length > 0 ? (
          <img
            src={images[currentIndex].resim_url}
            alt={images[currentIndex].resim_adi || `Oda resmi ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p>Resim yüklemek için sürükleyin veya seçin</p>
            </div>
          </div>
        )}

        {/* Navigasyon okları */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Resim sayısı göstergesi */}
        {images.length > 0 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Dots navigasyonu */}
      {images.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default ImageCarousel
