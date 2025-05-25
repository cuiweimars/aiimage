import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_PATH = path.resolve(process.cwd(), 'data/gallery.json')

function readGallery() {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writeGallery(items: any[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2), 'utf-8')
}

export async function GET() {
  const items = readGallery()
  return NextResponse.json(items.slice(0, 16))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.imageUrl) {
    return NextResponse.json({ error: '缺少图片URL' }, { status: 400 })
  }
  const items = readGallery()
  const newItem = {
    imageUrl: body.imageUrl,
    prompt: body.prompt || '',
    createdAt: Date.now(),
  }
  items.unshift(newItem)
  writeGallery(items)
  return NextResponse.json({ success: true })
} 