import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createSession } from '@/lib/auth'

const schema = z.object({
  phone: z.string().min(8),
  code: z.string().length(6),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { phone, code } = parsed.data

    const attempt = await prisma.loginAttempt.findFirst({
      where: { phone, code, consumed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    })
    if (!attempt) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
    }

    const result = await prisma.$transaction([
      prisma.loginAttempt.update({ where: { id: attempt.id }, data: { consumed: true } }),
      prisma.user.upsert({
        where: { phone: phone },
        update: { phoneVerified: true },
        create: { phone: phone, email: `${phone}@example.local`, phoneVerified: true },
      }),
    ])

    const userRecord = await prisma.user.findUnique({ where: { phone } })
    if (userRecord) {
      await createSession(userRecord.id)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('verify-otp error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


