"use client"

import { useState } from "react"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StylePreset {
  id: string
  name: string
  description: string
  previewUrl: string
}

interface StylePresetSelectorProps {
  presets: StylePreset[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function StylePresetSelector({ presets, value, onChange, disabled = false }: StylePresetSelectorProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 6
  const totalPages = Math.ceil(presets.length / itemsPerPage)

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const currentPresets = presets.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">风格预设</h4>
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={prevPage}
              disabled={disabled || totalPages <= 1}
              className="rounded-full p-1 hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={disabled || totalPages <= 1}
              className="rounded-full p-1 hover:bg-muted disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {currentPresets.map((preset) => (
          <button
            key={preset.id}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-md border-2 p-2 transition-all hover:border-primary",
              value === preset.id ? "border-primary bg-primary/5" : "border-muted bg-transparent hover:bg-primary/5",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => onChange(preset.id)}
            disabled={disabled}
          >
            <div className="relative mb-2 h-20 w-full overflow-hidden rounded">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preset.previewUrl || "/placeholder.svg"}
                alt={preset.name}
                className="h-full w-full object-cover transition-transform hover:scale-110"
              />
            </div>
            <span className="text-xs font-medium">{preset.name}</span>
            {value === preset.id && (
              <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
