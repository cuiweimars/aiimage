"use client"

import { useState } from "react"
import { Lightbulb, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface PromptCategory {
  id: string
  name: string
  suggestions: string[]
}

interface PromptHelperProps {
  onAddToPrompt: (text: string) => void
  disabled?: boolean
}

export function PromptHelper({ onAddToPrompt, disabled = false }: PromptHelperProps) {
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  const [customTag, setCustomTag] = useState("")

  const categories: PromptCategory[] = [
    {
      id: "style",
      name: "艺术风格",
      suggestions: [
        "油画",
        "水彩画",
        "素描",
        "数字艺术",
        "像素艺术",
        "赛博朋克",
        "超现实主义",
        "印象派",
        "极简主义",
        "波普艺术",
      ],
    },
    {
      id: "lighting",
      name: "光照效果",
      suggestions: [
        "自然光",
        "柔和光线",
        "硬光",
        "背光",
        "侧光",
        "黄金时段",
        "蓝调时分",
        "戏剧性照明",
        "霓虹灯",
        "体积光",
      ],
    },
    {
      id: "camera",
      name: "相机设置",
      suggestions: ["浅景深", "广角镜头", "长焦镜头", "鱼眼镜头", "微距", "低角度", "高角度", "航拍", "全景", "慢门"],
    },
    {
      id: "quality",
      name: "质量提升",
      suggestions: ["高清", "4K", "8K", "超高清", "细节丰富", "锐利", "高对比度", "高饱和度", "高动态范围", "精细纹理"],
    },
  ]

  const toggleSuggestion = (suggestion: string) => {
    if (selectedSuggestions.includes(suggestion)) {
      setSelectedSuggestions(selectedSuggestions.filter((s) => s !== suggestion))
    } else {
      setSelectedSuggestions([...selectedSuggestions, suggestion])
    }
  }

  const addCustomTag = () => {
    if (customTag.trim() && !selectedSuggestions.includes(customTag.trim())) {
      setSelectedSuggestions([...selectedSuggestions, customTag.trim()])
      setCustomTag("")
    }
  }

  const applySelectedSuggestions = () => {
    if (selectedSuggestions.length > 0) {
      onAddToPrompt(`, ${selectedSuggestions.join(", ")}`)
      setSelectedSuggestions([])
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {selectedSuggestions.map((suggestion) => (
          <Badge key={suggestion} variant="secondary" className="flex items-center gap-1">
            {suggestion}
            <button
              onClick={() => toggleSuggestion(suggestion)}
              className="ml-1 rounded-full hover:bg-muted-foreground/20"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">移除 {suggestion}</span>
            </button>
          </Badge>
        ))}
        {selectedSuggestions.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 gap-1 text-xs"
            onClick={applySelectedSuggestions}
            disabled={disabled}
          >
            <Plus className="h-3 w-3" />
            添加到提示词
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          placeholder="自定义标签..."
          className="h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addCustomTag()
            }
          }}
          disabled={disabled}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2"
          onClick={addCustomTag}
          disabled={disabled || !customTag.trim()}
        >
          添加
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 gap-1" disabled={disabled}>
              <Lightbulb className="h-3.5 w-3.5" />
              提示词建议
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Tabs defaultValue={categories[0].id}>
              <div className="border-b px-3">
                <TabsList className="h-9 grid-cols-4">
                  {categories.map((category) => (
                    <TabsTrigger key={category.id} value={category.id} className="text-xs">
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {category.suggestions.map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant={selectedSuggestions.includes(suggestion) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer hover:bg-primary/20",
                          selectedSuggestions.includes(suggestion) && "bg-primary text-primary-foreground",
                        )}
                        onClick={() => toggleSuggestion(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
