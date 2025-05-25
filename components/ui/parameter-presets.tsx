"use client"

import { useState } from "react"
import { BookmarkIcon, Save, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface ParameterPreset {
  id: string
  name: string
  description: string
  params: Record<string, any>
}

interface ParameterPresetsProps {
  presets: ParameterPreset[]
  currentParams: Record<string, any>
  onSelect: (preset: ParameterPreset) => void
  onSave: (preset: Omit<ParameterPreset, "id">) => void
  onDelete: (id: string) => void
  disabled?: boolean
}

export function ParameterPresets({
  presets,
  currentParams,
  onSelect,
  onSave,
  onDelete,
  disabled = false,
}: ParameterPresetsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState("")
  const [presetDescription, setPresetDescription] = useState("")

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSave({
        name: presetName.trim(),
        description: presetDescription.trim(),
        params: { ...currentParams },
      })
      setIsDialogOpen(false)
      setPresetName("")
      setPresetDescription("")
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1" disabled={disabled || presets.length === 0}>
              <BookmarkIcon className="h-3.5 w-3.5" />
              预设
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <ScrollArea className="h-[300px]">
              {presets.map((preset) => (
                <DropdownMenuItem
                  key={preset.id}
                  className="flex items-center justify-between"
                  onClick={() => onSelect(preset)}
                >
                  <div className="flex-1">
                    <p className="font-medium">{preset.name}</p>
                    {preset.description && <p className="text-xs text-muted-foreground">{preset.description}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(preset.id)
                    }}
                  >
                    <Trash className="h-3 w-3" />
                    <span className="sr-only">删除</span>
                  </Button>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" className="gap-1" onClick={() => setIsDialogOpen(true)} disabled={disabled}>
          <Save className="h-3.5 w-3.5" />
          保存当前参数
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>保存参数预设</DialogTitle>
            <DialogDescription>保存当前参数设置为预设，以便将来重复使用。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="preset-name" className="text-sm font-medium">
                预设名称
              </label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="例如：高质量肖像"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="preset-description" className="text-sm font-medium">
                描述（可选）
              </label>
              <Input
                id="preset-description"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="例如：适合生成高质量人物肖像的参数"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
