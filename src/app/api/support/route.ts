import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const supportSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = supportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const created = await prisma.supportRequest.create({
      data: parsed.data,
    })

    return NextResponse.json({ id: created.id }, { status: 201 })
  } catch (error) {
    console.error('Support POST error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


