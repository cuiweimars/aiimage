import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const supabase = createClient()
  const { data: items, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(16)

  if (error) {
    console.error('Error fetching gallery items:', error)
    return NextResponse.json({ error: 'Failed to fetch gallery items' }, { status: 500 })
  }

  return NextResponse.json(items || [])
}

export async function POST(req: NextRequest) {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch {}

  const body = await req.json()
  if (!body.imageUrl) {
    return NextResponse.json({ error: '缺少图片URL' }, { status: 400 })
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('gallery')
    .insert({
      image_url: body.imageUrl,
      prompt: body.prompt || '',
      user_id: session?.user?.id || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error inserting gallery item:', error)
    return NextResponse.json({ error: 'Failed to insert gallery item' }, { status: 500 })
  }

  return NextResponse.json(data)
} 