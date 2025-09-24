import { NextResponse } from 'next/server'
import { z } from 'zod'
import { searchPlaces } from '@/ai/flows/search-places'
import { globalExploreCache } from '@/lib/cache'
import { exploreLimiter } from '@/lib/rate-limit'

const schema = z.object({
  query: z.string().min(2),
  location: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0] || 'anon'
    if (!exploreLimiter.allow(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    const json = await request.json()
    const parse = schema.safeParse(json)
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const key = `${parse.data.query}::${parse.data.location}`.toLowerCase()
    const cached = globalExploreCache.get(key)
    if (cached) {
      return NextResponse.json(cached, { status: 200, headers: { 'x-cache': 'HIT' } })
    }

    const result = await searchPlaces(parse.data)
    globalExploreCache.set(key, result, 1000 * 60 * 5)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Explore API error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


