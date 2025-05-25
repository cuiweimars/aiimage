"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Resolution {
  label: string
  width: number
  height: number
  aspectRatio: string
}

interface ResolutionSelectorProps {
  resolutions: Resolution[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ResolutionSelector({ resolutions, value, onChange, disabled = false }: ResolutionSelectorProps) {
  const [selectedTab, setSelectedTab] = useState<"common" | "portrait" | "landscape">("common")

  // 根据宽高比对分辨率进行分组
  const commonResolutions = resolutions.filter((r) => r.aspectRatio === "1:1")
  const portraitResolutions = resolutions.filter((r) => r.aspectRatio === "2:3" || r.aspectRatio === "3:4")
  const landscapeResolutions = resolutions.filter((r) => r.aspectRatio === "3:2" || r.aspectRatio === "4:3")

  // 根据当前选择的标签获取要显示的分辨率
  const displayResolutions =
    selectedTab === "common"
      ? commonResolutions
      : selectedTab === "portrait"
        ? portraitResolutions
        : landscapeResolutions

  return (
    <div className="space-y-3">
      <div className="flex space-x-1 rounded-md bg-muted p-1">
        <button
          className={cn(
            "flex-1 rounded-sm px-2.5 py-1.5 text-xs font-medium transition-all",
            selectedTab === "common" ? "bg-background shadow-sm" : "text-muted-foreground hover:bg-background/50",
          )}
          onClick={() => setSelectedTab("common")}
          disabled={disabled}
        >
          正方形
        </button>
        <button
          className={cn(
            "flex-1 rounded-sm px-2.5 py-1.5 text-xs font-medium transition-all",
            selectedTab === "portrait" ? "bg-background shadow-sm" : "text-muted-foreground hover:bg-background/50",
          )}
          onClick={() => setSelectedTab("portrait")}
          disabled={disabled}
        >
          竖向
        </button>
        <button
          className={cn(
            "flex-1 rounded-sm px-2.5 py-1.5 text-xs font-medium transition-all",
            selectedTab === "landscape" ? "bg-background shadow-sm" : "text-muted-foreground hover:bg-background/50",
          )}
          onClick={() => setSelectedTab("landscape")}
          disabled={disabled}
        >
          横向
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {displayResolutions.map((resolution) => (
          <button
            key={resolution.label}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-md border-2 p-3 transition-all hover:border-primary",
              value === resolution.label
                ? "border-primary bg-primary/5"
                : "border-muted bg-transparent hover:bg-primary/5",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => onChange(resolution.label)}
            disabled={disabled}
          >
            <div
              className="mb-2 rounded bg-muted"
              style={{
                width: `${resolution.width / 20}px`,
                height: `${resolution.height / 20}px`,
                maxWidth: "80px",
                maxHeight: "80px",
              }}
            />
            <span className="text-xs font-medium">{resolution.label}</span>
            <span className="text-[10px] text-muted-foreground">
              {resolution.width} x {resolution.height}
            </span>
            {value === resolution.label && (
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
