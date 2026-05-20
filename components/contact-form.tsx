"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

const contactFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom est trop long"),
  email: z.string().email("Email invalide"),
  subject: z.string().min(3, "Le sujet doit contenir au moins 3 caractères").max(200, "Le sujet est trop long"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères").max(2000, "Le message est trop long"),
  // Honeypot field for spam protection
  website: z.string().max(0, "Invalid field"),
})

type ContactFormData = z.infer<typeof contactFormSchema>

const contactCopy = {
  fr: {
    name: "NOM *",
    email: "EMAIL *",
    subject: "SUJET *",
    message: "MESSAGE *",
    emailPlaceholder: "votre@email.com",
    subjectPlaceholder: "Proposition de stage en IA",
    messagePlaceholder: "Bonjour Gabriel, je suis intéressé par votre profil pour...",
    sending: "Envoi en cours...",
    submit: "Envoyer le message",
    successTitle: "Message envoyé avec succès !",
    successText: "Merci pour votre message. Je vous répondrai dans les plus brefs délais.",
    errorTitle: "Erreur lors de l'envoi",
    errorText: "Une erreur est survenue. Veuillez réessayer ou me contacter directement par email.",
    privacy: "* Champs obligatoires. Vos données sont traitées de manière confidentielle.",
  },
  en: {
    name: "NAME *",
    email: "EMAIL *",
    subject: "SUBJECT *",
    message: "MESSAGE *",
    emailPlaceholder: "your@email.com",
    subjectPlaceholder: "AI internship opportunity",
    messagePlaceholder: "Hello Gabriel, I am interested in your profile for...",
    sending: "Sending...",
    submit: "Send message",
    successTitle: "Message sent successfully!",
    successText: "Thank you for your message. I will reply as soon as possible.",
    errorTitle: "Message could not be sent",
    errorText: "Something went wrong. Please try again or contact me directly by email.",
    privacy: "* Required fields. Your data is handled confidentially.",
  },
}

interface ContactFormProps {
  locale?: "fr" | "en"
}

export default function ContactForm({ locale = "fr" }: ContactFormProps) {
  const copy = contactCopy[locale]
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    // Check honeypot
    if (data.website) {
      console.log("Spam detected")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to send')

      setSubmitStatus("success")
      reset()

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle")
      }, 5000)
    } catch (error) {
      console.error("Error sending message:", error)
      setSubmitStatus("error")

      // Reset error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle")
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Honeypot field - hidden from users */}
      <input
        type="text"
        {...register("website")}
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-mono text-muted-foreground">
          {copy.name}
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Gabriel Bigot"
        />
        {errors.name && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-mono text-muted-foreground">
          {copy.email}
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={copy.emailPlaceholder}
        />
        {errors.email && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Subject Field */}
      <div className="space-y-2">
        <label htmlFor="subject" className="block text-sm font-mono text-muted-foreground">
          {copy.subject}
        </label>
        <input
          id="subject"
          type="text"
          {...register("subject")}
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={copy.subjectPlaceholder}
        />
        {errors.subject && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.subject.message}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-2">
        <label htmlFor="message" className="block text-sm font-mono text-muted-foreground">
          {copy.message}
        </label>
        <textarea
          id="message"
          {...register("message")}
          disabled={isSubmitting}
          rows={6}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all duration-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={copy.messagePlaceholder}
        />
        {errors.message && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="space-y-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-8 py-4 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{copy.sending}</span>
            </>
          ) : (
            <span>{copy.submit}</span>
          )}
        </button>

        {/* Success Message */}
        {submitStatus === "success" && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-500">{copy.successTitle}</p>
              <p className="text-sm text-muted-foreground">
                {copy.successText}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === "error" && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-500">{copy.errorTitle}</p>
              <p className="text-sm text-muted-foreground">
                {copy.errorText}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {copy.privacy}
      </p>
    </form>
  )
}
