"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Lightbulb, Calendar, DollarSign, TrendingUp, Trash2, Eye } from "lucide-react"

interface Solution {
  id: string
  name: string
  description: string
  cost_min: number
  cost_max: number
  feasibility: number
  implementation_start_date: string
  implementation_end_date: string
  created_at: string
  pattern_id?: string
}

export function SolutionsPage() {
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null)

  useEffect(() => {
    fetchSolutions()
  }, [])

  const fetchSolutions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/solutions')
      const data = await response.json()
      setSolutions(data.solutions || [])
    } catch (error) {
      console.error('Error fetching solutions:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteSolution = async (id: string) => {
    if (!confirm('Are you sure you want to delete this solution?')) return
    
    try {
      const response = await fetch(`/api/solutions/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setSolutions(solutions.filter(s => s.id !== id))
      }
    } catch (error) {
      console.error('Error deleting solution:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getFeasibilityColor = (feasibility: number) => {
    if (feasibility >= 8) return 'text-green-600'
    if (feasibility >= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getFeasibilityBg = (feasibility: number) => {
    if (feasibility >= 8) return 'bg-green-50 border-green-200'
    if (feasibility >= 5) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Lightbulb className="w-8 h-8 text-yellow-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Saved Solutions
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Lightbulb className="w-8 h-8 text-yellow-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Saved Solutions
          </h1>
          <span className="ml-auto text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {solutions.length} {solutions.length === 1 ? 'solution' : 'solutions'}
          </span>
        </div>

        {solutions.length === 0 ? (
          <Card className="p-12 text-center">
            <Lightbulb className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">No saved solutions yet</h2>
            <p className="text-slate-500">
              Generate solutions from patterns and save them to see them here
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((solution, idx) => (
              <Card
                key={solution.id}
                className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-purple-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 100}ms`, animationDuration: '500ms' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800 flex-1 pr-2">
                    {solution.name}
                  </h3>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${getFeasibilityBg(solution.feasibility)}`}>
                    <TrendingUp className={`w-4 h-4 ${getFeasibilityColor(solution.feasibility)}`} />
                    <span className={`text-sm font-semibold ${getFeasibilityColor(solution.feasibility)}`}>
                      {solution.feasibility}/10
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {solution.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-slate-700 font-medium">
                      {formatCurrency(solution.cost_min)} - {formatCurrency(solution.cost_max)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-slate-700">
                      {formatDate(solution.implementation_start_date)} - {formatDate(solution.implementation_end_date)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => setSelectedSolution(solution)}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </button>
                  <button
                    onClick={() => deleteSolution(solution.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedSolution && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setSelectedSolution(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 animate-in slide-in-from-bottom-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {selectedSolution.name}
                </h2>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${getFeasibilityBg(selectedSolution.feasibility)}`}>
                  <TrendingUp className={`w-5 h-5 ${getFeasibilityColor(selectedSolution.feasibility)}`} />
                  <span className={`text-lg font-semibold ${getFeasibilityColor(selectedSolution.feasibility)}`}>
                    Feasibility: {selectedSolution.feasibility}/10
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSolution(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                  Description
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {selectedSolution.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wide">
                      Budget Range
                    </h3>
                  </div>
                  <p className="text-xl font-bold text-green-700">
                    {formatCurrency(selectedSolution.cost_min)}
                  </p>
                  <p className="text-sm text-green-600">to</p>
                  <p className="text-xl font-bold text-green-700">
                    {formatCurrency(selectedSolution.cost_max)}
                  </p>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                      Timeline
                    </h3>
                  </div>
                  <p className="text-sm text-blue-700 mb-1">
                    <span className="font-semibold">Start:</span> {formatDate(selectedSolution.implementation_start_date)}
                  </p>
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">End:</span> {formatDate(selectedSolution.implementation_end_date)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t flex gap-3">
                <button
                  onClick={() => deleteSolution(selectedSolution.id)}
                  className="flex-1 px-4 py-3 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Solution
                </button>
                <button
                  onClick={() => setSelectedSolution(null)}
                  className="px-6 py-3 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
