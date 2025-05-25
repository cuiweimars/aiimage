"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useTranslations } from "next-intl"
import { Sparkles, Download, Share2, Bookmark, RefreshCw, AlertCircle, Upload, Trash2, ImageIcon, MinusCircle, Camera, Palette, Paintbrush, Sun, Droplet, Layout, Tag, Check, Circle, Contrast, Star, Eye, Flame, Cloud, ZoomIn, ZoomOut, Focus, Aperture, Maximize2, Crown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SocialShareButtons } from "@/components/social-share-buttons"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"

// 定义 OmniGen 模型的参数接口
interface OmniGenParams {
  prompt: string
  width: number
  height: number
  aspectRatio: string
  referenceImages: string[] // Base64 encoded images
  style?: string
  color?: string
  lighting?: string
  composition?: string
}

export function AIImageGeneratorPanel() {
  const t = useTranslations("ImageGenerator")
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // 识别用户等级
  let userPlan: 'guest' | 'basic' | 'pro' = 'guest';
  if ((session?.user as any)?.plan === 'pro') userPlan = 'pro';
  else if ((session?.user as any)?.plan === 'basic') userPlan = 'basic';

  // output_quality根据plan自动分配
  const getOutputQuality = () => {
    if (userPlan === 'pro') return 100;
    if (userPlan === 'basic') return 80;
    return 60;
  }

  // 高质量开关默认值
  const getHighQualityDefault = () => userPlan === 'pro';

  // 参数标签
  const PARAM_TAGS = [
    { key: "aspect", label: t("aspect.square"), value: "square" },
    { key: "style", label: t("style.none"), value: "none" },
    { key: "color", label: t("color.none"), value: "none" },
    { key: "lighting", label: t("lighting.none"), value: "none" },
    { key: "composition", label: t("composition.none"), value: "none" },
  ]

  // 比例选项与尺寸映射
  const ASPECT_RATIOS = [
    { label: "1:1", value: "1:1", width: 768, height: 768 },
    { label: "16:9", value: "16:9", width: 1280, height: 720 },
    { label: "21:9", value: "21:9", width: 1260, height: 540 },
    { label: "3:2", value: "3:2", width: 900, height: 600 },
    { label: "2:3", value: "2:3", width: 600, height: 900 },
    { label: "4:5", value: "4:5", width: 800, height: 1000 },
    { label: "5:4", value: "5:4", width: 1000, height: 800 },
    { label: "3:4", value: "3:4", width: 720, height: 960 },
    { label: "4:3", value: "4:3", width: 960, height: 720 },
    { label: "9:16", value: "9:16", width: 576, height: 1024 },
    { label: "9:21", value: "9:21", width: 432, height: 1008 },
  ]

  // 图标映射
  const ICONS: Record<string, React.ReactNode> = {
    none: <MinusCircle className="w-4 h-4 mr-2" />,
    realistic: <Camera className="w-4 h-4 mr-2" />,
    cartoon: <Palette className="w-4 h-4 mr-2" />,
    oil_painting: <Paintbrush className="w-4 h-4 mr-2" />,
    cyberpunk: <Sparkles className="w-4 h-4 mr-2" />,
    lowpoly: <Star className="w-4 h-4 mr-2" />,
    lineart: <Tag className="w-4 h-4 mr-2" />,
    anime: <ImageIcon className="w-4 h-4 mr-2" />,
    cinematic: <Eye className="w-4 h-4 mr-2" />,
    black_and_white: <Contrast className="w-4 h-4 mr-2" />,
    vivid: <Sparkles className="w-4 h-4 mr-2" />,
    soft: <Droplet className="w-4 h-4 mr-2" />,
    high_contrast: <Contrast className="w-4 h-4 mr-2" />,
    monochrome: <Circle className="w-4 h-4 mr-2" />,
    warm: <Flame className="w-4 h-4 mr-2" />,
    cool: <Cloud className="w-4 h-4 mr-2" />,
    natural: <Sun className="w-4 h-4 mr-2" />,
    backlight: <Sun className="w-4 h-4 mr-2" />,
    strong: <Sun className="w-4 h-4 mr-2" />,
    dramatic: <Sun className="w-4 h-4 mr-2" />,
    center: <Layout className="w-4 h-4 mr-2" />,
    symmetry: <Layout className="w-4 h-4 mr-2" />,
    rule_of_thirds: <Layout className="w-4 h-4 mr-2" />,
    close_up: <ZoomIn className="w-4 h-4 mr-2" />,
    long_shot: <Layout className="w-4 h-4 mr-2" />,
    "1:1": <ImageIcon className="w-4 h-4 mr-2" />,
    "16:9": <ImageIcon className="w-4 h-4 mr-2" />,
    "21:9": <ImageIcon className="w-4 h-4 mr-2" />,
    "3:2": <ImageIcon className="w-4 h-4 mr-2" />,
    "2:3": <ImageIcon className="w-4 h-4 mr-2" />,
    "4:5": <ImageIcon className="w-4 h-4 mr-2" />,
    "5:4": <ImageIcon className="w-4 h-4 mr-2" />,
    "3:4": <ImageIcon className="w-4 h-4 mr-2" />,
    "4:3": <ImageIcon className="w-4 h-4 mr-2" />,
    "9:16": <ImageIcon className="w-4 h-4 mr-2" />,
    "9:21": <ImageIcon className="w-4 h-4 mr-2" />,
    blurred_background: <Droplet className="w-4 h-4 mr-2" />,
    wide_angle: <ZoomOut className="w-4 h-4 mr-2" />,
    depth_of_field: <Aperture className="w-4 h-4 mr-2" />,
    low_angle: <Focus className="w-4 h-4 mr-2" />,
    high_angle: <Focus className="w-4 h-4 mr-2" />,
    macro: <Aperture className="w-4 h-4 mr-2" />,
  }

  const [prompt, setPrompt] = useState("")
  const [selectedTags, setSelectedTags] = useState({
    aspect: "square",
    style: "none",
  })
  const [highQuality, setHighQuality] = useState(getHighQualityDefault())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [countdown, setCountdown] = useState(10)
  const progressTimer = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const [outputFormat, setOutputFormat] = useState("")
  const [outputQuality, setOutputQuality] = useState(getOutputQuality())
  const [style, setStyle] = useState("none")
  const [color, setColor] = useState("none")
  const [lighting, setLighting] = useState("none")
  const [composition, setComposition] = useState("none")
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [lastImages, setLastImages] = useState<string[]>([])
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareImage, setShareImage] = useState<string | null>(null)

  // 参数中英文映射表
  const STYLE_MAP: Record<string, string | null> = {
    "none": null, "realistic": "realistic", "cartoon": "cartoon", "oil_painting": "oil painting", "cyberpunk": "cyberpunk", "lowpoly": "lowpoly", "lineart": "lineart", "anime": "anime", "cinematic": "cinematic"
  }
  const COLOR_MAP: Record<string, string | null> = {
    "none": null, "black_and_white": "black and white", "vivid": "vivid", "soft": "soft", "high_contrast": "high contrast", "monochrome": "monochrome"
  }
  const LIGHTING_MAP: Record<string, string | null> = {
    "none": null, "natural": "natural light", "backlight": "backlight", "soft": "soft light", "strong": "strong light", "dramatic": "dramatic light"
  }
  const COMPOSITION_MAP: Record<string, string | null> = {
    "none": null, "blurred_background": "blurred background", "close_up": "close-up", "wide_angle": "wide angle", "depth_of_field": "depth of field", "low_angle": "low angle shot", "high_angle": "high angle shot", "macro": "macro"
  }
  const FORMAT_MAP: Record<string, string | null> = {
    "webp": "webp", "jpg": "jpg", "png": "png"
  }

  // 自动恢复pending生成
  useEffect(() => {
    const pending = localStorage.getItem("pending-ai-generate")
    if (pending && session) {
      try {
        const data = JSON.parse(pending)
        setPrompt(data.prompt || "")
        setSelectedTags(data.selectedTags || { aspect: "square", style: "none" })
        setHighQuality(!!data.highQuality)
        localStorage.removeItem("pending-ai-generate")
        setTimeout(() => {
          handleGenerate()
        }, 300) // 稍作延迟，确保状态恢复
      } catch {}
    }
  }, [session])

  // 标签切换
  const handleTagClick = (key: string, value: string) => {
    setSelectedTags(prev => ({ ...prev, [key]: value }))
  }

  // 按钮区
  const handleClear = () => {
    setPrompt("")
    setSelectedTags({ aspect: "square", style: "none" })
    setHighQuality(false)
  }
  const handleRandom = () => {
    // 可自定义随机逻辑
    setPrompt("A futuristic cityscape at sunset")
  }
  const handleGenerate = async () => {
    if (!prompt || prompt.trim() === "") {
      toast(t("errors.emptyPrompt.title") + ': ' + t("errors.emptyPrompt.description"))
      return
    }
    try {
      setLoading(true)
      setError(null)
      setProgress(0)
      setCountdown(10)
      startTimeRef.current = Date.now();
      setLastImages(generatedImages)
      if (progressTimer.current) clearInterval(progressTimer.current)
      const MAX_WAIT = 10_000;
      progressTimer.current = setInterval(() => {
        if (!startTimeRef.current) return;
        const elapsed = Date.now() - startTimeRef.current;
        const percent = Math.min(100, Math.floor((elapsed / MAX_WAIT) * 100));
        setProgress(percent < 99 ? percent : 99);
        const remain = Math.max(0, Math.ceil((MAX_WAIT - elapsed) / 1000));
        setCountdown(remain);
      }, 200)

      // 1. 解析prompt中的<img1>、<img2>、<img3>顺序，生成img1/img2/img3字段
      const imgTags = ["<img1>", "<img2>", "<img3>"]
      let promptForApi = prompt
      let imgFields: Record<string, string> = {}
      imgTags.forEach((tag, idx) => {
        if (prompt.includes(tag) && imgFields[`img${idx+1}`]) {
          promptForApi = promptForApi.replaceAll(tag, `<img><|image_${idx+1}|></img>`)
        }
      })

      // 2. 构造API参数
      // 根据所选比例动态设置width/height
      const aspectObj = ASPECT_RATIOS.find(r => r.value === selectedTags.aspect) || ASPECT_RATIOS[0];
      const width = aspectObj.width;
      const height = aspectObj.height;
      const realOutputFormat = outputFormat && outputFormat !== "none" ? outputFormat : "webp"
      // 参数转英文
      const styleEn = STYLE_MAP[style] || null;
      const colorEn = COLOR_MAP[color] || null;
      const lightingEn = LIGHTING_MAP[lighting] || null;
      const compositionEn = COMPOSITION_MAP[composition] || null;
      const formatEn = FORMAT_MAP[realOutputFormat] || null;
      // 拼接英文提示词
      if (styleEn) promptForApi += `, style: ${styleEn}`
      if (colorEn) promptForApi += `, color: ${colorEn}`
      if (lightingEn) promptForApi += `, lighting: ${lightingEn}`
      if (compositionEn) promptForApi += `, composition: ${compositionEn}`
      if (formatEn) promptForApi += `, format: ${formatEn}`
      const apiParams = {
        prompt: promptForApi,
        width,
        height,
        output_format: formatEn || "webp",
        num_outputs: 4,
        num_inference_steps: 4,
        megapixels: 1,
        output_quality: outputQuality,
        ...(userPlan === 'guest' ? { watermark: true } : {}),
      }

      // 3. 调用API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiParams),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate image")
      }

      const data = await response.json()

      // 4. 显示结果
      toast(t("generateSuccess") + ': ' + t("generateSuccessDesc"))

      // 5. 更新状态
      if (Array.isArray(data.imageUrl)) {
        setGeneratedImages(data.imageUrl.filter((img: any) => typeof img === 'string' && img.startsWith('http')))
      } else if (typeof data.imageUrl === 'string') {
        setGeneratedImages([data.imageUrl])
      } else {
        setGeneratedImages([])
      }
      setRemainingQuota(data.remaining)
      setCurrentPlan(data.plan)
      // 进度条补满动画
      if (progress < 100) {
        const start = progress;
        const duration = 200;
        const startTime = Date.now();
        const animate = () => {
          const now = Date.now();
          const elapsed = now - startTime;
          const percent = Math.min(100, start + ((100 - start) * (elapsed / duration)));
          setProgress(percent);
          if (elapsed < duration) {
            requestAnimationFrame(animate);
          } else {
            setProgress(100);
            setCountdown(0);
            if (progressTimer.current) { clearInterval(progressTimer.current); progressTimer.current = null }
            startTimeRef.current = null;
          }
        };
        animate();
      } else {
        setProgress(100);
        setCountdown(0);
        if (progressTimer.current) { clearInterval(progressTimer.current); progressTimer.current = null }
        startTimeRef.current = null;
      }

    } catch (err) {
      console.error("Generation error:", err)
      setError(err instanceof Error ? err.message : "Failed to generate image")
      toast(t("generateError") + ': ' + (err instanceof Error ? err.message : "Failed to generate image"))
      setProgress(0)
      setCountdown(0)
      if (progressTimer.current) { clearInterval(progressTimer.current); progressTimer.current = null }
      startTimeRef.current = null;
    } finally {
      setLoading(false)
    }
  }

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => { if (progressTimer.current) clearInterval(progressTimer.current) }
  }, [])

  // 下拉选择通用渲染
  type Option = { label: string; value: string }
  const renderSelect = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    options: Option[]
  ) => (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger className="bg-card text-muted-foreground border-none rounded-lg px-4 py-2 min-w-[90px] text-center font-medium shadow-none focus:ring-2 focus:ring-primary/40">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="bg-card text-muted-foreground border-none rounded-lg">
        {options.map((opt: Option) => (
          <SelectItem key={opt.value} value={opt.value} className="hover:bg-accent focus:bg-accent">{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const getLabel = (opts: {label: string; value: string}[], val: string) => opts.find((o: {label: string; value: string}) => o.value === val)?.label

  // 通用标签+下拉菜单组件
  function TagDropdown({ label, value, setValue, options }: { label: string; value: string; setValue: (v: string) => void; options: { label: string; value: string }[] }) {
    const [open, setOpen] = useState(false);
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`px-3 py-1 rounded-full focus:outline-none ${value!=="none"?"bg-primary/20 text-primary":"bg-card text-muted-foreground"} flex items-center text-sm font-medium mr-2 transition-colors duration-200`}
            style={{ border: 'none' }}
          >
            {ICONS[value] || null}{label}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0">
          <Command>
            <CommandGroup>
              {options.map((opt: {label: string; value: string}) => (
                <CommandItem key={opt.value} onSelect={() => { setValue(opt.value); setOpen(false); }} className="flex items-center">
                  {ICONS[opt.value] || null}
                  <span>{opt.label}</span>
                  {value === opt.value && <Check className="ml-auto w-4 h-4 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  // 图片下载
  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const a = document.createElement("a")
      a.href = window.URL.createObjectURL(blob)
      a.download = `ai-image.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(a.href)
      document.body.removeChild(a)
    } catch (e) {
      toast("下载失败: " + (e as Error).message)
    }
  }

  // 在handleDownload下方添加handlePublishToGallery
  const handlePublishToGallery = async (imgUrl: string) => {
    try {
      // 假设有API /api/gallery 支持POST { imageUrl, prompt }
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imgUrl, prompt }),
      })
      if (!res.ok) throw new Error("发布失败")
      toast(t('galleryPublishSuccess'))
      toast(t('galleryShareSuccess'))
    } catch (e) {
      toast("发布失败: " + (e as Error).message)
    }
  }

  // 下拉参数选项
  const STYLE_OPTIONS = [
    { label: t("style.none"), value: "none" },
    { label: t("style.realistic"), value: "realistic" },
    { label: t("style.cartoon"), value: "cartoon" },
    { label: t("style.oilPainting"), value: "oil_painting" },
    { label: t("style.cyberpunk"), value: "cyberpunk" },
    { label: t("style.lowpoly"), value: "lowpoly" },
    { label: t("style.lineart"), value: "lineart" },
    { label: t("style.anime"), value: "anime" },
    { label: t("style.cinematic"), value: "cinematic" },
  ];
  const COLOR_OPTIONS = [
    { label: t("color.none"), value: "none" },
    { label: t("color.bw"), value: "black_and_white" },
    { label: t("color.vivid"), value: "vivid" },
    { label: t("color.soft"), value: "soft" },
    { label: t("color.highContrast"), value: "high_contrast" },
    { label: t("color.monochrome"), value: "monochrome" },
  ];
  const LIGHTING_OPTIONS = [
    { label: t("lighting.none"), value: "none" },
    { label: t("lighting.natural"), value: "natural" },
    { label: t("lighting.backlight"), value: "backlight" },
    { label: t("lighting.soft"), value: "soft" },
    { label: t("lighting.hard"), value: "strong" },
    { label: t("lighting.drama"), value: "dramatic" },
  ];
  const COMPOSITION_OPTIONS = [
    { label: t("composition.none"), value: "none" },
    { label: t("composition.blurred"), value: "blurred_background" },
    { label: t("composition.closeup"), value: "close_up" },
    { label: t("composition.wide"), value: "wide_angle" },
    { label: t("composition.depth"), value: "depth_of_field" },
    { label: t("composition.low"), value: "low_angle" },
    { label: t("composition.high"), value: "high_angle" },
    { label: t("composition.macro"), value: "macro" },
  ];
  const FORMAT_OPTIONS = [
    { label: t("format.webp"), value: "webp" },
    { label: t("format.jpg"), value: "jpg" },
    { label: t("format.png"), value: "png" },
  ];

  // 切换高质量开关
  const handleHighQualityChange = (v: boolean) => {
    if (userPlan !== 'pro') {
      setShowUpgradeDialog(true)
      return;
    }
    setHighQuality(v)
    setOutputQuality(v ? 100 : 80)
  }

  useEffect(() => {
    // 用户等级变化时重置画质参数
    setOutputQuality(getOutputQuality())
    setHighQuality(getHighQualityDefault())
  }, [userPlan])

  return (
    <>
      {/* 升级弹窗 */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-sm bg-background text-foreground rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Crown className="w-6 h-6 text-primary" />
              高级版会员专属权益
            </DialogTitle>
            {/* 动态提示当前用户等级 */}
            {(userPlan === 'guest' || userPlan === 'basic') && (
              <div className="text-xs text-primary font-semibold mt-2 mb-1">
                当前为{userPlan === 'guest' ? '免费版' : '基础版'}用户，升级后可享受以下权益：
              </div>
            )}
            <DialogDescription className="text-muted-foreground mt-2">
              升级为高级版会员，解锁高质量AI图像生成、极速体验和更多专属权益。
            </DialogDescription>
          </DialogHeader>
          <div className="bg-card rounded-lg p-4 mt-4 mb-4 text-muted-foreground text-sm">
            <div className="font-semibold mb-2">高级版会员权益：</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>生成高清晰度、细节更丰富的AI图像</li>
              <li>极速生成，无需等待</li>
              <li>图片无水印</li>
              <li>无限生成次数</li>
              <li>优先队列，专属通道</li>
              <li>专属客服支持</li>
            </ul>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" className="rounded-lg px-6" onClick={() => setShowUpgradeDialog(false)}>
              暂不
            </Button>
            <Button className="rounded-lg px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-bold" onClick={() => { setShowUpgradeDialog(false); router.push('/subscribe'); }}>
              升级到高级版
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Card className="bg-background rounded-2xl p-6 w-full max-w-4xl mx-auto shadow-lg relative">
        {/* 参数下拉区整体上移 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TagDropdown({
            label: `${t('aspect.label')} ${ASPECT_RATIOS.find(r=>r.value===selectedTags.aspect)?.label || "1:1"}`,
            value: selectedTags.aspect || "1:1",
            setValue: (v: string) => setSelectedTags(prev => ({ ...prev, aspect: v })),
            options: ASPECT_RATIOS
          })}
          {TagDropdown({
            label: STYLE_OPTIONS.find(o=>o.value===style)?.label||"风格",
            value: style,
            setValue: setStyle,
            options: STYLE_OPTIONS
          })}
          {TagDropdown({
            label: COLOR_OPTIONS.find(o=>o.value===color)?.label||"色彩",
            value: color,
            setValue: setColor,
            options: COLOR_OPTIONS
          })}
          {TagDropdown({
            label: LIGHTING_OPTIONS.find(o=>o.value===lighting)?.label||"光照",
            value: lighting,
            setValue: setLighting,
            options: LIGHTING_OPTIONS
          })}
          {TagDropdown({
            label: COMPOSITION_OPTIONS.find(o=>o.value===composition)?.label||"构图",
            value: composition,
            setValue: setComposition,
            options: COMPOSITION_OPTIONS
          })}
          {TagDropdown({
            label: `${t('format.label')} ${FORMAT_OPTIONS.find(o=>o.value===outputFormat)?.label || "webp"}`,
            value: outputFormat || "webp",
            setValue: setOutputFormat,
            options: FORMAT_OPTIONS
          })}
        </div>
        {/* 输入框区 */}
        <div className="relative mb-4">
          <Textarea
            ref={promptRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={t("promptPlaceholder")}
            className="bg-card text-foreground min-h-[120px] rounded-xl pr-16 pl-4 pt-4 pb-20 text-lg border-2 border-blue-500 resize-none shadow-inner"
          />
        </div>
        <div className="flex items-center gap-8 mb-6">
          <div className="flex items-center gap-6 flex-1">
            {/* 注释掉高质量开关 */}
            {/*
            <div className="flex items-center gap-2">
              <Switch checked={highQuality} onCheckedChange={handleHighQualityChange} id="output-quality" />
              <Label htmlFor="output-quality" className="text-muted-foreground text-sm">高质量</Label>
            </div>
            */}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-lg px-6" onClick={handleClear}>{t("clear")}</Button>
            <Button variant="outline" className="rounded-lg px-6" onClick={handleRandom}>{t("random")}</Button>
            <Button className="rounded-lg px-6 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleGenerate}>
              {loading ? <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full align-middle" /> : null}
              {t("generate")}
            </Button>
          </div>
        </div>

        {/* 生成结果区域：仅在有内容时渲染，避免空白 */}
        {(loading || error || (generatedImages.length > 0 && !loading && !error)) && (
          <div className="mt-8 w-full">
            {loading && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <Progress value={progress} className="w-2/3 h-2 mb-2" />
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">{t("generating")}</p>
                <p className="text-xs text-muted-foreground">{countdown > 0 ? t('countdown', { count: countdown }) : ''}</p>
                {/* loading时显示上一次生成结果的淡化图或骨架屏 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full mt-6">
                  {lastImages.length > 0
                    ? lastImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square w-full overflow-hidden rounded-xl shadow-lg bg-muted opacity-50 grayscale">
                          <Image
                            src={img}
                            alt="预览"
                            fill
                            className="object-cover"
                            style={{ filter: 'grayscale(1) blur(2px)', pointerEvents: 'none' }}
                          />
                        </div>
                      ))
                    : Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="aspect-square w-full rounded-xl bg-card animate-pulse" />
                      ))}
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            {generatedImages.length > 0 && !loading && !error && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  {generatedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square w-full overflow-hidden rounded-xl shadow-lg group bg-muted">
                      <Image
                        src={img}
                        alt={prompt}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onClick={() => { setPreviewImage(img); setPreviewOpen(true); }}
                        style={{ cursor: 'zoom-in' }}
                      />
                      {/* 悬停操作按钮 */}
                      <TooltipProvider>
                      <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                        <button onClick={() => handleDownload(img)} className="bg-white/80 hover:bg-white rounded-full p-2 shadow">
                          <Download className="w-5 h-5 text-primary" />
                        </button>
                            </TooltipTrigger>
                            <TooltipContent>{t('download.label', { defaultValue: 'Download' })}</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                        <button onClick={() => { setPreviewImage(img); setPreviewOpen(true); }} className="bg-white/80 hover:bg-white rounded-full p-2 shadow">
                          <Maximize2 className="w-5 h-5 text-primary" />
                        </button>
                            </TooltipTrigger>
                            <TooltipContent>{t('view', { defaultValue: 'View' })}</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => handlePublishToGallery(img)} className="bg-white/80 hover:bg-white rounded-full p-2 shadow">
                                <Upload className="w-5 h-5 text-primary" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>{t('share.label', { defaultValue: 'Share' })}</TooltipContent>
                          </Tooltip>
                          {/* 新增社交分享按钮 */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => { setShareImage(img); setShareOpen(true); }} className="bg-white/80 hover:bg-white rounded-full p-2 shadow">
                                <Share2 className="w-5 h-5 text-primary" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>{t('share.label', { defaultValue: 'Share' })}</TooltipContent>
                          </Tooltip>
                      </div>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
                {/* 底部信息区 */}
                <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                  {/* 当前计划 */}
                  <div>
                    {t('planLabel')}: {t(`plan.${userPlan}`)}
                  </div>
                  {/* 画质等级 */}
                  <div>
                    {t('qualityLabel')}: {t(`quality.${userPlan}`)}
                  </div>
                </div>
                {/* 大图预览 Dialog */}
                <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                  <DialogContent className="max-w-3xl flex items-center justify-center bg-black">
                    <DialogTitle className="sr-only">图片预览</DialogTitle>
                    {previewImage && (
                      <img src={previewImage} alt="预览" className="max-h-[80vh] max-w-full rounded-xl shadow-xl" />
                    )}
                  </DialogContent>
                </Dialog>
                {/* 社交分享弹窗 */}
                <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                  <DialogContent className="max-w-md flex items-center justify-center">
                    <DialogTitle className="sr-only">{t('share.label', { defaultValue: 'Share' })}</DialogTitle>
                    {shareImage && (
                      <SocialShareButtons url={shareImage} title={t('share.defaultText', { defaultValue: 'Check out this AI-generated image!' })} imageUrl={shareImage} />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        )}
      </Card>
    </>
  )
}

export { AIImageGeneratorPanel as ImageGenerator }
