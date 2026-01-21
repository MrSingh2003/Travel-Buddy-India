// src/app/api/inspire/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateInspirationalImage } from '@/ai/flows/generate-inspirational-image'

const schema = z.object({
  query: z.string().min(2),
  location: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parse = schema.safeParse(json)
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const result = await generateInspirationalImage(parse.data)
    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    console.error('Inspire API error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
