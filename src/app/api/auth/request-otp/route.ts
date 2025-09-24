import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const schema = z.object({
  phone: z.string().min(8),
})

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { phone } = parsed.data
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await prisma.loginAttempt.create({
      data: { phone, code, expiresAt },
    })

    // In production, send the code via SMS provider here
    return NextResponse.json({ ok: true, previewCode: process.env.NODE_ENV !== 'production' ? code : undefined })
  } catch (error) {
    console.error('request-otp error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


