function Home() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Otel Otomasyonu Sistemine Hoş Geldiniz
        </h1>
        <p className="text-gray-600 mb-4">
          Bu proje React + Vite + TailwindCSS ile geliştirilmiştir.
        </p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Özellikler:</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Müşteri Yönetimi</li>
            <li>Rezervasyon Yönetimi</li>
            <li>Oda Yönetimi</li>
            <li>Ödeme Takibi</li>
            <li>Hizmet Yönetimi</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Home


