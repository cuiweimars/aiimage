import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import Replicate from "replicate"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"
import { requestQueue } from "@/lib/request-queue"
import { generationCache } from "@/lib/generation-cache"
import { processAndOptimizeImage, supportsWebP } from "@/lib/image-optimizer"
import { getOptimizedConfig, getOptimizedParams } from "@/lib/generation-config"
import { batchProcessor } from "@/lib/batch-processor"
import { getTranslations } from 'next-intl/server'

// 定义模型名称（asiryan/flux-schnell官方推荐版本）
const MODEL_NAME = "lucataco/flux-schnell-lora:2a6b576af31790b470f0a8442e1e9791213fa13799cbb65a9fc1436e96389574"

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const t = await getTranslations('ImageGenerator')

    // 解析请求体
    let requestData
    try {
      requestData = await req.json()
    } catch {
      return NextResponse.json({ error: '请求体格式错误，必须为JSON' }, { status: 400 })
    }
    const {
      prompt,
      width,
      height,
      output_format,
      num_inference_steps,
      go_fast,
      megapixels,
      seed,
      image,
      strength
    } = requestData

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // 获取用户的优化配置（未登录用户用默认plan）
    const userConfig = getOptimizedConfig(session?.user?.plan)
    const userPlan = requestData.userPlan || 'free'

    // 参数映射
    const styleMap = {
      [t('style.none')]: null,
      [t('style.realistic')]: 'realistic',
      [t('style.cartoon')]: 'cartoon',
      [t('style.oilPainting')]: 'oil painting',
      [t('style.cyberpunk')]: 'cyberpunk',
      [t('style.lowpoly')]: 'lowpoly',
      [t('style.lineart')]: 'lineart',
      [t('style.anime')]: 'anime',
      [t('style.cinematic')]: 'cinematic'
    }

    const colorMap = {
      [t('color.none')]: null,
      [t('color.blackAndWhite')]: 'black and white',
      [t('color.vivid')]: 'vivid',
      [t('color.soft')]: 'soft',
      [t('color.highContrast')]: 'high contrast',
      [t('color.monochrome')]: 'monochrome'
    }

    const lightingMap = {
      [t('lighting.none')]: null,
      [t('lighting.natural')]: 'natural light',
      [t('lighting.backlight')]: 'backlight',
      [t('lighting.soft')]: 'soft light',
      [t('lighting.strong')]: 'strong light',
      [t('lighting.dramatic')]: 'dramatic light'
    }

    const compositionMap: Record<string, string | null> = {
      "无构图": null, "模糊背景": "blurred background", "特写": "close-up", "广角": "wide angle", "景深": "depth of field", "自下而上拍摄": "low angle shot", "自上而下拍摄": "high angle shot", "微距摄影": "macro"
    };
    const formatMap: Record<string, string | null> = {
      "webp": "webp", "jpg": "jpg", "png": "png"
    };

    // 拼接最终英文提示词
    let promptForApi = prompt;
    if (requestData.style && styleMap[requestData.style]) promptForApi += `, style: ${styleMap[requestData.style]}`;
    if (requestData.color && colorMap[requestData.color]) promptForApi += `, color: ${colorMap[requestData.color]}`;
    if (requestData.lighting && lightingMap[requestData.lighting]) promptForApi += `, lighting: ${lightingMap[requestData.lighting]}`;
    if (requestData.composition && compositionMap[requestData.composition]) promptForApi += `, composition: ${compositionMap[requestData.composition]}`;
    if (requestData.output_format && formatMap[requestData.output_format]) promptForApi += `, format: ${formatMap[requestData.output_format]}`;

    // imageId声明提升，便于后续返回
    let imageId: string | undefined = undefined;
    // 识别用户等级
    let plan: 'guest' | 'basic' | 'pro' = 'guest';
    if ((session?.user as any)?.plan === 'pro') plan = 'pro';
    else if ((session?.user as any)?.plan === 'basic') plan = 'basic';

    // 根据plan设置画质
    let output_quality = 60;
    if (plan === 'basic') output_quality = 80;
    if (plan === 'pro') output_quality = 100;
    // 若前端传了output_quality则优先用前端，但需兜底校验
    if (typeof requestData.output_quality === 'number') {
      let reqQ = requestData.output_quality;
      if (plan === 'pro') {
        output_quality = reqQ > 100 ? 100 : reqQ;
      } else if (plan === 'basic') {
        output_quality = reqQ > 80 ? 80 : reqQ;
      } else {
        output_quality = reqQ > 60 ? 60 : reqQ;
      }
    }

    // 只保留前端传递的参数
    const generationParams: Record<string, any> = {}
    if (promptForApi) generationParams.prompt = promptForApi
    if (width) generationParams.width = width
    if (height) generationParams.height = height
    if (output_format) generationParams.output_format = output_format
    if (num_inference_steps) generationParams.num_inference_steps = num_inference_steps
    if (go_fast !== undefined) generationParams.go_fast = go_fast
    if (megapixels) generationParams.megapixels = megapixels
    if (seed) generationParams.seed = seed
    if (image) generationParams.image = image
    if (strength) generationParams.strength = strength
    generationParams.num_outputs = typeof requestData.num_outputs === 'number' ? requestData.num_outputs : 4;
    generationParams.output_quality = output_quality;
    // 仅未登录用户加水印
    if (plan === 'guest') generationParams.watermark = true;

    // 检查缓存
    const cachedImageUrl = await generationCache.get(generationParams)
    if (cachedImageUrl) {
      // 创建 Supabase 客户端，仅已登录用户保存历史
      if (session?.user?.id) {
        const supabase = createClient()
        imageId = uuidv4()
        const { error: dbError } = await supabase.from("images").insert({
          id: imageId,
          user_id: session.user.id,
          prompt,
          width: generationParams.width,
          height: generationParams.height,
          style_preset: generationParams.style_preset !== "none" ? generationParams.style_preset : null,
          image_url: cachedImageUrl,
          created_at: new Date().toISOString(),
          is_cached: true,
        })
        if (dbError) {
          console.error("Error saving image to database:", dbError)
        }
      }

      return NextResponse.json({
        imageUrl: cachedImageUrl,
        imageId: (session?.user?.id ? imageId : undefined),
        remaining: session?.user?.quota?.remaining,
        plan: session?.user?.plan,
        cached: true,
      })
    }

    // 使用请求队列管理并发
    const imageUrl = await requestQueue.enqueue(async () => {
      // 使用批处理服务（如果启用）
      if (userConfig.batch.enabled) {
        return batchProcessor.add<string>(generationParams)
      }

      // 创建 Replicate 客户端
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      })

      // 直接调用 Replicate API
      try {
        // 1. 创建 prediction
        const apiUrl = `https://api.replicate.com/v1/predictions`;
        const createRes = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: MODEL_NAME.split(':')[1],
            input: { ...generationParams, num_outputs: generationParams.num_outputs }
          })
        });
        const createRaw = await createRes.text();
        if (!createRes.ok) throw new Error('Replicate create failed: ' + createRaw);
        const createData = JSON.parse(createRaw);
        const predictionId = createData.id;
        // 2. 轮询 prediction 状态
        let prediction = createData;
        let pollCount = 0;
        while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
          await new Promise(r => setTimeout(r, 2000));
          const pollRes = await fetch(`${apiUrl}/${predictionId}`, {
            headers: {
              'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json',
            }
          });
          const pollRaw = await pollRes.text();
          if (!pollRes.ok) throw new Error('Replicate poll failed: ' + pollRaw);
          prediction = JSON.parse(pollRaw);
        }
        if (prediction.status !== 'succeeded') {
          throw new Error('Replicate prediction failed: ' + JSON.stringify(prediction));
        }
        const outputArr = prediction.output;
        let imageUrls: string[] = [];
        if (Array.isArray(outputArr)) {
          imageUrls = outputArr.filter((x: any) => typeof x === 'string' && x.startsWith('http'));
        }
        if (!imageUrls.length) {
          throw new Error("Invalid response from Replicate API")
        }
        return imageUrls
      } catch (err) {
        throw err
      }
    })

    if (!imageUrl || !Array.isArray(imageUrl) || !imageUrl.length) {
      throw new Error("Failed to generate image URL")
    }

    // 检测浏览器是否支持WebP
    const userAgent = req.headers.get("user-agent") || ""
    const useWebP = userConfig.image.useWebP && supportsWebP(userAgent)

    // 创建 Supabase 客户端，仅已登录用户保存历史
    if (session?.user?.id) {
      const supabase = createClient()
      imageId = uuidv4()
      const { error: dbError } = await supabase.from("images").insert({
        id: imageId,
        user_id: session.user.id,
        prompt,
        width: generationParams.width,
        height: generationParams.height,
        style_preset: generationParams.style_preset !== "none" ? generationParams.style_preset : null,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      })
      if (dbError) {
        console.error("Error saving image to database:", dbError)
      }
    }

    // 将结果添加到缓存
    await generationCache.set(generationParams, Array.isArray(imageUrl) ? imageUrl[0] : imageUrl)

    // 返回生成图像的URL数组
    return NextResponse.json({
      imageUrl: imageUrl,
      imageId: (session?.user?.id ? imageId : undefined),
      remaining: session?.user?.quota?.remaining,
      plan: session?.user?.plan,
      cached: false,
    })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
