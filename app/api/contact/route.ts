import { NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
  website: z.string().max(0).optional(), // Honeypot
})

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()

    console.log('📧 Contact form submission received')
    console.log('Environment variables check:', {
      hasAccessKey: !!process.env.WEB3FORMS_ACCESS_KEY,
    })

    // Check honeypot
    if (body.website) {
      console.log('⚠️ Spam detected via honeypot')
      return NextResponse.json(
        { error: 'Invalid submission' },
        { status: 400 }
      )
    }

    const validatedData = contactSchema.parse(body)
    console.log('✅ Data validated:', {
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject
    })

    // Send email using Web3Forms
    console.log('📤 Attempting to send email via Web3Forms...')

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: process.env.WEB3FORMS_ACCESS_KEY,
        name: validatedData.name,
        email: validatedData.email,
        subject: `[Portfolio] ${validatedData.subject}`,
        message: validatedData.message
      })
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      console.error('❌ Web3Forms error:', result)
      return NextResponse.json(
        { error: 'Failed to send email', details: result },
        { status: 500 }
      )
    }

    console.log('✅ Email sent successfully via Web3Forms!')

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing contact form:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
