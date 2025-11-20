import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Check honeypot
    if (body.website) {
      console.log('Spam detected via honeypot')
      return NextResponse.json(
        { error: 'Invalid submission' },
        { status: 400 }
      )
    }

    const validatedData = contactSchema.parse(body)

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>', // This is Resend's test email
      to: process.env.CONTACT_EMAIL || 'gabriel.bigot@exemple.com', // Your email
      replyTo: validatedData.email, // Visitor's email for easy reply
      subject: `[Portfolio] ${validatedData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
            Nouveau message depuis votre portfolio
          </h2>

          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>De:</strong> ${validatedData.name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${validatedData.email}</p>
            <p style="margin: 10px 0;"><strong>Sujet:</strong> ${validatedData.subject}</p>
          </div>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${validatedData.message}</p>
          </div>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Ce message a été envoyé depuis le formulaire de contact de votre portfolio.
          </p>
        </div>
      `,
      text: `
Nouveau message depuis votre portfolio

De: ${validatedData.name}
Email: ${validatedData.email}
Sujet: ${validatedData.subject}

Message:
${validatedData.message}
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Email sent successfully', id: data?.id },
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
