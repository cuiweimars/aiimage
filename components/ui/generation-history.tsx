"use client"

import { useState } from "react"
import { Clock, Copy, MoreHorizontal, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface HistoryItem {
  id: string
  prompt: string
  imageUrl: string
  timestamp: Date
  params: Record<string, any>
}

interface GenerationHistoryProps {
  history: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onDelete: (id: string) => void
  onClear: () => void
}

export function GenerationHistory({ history, onSelect, onDelete, onClear }: GenerationHistoryProps) {
  const [expanded, setExpanded] = useState(false)

  if (history.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed right-4 bottom-4 z-50 flex flex-col rounded-lg border bg-background shadow-lg transition-all",
        expanded ? "h-96 w-80" : "h-12 w-12",
      )}
    >
      <div className="flex items-center justify-between border-b p-2">
        <button
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted",
            expanded ? "rotate-0" : "rotate-180",
          )}
          onClick={() => setExpanded(!expanded)}
        >
          <Clock className="h-4 w-4" />
          <span className={cn("ml-2 font-medium", expanded ? "inline" : "hidden")}>生成历史</span>
        </button>
        {expanded && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClear}>
              <Trash className="h-4 w-4" />
              <span className="sr-only">清空历史</span>
            </Button>
          </div>
        )}
      </div>

      {expanded && (
        <ScrollArea className="flex-1 p-2">
          <div className="grid grid-cols-2 gap-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="group relative cursor-pointer overflow-hidden rounded-md border hover:border-primary"
                onClick={() => onSelect(item)}
              >
                <div className="relative aspect-square w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.prompt}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex justify-end">
                    <TooltipProvider>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-black/40 text-white">
                            <MoreHorizontal className="h-3 w-3" />
                            <span className="sr-only">操作</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(item.prompt)
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            复制提示词
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(item.id)
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipProvider>
                  </div>
                  <div>
                    <p className="line-clamp-2 text-xs text-white">{item.prompt}</p>
                    <p className="mt-1 text-[10px] text-white/70">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
