"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import dynamic from "next/dynamic"

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
)

type MexicoCityChartVariant = "default" | "sample"

// Mexico City boroughs (alcaldías) with real coordinates and mobility data
const boroughsData = [
  { id: "cuauhtemoc", name: "Cuauhtémoc", lat: 19.4326, lng: -99.1332, incidents: 342, alerts: 45 },
  { id: "miguel-hidalgo", name: "Miguel Hidalgo", lat: 19.4284, lng: -99.2023, incidents: 289, alerts: 38 },
  { id: "benito-juarez", name: "Benito Juárez", lat: 19.3703, lng: -99.1586, incidents: 256, alerts: 32 },
  { id: "coyoacan", name: "Coyoacán", lat: 19.3467, lng: -99.1618, incidents: 198, alerts: 24 },
  { id: "alvaro-obregon", name: "Álvaro Obregón", lat: 19.3574, lng: -99.2380, incidents: 187, alerts: 28 },
  { id: "iztapalapa", name: "Iztapalapa", lat: 19.3570, lng: -99.0554, incidents: 412, alerts: 58 },
  { id: "gustavo-madero", name: "Gustavo A. Madero", lat: 19.4886, lng: -99.1134, incidents: 378, alerts: 52 },
  { id: "tlalpan", name: "Tlalpan", lat: 19.2894, lng: -99.1665, incidents: 145, alerts: 18 },
  { id: "xochimilco", name: "Xochimilco", lat: 19.2577, lng: -99.1037, incidents: 123, alerts: 15 },
  { id: "azcapotzalco", name: "Azcapotzalco", lat: 19.4900, lng: -99.1860, incidents: 234, alerts: 31 },
  { id: "venustiano-carranza", name: "Venustiano Carranza", lat: 19.4396, lng: -99.1014, incidents: 298, alerts: 42 },
  { id: "iztacalco", name: "Iztacalco", lat: 19.3892, lng: -99.0862, incidents: 267, alerts: 35 },
  { id: "magdalena-contreras", name: "Magdalena Contreras", lat: 19.3161, lng: -99.2456, incidents: 98, alerts: 12 },
  { id: "cuajimalpa", name: "Cuajimalpa", lat: 19.3583, lng: -99.2975, incidents: 87, alerts: 11 },
  { id: "tlahuac", name: "Tláhuac", lat: 19.2864, lng: -99.0134, incidents: 156, alerts: 21 },
  { id: "milpa-alta", name: "Milpa Alta", lat: 19.1921, lng: -99.0231, incidents: 76, alerts: 9 },
]

const getIncidentColor = (incidents: number): string => {
  if (incidents >= 350) return "#dc2626" // red-600
  if (incidents >= 250) return "#f97316" // orange-500
  if (incidents >= 150) return "#eab308" // yellow-500
  return "#84cc16" // lime-500
}

const getIncidentLevel = (incidents: number): string => {
  if (incidents >= 350) return "Very High"
  if (incidents >= 250) return "High"
  if (incidents >= 150) return "Medium"
  return "Low"
}

interface MexicoCityChartProps {
  variant?: MexicoCityChartVariant
}

export function MexicoCityChart({ variant = "default" }: MexicoCityChartProps) {
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const title = variant === "sample" ? "Sample Mexico City Map" : "Mexico City Mobility Map"

  const selectedData = selectedBorough
    ? boroughsData.find(b => b.id === selectedBorough)
    : null

  // Mexico City center coordinates
  const centerPosition: [number, number] = [19.4326, -99.1332]

  if (!isMounted) {
    return (
      <Card className="p-6 bg-card border-border w-full h-full flex flex-col">
        <div className="flex-shrink-0 mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Loading interactive map...
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center bg-slate-100 rounded-lg">
          <div className="text-slate-500">Loading map...</div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-white via-slate-50/50 to-white border-slate-200 shadow-xl w-full h-full flex flex-col">
      {/* Add Leaflet CSS */}
      <style jsx global>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

        .leaflet-container {
          width: 100%;
          height: 100%;
          border-radius: 1rem;
          z-index: 0;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }

        .leaflet-popup-content-wrapper {
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(226, 232, 240, 0.5);
        }

        .leaflet-popup-content {
          margin: 14px;
          min-width: 200px;
          font-family: inherit;
        }

        .leaflet-popup-tip {
          box-shadow: 0 3px 14px rgba(0,0,0,0.1);
        }
      `}</style>

      <div className="flex-shrink-0 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">
              Real-time incidents across 16 boroughs
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-2 min-h-0">
        {/* Map Container - Square */}
        <div className="relative rounded-xl overflow-hidden shadow-lg border border-slate-200" style={{ aspectRatio: '1', height: '100%', flexShrink: 0 }}>
          <MapContainer
            center={centerPosition}
            zoom={11}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Add circles for each borough showing incident intensity */}
            {boroughsData.map((borough) => (
              <Circle
                key={borough.id}
                center={[borough.lat, borough.lng]}
                radius={borough.incidents * 5} // Size based on incidents (smaller circles)
                pathOptions={{
                  color: getIncidentColor(borough.incidents),
                  fillColor: getIncidentColor(borough.incidents),
                  fillOpacity: 0.4,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => setSelectedBorough(borough.id),
                }}
              >
                <Popup>
                  <div className="p-1">
                    <h4 className="font-bold text-lg text-slate-800 mb-3 pb-2 border-b border-slate-200">{borough.name}</h4>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center gap-6">
                        <span className="text-sm font-medium text-slate-600">Incidents</span>
                        <span className="font-bold text-red-600 text-lg">{borough.incidents}</span>
                      </div>
                      <div className="flex justify-between items-center gap-6">
                        <span className="text-sm font-medium text-slate-600">Alerts</span>
                        <span className="font-bold text-amber-600 text-lg">{borough.alerts}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk Level</span>
                        <div className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-bold text-center shadow-sm ${
                          borough.incidents >= 350 ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                          borough.incidents >= 250 ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' :
                          borough.incidents >= 150 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-800' :
                          'bg-gradient-to-r from-lime-400 to-lime-500 text-slate-800'
                        }`}>
                          {getIncidentLevel(borough.incidents)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>

        {/* Info Panel - Scrollable */}
        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1 max-h-full" style={{ scrollbarWidth: 'thin', maxWidth: '280px' }}>
          {selectedData ? (
            <div className="bg-gradient-to-br from-red-50 via-white to-red-50/50 rounded-xl p-3 border-2 border-red-200 shadow-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-base text-slate-800">{selectedData.name}</h4>
                <button
                  onClick={() => setSelectedBorough(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Clear selection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-600">Incidents</span>
                    <span className="font-bold text-red-600 text-lg">{selectedData.incidents}</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-600">Alerts</span>
                    <span className="font-bold text-amber-600 text-lg">{selectedData.alerts}</span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-red-200">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Risk Level</span>
                  <div className={`mt-1.5 px-2 py-1 rounded-lg text-xs font-bold text-center shadow-sm ${
                    selectedData.incidents >= 350 ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                    selectedData.incidents >= 250 ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' :
                    selectedData.incidents >= 150 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-800' :
                    'bg-gradient-to-r from-lime-400 to-lime-500 text-slate-800'
                  }`}>
                    {getIncidentLevel(selectedData.incidents)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 border border-slate-200 shadow-sm">
              <div className="flex flex-col items-center justify-center py-2">
                <svg className="w-8 h-8 text-slate-300 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-xs text-slate-600 text-center font-medium">
                  Click on any circle to view details
                </p>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm">
            <h5 className="font-bold text-xs text-slate-800 mb-1.5 flex items-center gap-1.5">
              <div className="w-0.5 h-3 bg-gradient-to-b from-red-500 to-yellow-500 rounded-full"></div>
              Incident Levels
            </h5>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 group">
                <div className="w-3.5 h-3.5 bg-gradient-to-br from-red-600 to-red-700 rounded-full shadow-sm"></div>
                <span className="text-xs text-slate-700">Very High (350+)</span>
              </div>
              <div className="flex items-center gap-1.5 group">
                <div className="w-3.5 h-3.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-sm"></div>
                <span className="text-xs text-slate-700">High (250-349)</span>
              </div>
              <div className="flex items-center gap-1.5 group">
                <div className="w-3.5 h-3.5 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full shadow-sm"></div>
                <span className="text-xs text-slate-700">Medium (150-249)</span>
              </div>
              <div className="flex items-center gap-1.5 group">
                <div className="w-3.5 h-3.5 bg-gradient-to-br from-lime-500 to-lime-600 rounded-full shadow-sm"></div>
                <span className="text-xs text-slate-700">Low (&lt;150)</span>
              </div>
            </div>
          </div>

          {/* Top 5 */}
          <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm">
            <h5 className="font-bold text-xs text-slate-800 mb-1.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Top 5 Boroughs
            </h5>
            <div className="space-y-0.5">
              {[...boroughsData].sort((a, b) => b.incidents - a.incidents).slice(0, 5).map((borough, index) => (
                <button
                  key={borough.id}
                  onClick={() => setSelectedBorough(borough.id)}
                  className="w-full flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-50 transition-all text-left group hover:shadow-sm border border-transparent hover:border-slate-200"
                >
                  <div className={`flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold text-white ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                    'bg-gradient-to-br from-slate-400 to-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate group-hover:text-red-600 transition-colors">{borough.name}</div>
                    <div className="text-xs text-slate-500">{borough.incidents}</div>
                  </div>
                  <div
                    className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                    style={{ backgroundColor: getIncidentColor(borough.incidents) }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
