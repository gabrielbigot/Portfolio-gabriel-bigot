import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { name, email, subject, message, website } = await request.json()

    // Honeypot check
    if (website) {
      return NextResponse.json({ success: true })
    }

    await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: "gabriel.bigot2005@gmail.com",
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: `Nom : ${name}\nEmail : ${email}\n\n${message}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
