// Auto-generated from lib/data.ts project content.
// Keep this file focused on English copy for the /en project pages.

export const projectTranslationsEn = {
  "veille-automatisee-contenus-linkedin": {
    "title": "Automated monitoring and LinkedIn content machine",
    "shortDescription": "Complete automation chain: RSS feed → AI qualification → generation of LinkedIn drafts → AI images → automatic publication, controlled from a Notion Hub with 5 interconnected databases.",
    "fullDescription": "Complete automation chain in 3 interconnected n8n workflows for ADN POTENTIEL. Workflow A: automated monitoring with AI qualification (Perplexity + GPT-4 mini) every 6 hours. Workflow B: generation of LinkedIn drafts (150-250 words) + images via Google Gemini. Workflow C: automatic LinkedIn publication on click from Notion.",
    "category": "Automation",
    "tags": [
      "n8n",
      "OpenAI",
      "Google Gemini",
      "LinkedIn API",
      "Notion",
      "Perplexity AI"
    ],
    "company": "ADN POTENTIEL",
    "problem": "No SEO presence despite 2 years of existence, manual and time-consuming content production (~7 hours/week), no sector monitoring system.",
    "solution": "3 interconnected n8n workflows + Notion Hub 5 databases: automated monitoring, AI content generation, LinkedIn publication by click.",
    "impact": [
      "7 hours+ saved per week on monitoring and content creation",
      "75% validation rate of generated drafts (minor changes only)",
      "0 production release failures",
      "~50 articles captured and qualified in a few days",
      "Optimized API cost: ~5-10€/month"
    ],
    "challenges": [
      "Maintain the voice and tone of ADN POTENTIEL in generated content",
      "Reliable anti-duplicate mechanism for LinkedIn posts",
      "Graceful handling of API errors (expired token, rate limits)"
    ],
    "learnings": [
      "Architecture of n8n workflows in production",
      "Importance of the editorial line in AI prompts",
      "Value of documentation for customer autonomy"
    ],
    "technologies": [
      {
        "name": "n8n",
        "usage": "Orchestration of the 3 workflows"
      },
      {
        "name": "OpenAI GPT-4 mini",
        "usage": "AI qualification and content generation"
      },
      {
        "name": "Google Gemini",
        "usage": "Image generation"
      },
      {
        "name": "LinkedIn API v2",
        "usage": "Automatic publishing"
      },
      {
        "name": "Perplexity AI",
        "usage": "Search and qualification of articles"
      },
      {
        "name": "Notion",
        "usage": "Central control hub (5 interconnected databases)"
      }
    ],
    "media": [
      {
        "url": "/projects/veille-linkedin-workflow-n8n-veille-btp.png",
        "caption": "Workflow A — Construction monitoring & network content generation"
      },
      {
        "url": "/projects/veille-linkedin-workflow-n8n-gemini-image.png",
        "caption": "Workflow B — Generating Gemini images from Notion"
      },
      {
        "url": "/projects/veille-linkedin-workflow-n8n-publication.png",
        "caption": "Workflow C — LinkedIn Auto-Publish from Notion"
      },
      {
        "url": "/projects/veille-linkedin-notion-hub-veille.png",
        "caption": "Notion Hub — Central interface for monitoring & ADN POTENTIEL content"
      },
      {
        "url": "/projects/veille-linkedin-notion-contenus-publications.png",
        "caption": "Notion database — Content & Publications (editorial calendar)"
      },
      {
        "url": "/projects/veille-linkedin-notion-veille-adn.png",
        "caption": "Notion database — ADN POTENTIEL Monitoring (articles qualified by AI)"
      },
      {
        "url": "/projects/veille-linkedin-notion-modeles-publications.png",
        "caption": "Notion database — Publications Templates (editorial templates)"
      },
      {
        "url": "/projects/veille-linkedin-notion-modeles-images.png",
        "caption": "Notion database — Image Templates (visual styles library)"
      },
      {
        "url": "/projects/veille-linkedin-notion-contexte-adn.png",
        "caption": "Notion database — ADN POTENTIEL Context (AI reference documents)"
      },
      {
        "url": "/projects/veille-linkedin-publication-linkedin.png",
        "caption": "Example of automatically generated and published LinkedIn post"
      }
    ],
    "content": [
      {
        "type": "heading",
        "text": "Overview"
      },
      {
        "type": "paragraph",
        "text": "Complete automation chain in 3 interconnected n8n workflows, managed from a Notion Hub with 5 databases:"
      },
      {
        "type": "list",
        "items": [
          "Automated monitoring — AI capture and qualification of sectoral articles (construction, transmission, management) every 6 hours",
          "Content generation — Automatic production of LinkedIn drafts (150-250 words) and images via Google Gemini",
          "Auto-publish — Triggered on click in Notion, secure publishing on LinkedIn with anti-duplicate"
        ]
      },
      {
        "type": "paragraph",
        "text": "Result: 7 hours+ saved per week, 75% content validation rate by the client, 0 production failures."
      },
      {
        "type": "heading",
        "text": "Context"
      },
      {
        "type": "paragraph",
        "text": "ADN POTENTIEL had almost no SEO presence despite 2 years of existence in Lille. LinkedIn content production was irregular and time-consuming. Loïc Chevallard (manager) did not have time to carry out daily sector monitoring while managing his client missions."
      },
      {
        "type": "paragraph",
        "text": "The challenge: to build a “content machine” that operates 24 hours a day independently, respecting the voice, tone and positioning of ADN POTENTIEL — without Loïc having to start from scratch with each publication."
      },
      {
        "type": "heading",
        "text": "Issue"
      },
      {
        "type": "list",
        "items": [
          "No SEO presence despite 2 years of existence",
          "Manual, irregular and time-consuming content production (~7 hours/week)",
          "No sector monitoring system: editorial opportunities were missed",
          "Difficulty maintaining a consistent editorial line on LinkedIn",
          "Risk of duplicates and unread publications"
        ]
      },
      {
        "type": "heading",
        "text": "Solution"
      },
      {
        "type": "heading",
        "text": "Workflow A — Automated monitoring + AI qualification"
      },
      {
        "type": "list",
        "items": [
          "RSS feeds from specialized sources in construction, business transmission, management",
          "Autorun every 6 hours",
          "AI agent (Perplexity AI + OpenAI GPT-4 mini): categorization, impact score from 1 to 10, summary of the article, business opportunities identified",
          "Only articles with a score greater than 6 trigger content generation",
          "Complete storage in the Notion “ADN POTENTIEL Monitoring” database with all the metadata"
        ]
      },
      {
        "type": "heading",
        "text": "Workflow B — LinkedIn draft generation + Images"
      },
      {
        "type": "list",
        "items": [
          "Automatic generation of LinkedIn drafts (150-250 words) powered by ADN POTENTIEL context (tone, values, positioning, past examples)",
          "Library of formats to vary the style: key figure, feedback, open question, practical advice, case study...",
          "Generating images via Google Gemini from a library of visual styles",
          "Automatic image hosting on imgbb",
          "Storage in the “Contents & Publications” Notion database"
        ]
      },
      {
        "type": "heading",
        "text": "Workflow C — LinkedIn Auto-Publish"
      },
      {
        "type": "list",
        "items": [
          "Scan Notion every 5 minutes",
          "Triggered by clicking on a “Ready to Publish” checkbox: Loïc validates and publishes in one click",
          "Calling LinkedIn API v2 (OAuth2) for publishing with image",
          "Anti-duplicate mechanism: checking the history before each publication",
          "Automatic error alerts (expired token, API error, etc.)"
        ]
      },
      {
        "type": "heading",
        "text": "Hub Notion — Central control interface"
      },
      {
        "type": "paragraph",
        "text": "5 interconnected databases accessible from a single interface:"
      },
      {
        "type": "list",
        "items": [
          "ADN POTENTIEL Monitoring — Articles captured with score, summary, category and opportunities",
          "Content & Publications — Drafts generated and posts already published",
          "Publication templates — Templates to vary formats (enriched throughout the course)",
          "Image Templates — Visual Style Library for Generation",
          "Context ADN POTENTIEL — Reference documents that feed the AI ​​prompt (tone, values, positioning)"
        ]
      },
      {
        "type": "heading",
        "text": "Key results"
      },
      {
        "type": "list",
        "items": [
          "✅ 100% operational — system in stable production on a daily basis",
          "✅ 7 hours+ saved per week on monitoring and content creation",
          "✅ 75% validation rate of generated drafts (minor changes only)",
          "✅ 0 publication failures in production",
          "✅ ~50 articles captured and qualified in just a few days",
          "✅ ~12 high-impact articles identified (score > 7)",
          "✅ 100% effective anti-duplicate — no duplicate posts",
          "✅ Optimized API cost: ~5-10€/month for the entire system",
          "✅ Loïc uses the system actively on a daily basis"
        ]
      },
      {
        "type": "heading",
        "text": "Media"
      },
      {
        "type": "heading",
        "text": "Main features"
      },
      {
        "type": "list",
        "items": [
          "Multi-source RSS capture — Aggregation of feeds from construction, business transmission, management sources",
          "AI qualification — Impact score (1-10), automatic categorization, summary and identified business opportunities",
          "Smart filter — Only articles with score > 6 trigger content generation",
          "Contextual generation — Drafts are generated taking into account the tone, values ​​and positioning of ADN POTENTIEL",
          "Format Library — Rotate between different post styles to vary the LinkedIn feed",
          "AI Image Generation — Creating Custom Images via Google Gemini + Automatic Hosting imgbb",
          "One-click validation — Loïc validates and triggers publication from Notion (“Ready to Publish” checkbox)",
          "Anti-duplicate — Systematic verification before each publication",
          "Monitoring & alerts — Automatic notifications in the event of an API error or expired token"
        ]
      },
      {
        "type": "heading",
        "text": "Technical architecture"
      },
      {
        "type": "paragraph",
        "text": "Stack: n8n · Notion API · OpenAI GPT-4 mini · Perplexity AI · Google Gemini · LinkedIn API v2 · imgbb"
      },
      {
        "type": "paragraph",
        "text": "Overall data flow:"
      },
      {
        "type": "list",
        "items": [
          "RSS feed → n8n (every 6 hours) → AI qualification (Perplexity + OpenAI) → Impact score",
          "Articles score > 6 → LinkedIn draft generation (OpenAI) + Image (Gemini) → imgbb hosting → Notion storage",
          "Loïc checks “Ready to Publish” in Notion → n8n scan (every 5 min) → LinkedIn API v2 call",
          "Notion status update → Publication log → Anti-duplicate activated"
        ]
      },
      {
        "type": "paragraph",
        "text": "Managing OAuth2 LinkedIn authentication:"
      },
      {
        "type": "list",
        "items": [
          "Full OAuth2 authentication configured in n8n",
          "Automatic token refresh before expiration",
          "Documented and tested renewal procedure in case of manual expiration"
        ]
      },
      {
        "type": "heading",
        "text": "Quality & controls"
      },
      {
        "type": "list",
        "items": [
          "Double-level anti-duplicate: verification of the unique identifier of the article before generation, and verification of the content before publication",
          "Graceful error handling: if an API falls (Gemini, OpenAI...), the system continues with fallbacks — no complete interruption",
          "Monitoring: automatic alerts in the event of a publication error or expired token",
          "Human validation maintained: Loïc remains in control of each publication via the checkbox — 0 automatic publication without validation",
          "Archiving: each publication is logged in Notion with date, status and exact content"
        ]
      },
      {
        "type": "heading",
        "text": "Documentation delivered"
      },
      {
        "type": "list",
        "items": [
          "Complete video tutorial (~25-30 min): configuration of the 3 workflows, daily use of the Notion Hub",
          "LinkedIn OAuth2 Renewal Guide (illustrated step-by-step procedure)",
          "Maintenance guide: adding new RSS sources, modifying AI prompts, managing API costs",
          "Complete documentation of the prompts used (with explanations of editorial choices)"
        ]
      }
    ]
  },
  "enrichissement-prospects-btp": {
    "title": "Automated enrichment of the construction prospect base",
    "shortDescription": "n8n workflow connected to the Pappers API to automatically enrich 15,000+ construction prospects with the age of managers and activate micro-segmentation by age group.",
    "fullDescription": "Fully automated n8n workflow that enriches a database of 15,000+ BTP prospects with the age and date of birth of managers via the Pappers API. Objective: transform “blind” prospecting into precise targeting by age group (60-65 / 65-70 / 70+) to adapt the commercial discourse according to the maturity of the transmission project.",
    "category": "Automation",
    "tags": [
      "n8n",
      "Papers API",
      "Google Sheets",
      "Prospecting",
      "Construction"
    ],
    "company": "ADN POTENTIEL",
    "problem": "Base of 15,000+ prospects without information on the age of managers. Blind prospecting: impossible to prioritize or segment. Manual enrichment impossible on this scale.",
    "solution": "n8n workflow connected to the Pappers API to automatically retrieve the date of birth, calculated age, “senior” status (60+ years) and age range of each manager.",
    "impact": [
      "85.7% completion — operational workflow in production",
      "Automatic processing of 15,000+ leads in batches",
      "Micro-segmentation activated on 3 age groups",
      "Marginal cost: a few euros of API credits"
    ],
    "challenges": [
      "Graceful handling of missing data (date of birth not available in Pappers)",
      "Batch processing for 15,000+ rows without saturating the API",
      "Compliance with API rate limits"
    ],
    "learnings": [
      "Robust workflow design with graceful error handling",
      "Strategic value of micro-segmentation",
      "Paging and bulk processing via API"
    ],
    "technologies": [
      {
        "name": "n8n",
        "usage": "Workflow orchestration"
      },
      {
        "name": "API Pappers",
        "usage": "Legal data and managers"
      },
      {
        "name": "Google Sheets API",
        "usage": "Reading and writing enriched data"
      }
    ],
    "media": [
      {
        "url": "/projects/enrichissement-btp-workflow-n8n.png",
        "caption": "n8n Workflow — Complete Pappers + Gemini Email Enrichment"
      },
      {
        "url": "/projects/enrichissement-btp-google-sheet-avant.png",
        "caption": "Google Sheet — prospect database before enrichment"
      },
      {
        "url": "/projects/enrichissement-btp-google-sheet-apres.png",
        "caption": "Google Sheet — prospect database after enrichment (age, date of birth)"
      }
    ],
    "content": [
      {
        "type": "heading",
        "text": "Overview"
      },
      {
        "type": "paragraph",
        "text": "Fully automated n8n workflow that enriches a database of 15,000+ BTP prospects with the age and date of birth of managers via the Pappers API. The objective: to transform “blind” prospecting into precise targeting, making it possible to prioritize managers aged 60 and over — main target of ADN POTENTIEL for its business transfer training."
      },
      {
        "type": "heading",
        "text": "Context"
      },
      {
        "type": "paragraph",
        "text": "ADN POTENTIEL specializes in the construction sector and targets VSE/SME managers aged 60 and over, often faced with issues of business transfer or sale — a key moment when training in transition management takes on its full meaning."
      },
      {
        "type": "paragraph",
        "text": "The concrete problem: the company had a file of 15,000+ construction prospects (names, companies, contact details) but without any information on the age of the managers. It is therefore impossible to prioritize, segment, or adapt the commercial discourse."
      },
      {
        "type": "paragraph",
        "text": "The strategic challenge: activate micro-segmentation by age group:"
      },
      {
        "type": "list",
        "items": [
          "60-65 years → Reflection phase (educational content, awareness)",
          "65-70 years → Decision phase (direct offer, concrete cases)",
          "70+ years → Urgent transmission (personalized and reactive approach)"
        ]
      },
      {
        "type": "heading",
        "text": "Issue"
      },
      {
        "type": "list",
        "items": [
          "Base of 15,000+ prospects without information on the age of managers",
          "Blind prospecting: impossible to prioritize or segment",
          "Manual enrichment impossible on this scale",
          "Sales time wasted on unqualified contacts",
          "No differentiated targeting according to the maturity of the transmission project"
        ]
      },
      {
        "type": "heading",
        "text": "Solution"
      },
      {
        "type": "paragraph",
        "text": "Design of an n8n workflow connected to the Pappers API (French legal and financial database) to automatically retrieve, for each prospect:"
      },
      {
        "type": "list",
        "items": [
          "The director’s date of birth (when available)",
          "His age calculated automatically",
          "Their “senior” status (60+ years: yes/no)",
          "Its age group (60-65 / 65-70 / 70+)"
        ]
      },
      {
        "type": "paragraph",
        "text": "Enriched data is written directly to Google Sheets for immediate use by the sales team."
      },
      {
        "type": "heading",
        "text": "Key results"
      },
      {
        "type": "list",
        "items": [
          "✅ 85.7% completion — operational workflow in production",
          "✅ Automatic processing of 15,000+ leads in batches",
          "✅ Micro-segmentation activated on 3 age groups",
          "✅ Complete video tutorial (~15-20 min) provided for total autonomy",
          "✅ Complete technical documentation (configuration, troubleshooting, maintenance)",
          "✅ Marginal cost: a few euros of API credits for the entire file"
        ]
      },
      {
        "type": "heading",
        "text": "Media"
      },
      {
        "type": "heading",
        "text": "Main features"
      },
      {
        "type": "list",
        "items": [
          "Reading prospects — Import from Google Sheets (15,000+ rows), batch processing to respect API limits",
          "Pappers query — Automatic call by SIREN or company name to identify the manager",
          "Extraction of the manager — Recovery of last name, first name, date of birth, calculated age",
          "Senior status calculation — Automatic flag if age ≥ 60 years",
          "Segmentation by bracket — Automatic ranking: 60-65 / 65-70 / 70+",
          "Writing results — Real-time updating of rich columns in Google Sheets",
          "Graceful error handling — The workflow continues if data is missing (date of birth not available in Pappers) without interrupting processing",
          "Pagination — Batch mechanism for all 15,000+ rows without saturating the API"
        ]
      },
      {
        "type": "heading",
        "text": "Technical architecture"
      },
      {
        "type": "paragraph",
        "text": "Stack: n8n · Pappers API · Google Sheets API"
      },
      {
        "type": "paragraph",
        "text": "Data flow:"
      },
      {
        "type": "list",
        "items": [
          "Manual (or scheduled) trigger → Reading the Google Sheets file",
          "Loop on each prospect → Pappers API call (search by SIREN)",
          "Extraction of manager data → Age calculation + segmentation",
          "Data verification (consistency, missing values) → Free processing",
          "Writing enriched columns → Google Sheets update",
          "End of processing → Execution report (prospects processed / not found)"
        ]
      },
      {
        "type": "heading",
        "text": "Quality & controls"
      },
      {
        "type": "list",
        "items": [
          "API error management: timeout, missing data, rate limiting — the workflow continues without blocking",
          "Log of non-enriched: prospects without date of birth are flagged for manual review",
          "Data consistency: checking the plausibility of age before writing",
          "Anti-duplication: an already enriched prospect is not reprocessed unnecessarily"
        ]
      },
      {
        "type": "heading",
        "text": "Documentation delivered"
      },
      {
        "type": "list",
        "items": [
          "Complete video tutorial: workflow configuration, daily use, updating credentials",
          "Troubleshooting Guide: Common API Errors, Managing Pappers Rate Limiting",
          "Maintenance notice: renewal of API keys, addition of additional fields"
        ]
      }
    ]
  },
  "automatisation-rappels-sms-greminders": {
    "title": "Automating SMS Reminders — Greminders",
    "shortDescription": "Implementation of Greminders to automatically send SMS and email reminders to prospects before their meetings with ADN POTENTIEL, reducing the no-show rate without any technical development.",
    "fullDescription": "Configuration of Greminders connected to ADN POTENTIEL's Google Calendar to automate appointment reminders. D-1 (SMS + email) and H-1 (SMS) reminder with personalized messages, integrated confirmation/cancellation link, and automatic notification in case of cancellation.",
    "category": "Automation",
    "tags": [
      "Greminders",
      "Google Calendar",
      "No-code",
      "SMS",
      "Automation"
    ],
    "company": "ADN POTENTIEL",
    "problem": "Significant no-show rate for qualified appointments. Time-consuming manual reminders (calls or text messages sent by hand). Waste of time and credibility on slots not honored.",
    "solution": "Greminders configuration (SaaS no-code) connected to Google Calendar via OAuth2: SMS reminders + email D-1 and H-1, personalized messages, confirmation/cancellation link.",
    "impact": [
      "Fully automated SMS/email reminders (0 manual action required)",
      "Personalized messages with prospect name and context of the appointment",
      "Confirmation/cancellation link integrated into each reminder",
      "Automatic notification in case of cancellation",
      "Quick implementation without development"
    ],
    "challenges": [
      "Writing SMS templates adapted to the professional tone of ADN POTENTIEL",
      "Configuring optimal deadlines to maximize the attendance rate"
    ],
    "learnings": [
      "Value of no-code tools for quick wins without development",
      "Importance of personalization in automated communications"
    ],
    "technologies": [
      {
        "name": "Greminders",
        "usage": "SaaS platform for automatic reminders"
      },
      {
        "name": "Google Calendar",
        "usage": "OAuth2 integration for automatic triggering"
      }
    ],
    "media": [
      {
        "url": "/projects/greminders-interface-site.png",
        "caption": "GReminders interface — SaaS platform for automatic reminders"
      },
      {
        "url": "/projects/greminders-rappel-sms.png",
        "caption": "Example of SMS reminder received by a prospect — 02/22/2026"
      }
    ],
    "content": [
      {
        "type": "heading",
        "text": "Overview"
      },
      {
        "type": "paragraph",
        "text": "Implementation of Greminders to automate the sending of SMS and email reminders to prospects and customers before their meetings with ADN POTENTIEL. Objective: reduce the no-show rate on qualified appointments, without any technical development — entirely controlled from a no-code interface connected to Google Calendar."
      },
      {
        "type": "heading",
        "text": "Context"
      },
      {
        "type": "paragraph",
        "text": "As part of the internship, ADN POTENTIEL generated qualified appointments via enriched construction prospecting. The problem: a certain rate of no-shows represented a direct loss of income – lost preparation time, non-recoverable slot, weakened commercial relationship."
      },
      {
        "type": "paragraph",
        "text": "Greminders is a no-code SaaS tool that integrates directly with the Google calendar (via OAuth2) and automatically sends personalized reminders — SMS, email or WhatsApp — to the participants of an appointment, at configurable deadlines."
      },
      {
        "type": "heading",
        "text": "Issue"
      },
      {
        "type": "list",
        "items": [
          "Significant no-show rate for qualified appointments",
          "Time-consuming manual reminders for Loïc (calls or SMS sent by hand)",
          "No automatic restart in case of absence of confirmation",
          "Waste of time and credibility on unfulfilled slots"
        ]
      },
      {
        "type": "heading",
        "text": "Solution"
      },
      {
        "type": "paragraph",
        "text": "Configuration of Greminders connected to ADN POTENTIEL's Google Calendar:"
      },
      {
        "type": "list",
        "items": [
          "Automatic reminder D-1: SMS + email sent 24 hours before the appointment",
          "H-1 automatic reminder: SMS sent 1 hour before",
          "Personalized messages: texts adapted to the context ADN POTENTIEL — professional tone, prospect name included dynamically",
          "Confirmation/cancellation link: the prospect can confirm or cancel directly from the SMS, in one click",
          "Automatic notification to Loïc if a prospect cancels via the link"
        ]
      },
      {
        "type": "heading",
        "text": "Key results"
      },
      {
        "type": "list",
        "items": [
          "✅ Fully automated SMS/email reminders (0 manual action required from Loïc)",
          "✅ Personalized messages with prospect name and context of the appointment",
          "✅ Confirmation/cancellation link integrated into each reminder",
          "✅ Automatic notification to Loïc in the event of cancellation",
          "✅ Quick setup without development"
        ]
      },
      {
        "type": "heading",
        "text": "Media"
      },
      {
        "type": "heading",
        "text": "Configured Features"
      },
      {
        "type": "list",
        "items": [
          "Google Calendar integration — OAuth2 connection: each new appointment created in the POTENTIEL DNA calendar automatically triggers the reminder sequence",
          "D-1 reminder (SMS + email) — Sent 24 hours before, with prospect name, date, time and context of the appointment",
          "H-1 reminder (SMS) — Last reminder 1 hour before to maximize attendance",
          "Confirmation/cancellation — Link integrated into the SMS allowing the prospect to respond in one click",
          "Personalized messages — Templates written with the ADN POTENTIEL tone, dynamic variables (first name, date, time, location/visio)",
          "Cancellation notification — Loïc is automatically alerted if a prospect cancels, to recover the slot"
        ]
      },
      {
        "type": "heading",
        "text": "Configuration set up"
      },
      {
        "type": "heading",
        "text": "Quality & controls"
      },
      {
        "type": "list",
        "items": [
          "No reminder sent if appointment is canceled in Google Calendar",
          "Verification of the telephone number before sending (FR format)",
          "Logs of shipments accessible in Greminders (status: sent / delivered / failure)",
          "Documented procedure for modifying message templates"
        ]
      },
      {
        "type": "heading",
        "text": "Documentation delivered"
      },
      {
        "type": "list",
        "items": [
          "Greminders Getting Started Guide (Google Calendar connection, creating reminder workflows)",
          "SMS/email templates used and modification procedure",
          "Maintenance guide: adding new appointment types, managing Greminders billing"
        ]
      }
    ]
  },
  "veille-ia-automatisee-n8n": {
    "title": "Automated AI monitoring — Workflow n8n",
    "shortDescription": "Automated n8n workflow that generates a comprehensive AI intelligence report daily via Perplexity Deep Research and Grok, sent by email.",
    "fullDescription": "Personal n8n workflow planned at 7 a.m. which orchestrates multi-source AI monitoring: Perplexity Sonar Deep Research (web) + xAI Grok 3 (X/Twitter), structured by fixed sections (Robotics, Large companies, Startups, API Prices), converted into stylish HTML and sent by Gmail.",
    "category": "Automation",
    "tags": [
      "n8n",
      "Perplexity AI",
      "Grok",
      "OpenAI",
      "Gmail",
      "Day before"
    ],
    "company": "Personal",
    "problem": "Too many ads and unframed sources to prioritize. Time wasted compiling and reformatting. No automatic daily summary.",
    "solution": "n8n workflow scheduled at 7am with AI agent (GPT-4o-mini) orchestrating Perplexity (web) + Grok (X/Twitter), Markdown → HTML conversion, Gmail sending.",
    "impact": [
      "Daily monitoring in 0 minutes of effort",
      "Structured and comparable report day after day",
      "Multi-source view: web + social networks + API price comparison table",
      "Reading the report in < 10 minutes"
    ],
    "challenges": [
      "Reduce noise while keeping signals relevant",
      "Structuring the results into fixed sections comparable each day",
      "Markdown conversion → Clean, mobile-readable HTML"
    ],
    "learnings": [
      "Designing orchestrator AI agents with n8n",
      "Iteration on prompts for signal-to-noise ratio",
      "Value of stable formats for comparison over time"
    ],
    "technologies": [
      {
        "name": "n8n",
        "usage": "Workflow orchestration"
      },
      {
        "name": "OpenAI GPT-4o-mini",
        "usage": "Orchestrating agent and structuring of the report"
      },
      {
        "name": "Perplexity AI",
        "usage": "Web search (Sonar Deep Research)"
      },
      {
        "name": "xAI Grok 3",
        "usage": "X/Twitter monitoring (24h)"
      },
      {
        "name": "Gmail API",
        "usage": "Sending the HTML report"
      }
    ],
    "media": [
      {
        "url": "/projects/veille-ia-n8n-workflow.png",
        "caption": "n8n workflow — overview"
      },
      {
        "url": "/projects/veille-ia-gmail-rapport.png",
        "caption": "Example of HTML report received by email"
      }
    ],
    "content": [
      {
        "type": "heading",
        "text": "Overview"
      },
      {
        "type": "paragraph",
        "text": "n8n workflow that I designed to automate my AI monitoring. Every morning, an agent orchestrates multi-source research, generates a structured report, formats it in HTML and sends it to me by email. The idea: stay up to date without spending 1 to 2 hours a day."
      },
      {
        "type": "heading",
        "text": "Context"
      },
      {
        "type": "paragraph",
        "text": "I started from a very personal need. Every day, I wanted to follow AI seriously, but I found myself opening ten tabs, scrolling through X/Twitter, Reddit and blogs, then wasting 45 to 90 minutes to, in the end, only have a fragmented vision. The feeling of “missing something” was constant. I needed a safeguard: a daily, reliable meeting that filters out the noise and highlights the essentials."
      },
      {
        "type": "paragraph",
        "text": "What I was experiencing concretely before this workflow:"
      },
      {
        "type": "list",
        "items": [
          "I opened Perplexity, X/Twitter, a few newsletters, and made a mental collage.",
          "I didn't really classify the information. The next day, it is impossible to compare or measure a trend.",
          "With API prices changing quickly, I never had an up-to-date table to decide what to test."
        ]
      },
      {
        "type": "paragraph",
        "text": "What I wanted to get instead:"
      },
      {
        "type": "list",
        "items": [
          "A report that arrives by itself at 7 a.m., while I have my coffee.",
          "Fixed sections to anchor the benchmarks: Robotics, Large companies, Startups, API prices.",
          "Crossed web + social sources to avoid the blind spot.",
          "A clean HTML format, readable on mobile, archiveable in my mailbox."
        ]
      },
      {
        "type": "paragraph",
        "text": "Why I chose n8n and an AI agent:"
      },
      {
        "type": "list",
        "items": [
          "n8n allows me to visually iterate and easily plug in Perplexity and Grok.",
          "An AI agent (GPT‑4o‑mini) can orchestrate monitoring, prioritize and reformulate so that the report is synthetic but actionable.",
          "The Code node helps me transform well-structured Markdown into stylish HTML before sending to Gmail."
        ]
      },
      {
        "type": "paragraph",
        "text": "My criteria for success (simple and measurable):"
      },
      {
        "type": "list",
        "items": [
          "Daily effort time: 0 minutes. Everything is push.",
          "Reading rate: I read the report in < 10 minutes, every day.",
          "Signal > noise: at least 3 really useful items per day, not a raw list of links."
        ]
      },
      {
        "type": "paragraph",
        "text": "In practice, I iterated on the prompts, reduced the number of Perplexity results, framed the X accounts and imposed a stable structure. Today I received a report that allows me to quickly decide what to dig, without drowning or spending my morning."
      },
      {
        "type": "list",
        "items": [
          "Too many ads and sources, no framework to prioritize",
          "Time wasted compiling, reformatting, classifying by theme",
          "No daily summary received automatically"
        ]
      },
      {
        "type": "heading",
        "text": "Solution"
      },
      {
        "type": "list",
        "items": [
          "An n8n workflow scheduled at 7 a.m. which:"
        ]
      },
      {
        "type": "heading",
        "text": "Key results"
      },
      {
        "type": "list",
        "items": [
          "Daily monitoring in 0 minutes of effort",
          "Structured and comparable report day after day",
          "Multi‑source view: web + social networks + API price comparison table"
        ]
      },
      {
        "type": "heading",
        "text": "Media"
      },
      {
        "type": "heading",
        "text": "Demo video"
      },
      {
        "type": "heading",
        "text": "Screenshots"
      },
      {
        "type": "list",
        "items": [
          "n8n Workflow Overview"
        ]
      },
      {
        "type": "list",
        "items": [
          "Received HTML report extract"
        ]
      },
      {
        "type": "heading",
        "text": "Technical architecture"
      },
      {
        "type": "heading",
        "text": "Workflow diagram"
      },
      {
        "type": "code",
        "text": "Schedule (7:00)\n  → AI Agent (GPT‑4o‑mini)\n     ├─ Perplexity Deep Research (7 days, max 20)\n     ├─ Grok X Search (X, 24h, targeted accounts)\n     └─ Aggregation and structuring by themes\n  → Code (JS) Markdown → HTML\n  → Gmail (formatted sending)"
      },
      {
        "type": "heading",
        "text": "Stack"
      },
      {
        "type": "list",
        "items": [
          "Orchestration: n8n",
          "AI Agent: OpenAI GPT‑4o‑mini",
          "Web search: Perplexity Sonar Deep Research",
          "Social Search: xAI Grok 3 Latest (Twitter/X)",
          "Email: Gmail API (OAuth2)",
          "Transformation: JavaScript (Code node)"
        ]
      },
      {
        "type": "heading",
        "text": "n8n master nodes"
      },
      {
        "type": "paragraph",
        "text": "1) Schedule Trigger — Daily execution 7h"
      },
      {
        "type": "paragraph",
        "text": "2) AI Agent — Orchestration, choice of tools and structure"
      },
      {
        "type": "paragraph",
        "text": "3) HTTP Request Tool — Perplexity (web, 7 days, 20 results)"
      },
      {
        "type": "paragraph",
        "text": "4) HTTP Request Tool — Grok"
      },
      {
        "type": "paragraph",
        "text": "5) Code (JS) — Markdown conversion → HTML + styles"
      },
      {
        "type": "paragraph",
        "text": "6) Gmail — Sending HTML report"
      },
      {
        "type": "heading",
        "text": "Report topics"
      },
      {
        "type": "list",
        "items": [
          "AI and Robotics",
          "Big AI Companies",
          "Startups and ecosystem",
          "API Price Comparison Table"
        ]
      },
      {
        "type": "paragraph",
        "text": "Each contains key points with sources and dates to quickly locate the announcements."
      },
      {
        "type": "heading",
        "text": "Quick installation"
      },
      {
        "type": "paragraph",
        "text": "Prerequisites:"
      },
      {
        "type": "list",
        "items": [
          "n8n (Cloud or self-hosted)",
          "API keys: OpenAI, Perplexity, xAI (Grok)",
          "OAuth2 Gmail configured"
        ]
      },
      {
        "type": "paragraph",
        "text": "Steps:"
      },
      {
        "type": "paragraph",
        "text": "1) Import the AI.json file into n8n"
      },
      {
        "type": "paragraph",
        "text": "2) Enter the credentials on each node (OpenAI, Perplexity, xAI, Gmail)"
      },
      {
        "type": "paragraph",
        "text": "3) Personalize the Gmail recipient and, if necessary, the Schedule time"
      },
      {
        "type": "paragraph",
        "text": "4) Enable workflow"
      },
      {
        "type": "heading",
        "text": "Use"
      },
      {
        "type": "list",
        "items": [
          "Auto: report arrives every day at 7am",
          "Manual: \"Execute Workflow\" button in n8n for testing on demand"
        ]
      },
      {
        "type": "heading",
        "text": "Report format"
      },
      {
        "type": "list",
        "items": [
          "Structured Markdown rendered in HTML",
          "Source links and fixed sections for daily comparison",
          "API price table by model type with order and rating"
        ]
      },
      {
        "type": "heading",
        "text": "Advanced configuration"
      },
      {
        "type": "list",
        "items": [
          "Tracked X accounts: edit list of handles in Grok node",
          "Perplexity time window: adjust from_date/to_date and max_results",
          "Execution time: modify the Schedule Trigger config",
          "Agent Prompt: Adapt themes, tone and formatting"
        ]
      },
      {
        "type": "heading",
        "text": "Troubleshooting and costs"
      },
      {
        "type": "list",
        "items": [
          "Verify that the workflow is active and that the credentials are valid",
          "n8n logs to diagnose API calls",
          "Estimated cost per day: $0.08 – $0.17 depending on volume; monthly: $2.40 – $5.10"
        ]
      },
      {
        "type": "heading",
        "text": "Roadmap"
      },
      {
        "type": "list",
        "items": [
          "Report storage and historical dashboard",
          "Custom filters and PDF export",
          "Slack/Discord notifications",
          "Addition of other sources (Reddit, HN, LinkedIn) and multilingual"
        ]
      },
      {
        "type": "heading",
        "text": "Credits"
      },
      {
        "type": "paragraph",
        "text": "© 2025 — Automated AI monitoring — Workflow n8n"
      }
    ]
  },
  "excel-vba-automatisation-relances": {
    "title": "Automation of customer reminders — Python/FastAPI + React",
    "shortDescription": "Customer follow-up automation suite for BIGOT Matériaux: processing of AS/400 data via FastAPI/Pandas backend and generation of formatted Excel, with React interface for upload and metrics.",
    "fullDescription": "FastAPI + Pandas backend which parses, normalizes, aggregates and automatically generates a formatted Excel from raw data from AS/400. Lightweight React frontend to upload files, view metrics (Chart.js) and download results. Replaces an hours-long manual process with processing in seconds.",
    "category": "Automation",
    "tags": [
      "Python",
      "FastAPI",
      "Pandas",
      "React",
      "Excel",
      "OpenPyXL"
    ],
    "company": "BIGOT Matériaux",
    "problem": "Heterogeneous raw data from AS/400. Very time-consuming and error-prone manual sorting and formatting. No summary view to manage reminders by seller, level and period.",
    "solution": "FastAPI backend which parses, normalizes and aggregates data (Pandas), generates a formatted Excel (OpenPyXL). Lightweight React frontend for upload, metrics and download.",
    "impact": [
      "Reminder preparation time divided by approximately 4",
      "Standardization of files sent and better traceability",
      "Immediate view by seller and by reminder level",
      "Automatic detection of duplicates on multi-field key"
    ],
    "challenges": [
      "Heterogeneous raw data from AS/400 with various formats",
      "Robust validation: date formats, amounts, multi-field duplicates",
      "Interface accessible to non-technical people"
    ],
    "learnings": [
      "Decoupled backend/frontend architecture",
      "Importance of Input Data Validation",
      "End-user (non-technical) oriented design"
    ],
    "technologies": [
      {
        "name": "Python / FastAPI",
        "usage": "Backend and processing API"
      },
      {
        "name": "Pandas",
        "usage": "Data analysis, normalization and aggregation"
      },
      {
        "name": "OpenPyXL",
        "usage": "Generating formatted Excel"
      },
      {
        "name": "React 18",
        "usage": "Upload interface and dashboard"
      },
      {
        "name": "Chart.js",
        "usage": "Viewing Metrics"
      }
    ],
    "media": [
      {
        "url": "/projects/relances-interface.png",
        "caption": "Upload interface and metrics"
      }
    ],
    "content": [
      {
        "type": "heading",
        "text": "Overview"
      },
      {
        "type": "paragraph",
        "text": "Customer follow-up automation suite that I designed for BIGOT Matériaux. I combined robust data processing (Python/FastAPI + Pandas + OpenPyXL) and a simple analysis interface (React + Chart.js) to go from time-consuming manual Excel to a fast, reliable and standardized workflow."
      },
      {
        "type": "heading",
        "text": "Context"
      },
      {
        "type": "paragraph",
        "text": "I started from a very concrete situation at BIGOT Matériaux. In the summer of 2025, I saw my father spending hours preparing for customer follow-ups: extracting raw data from the AS/400, opening Excel, sorting by customer then by month, recalculating the totals, spotting duplicates by hand... At the end of the day, we had a usable file, but the road to get there was long, fragile and frankly painful."
      },
      {
        "type": "paragraph",
        "text": "I wanted to keep Excel as an output, because it is the team's familiar tool and it fits well into daily life (printing, sharing, quick annotations). On the other hand, I wanted to remove everything that relates to “mechanical work”. My idea: automate the preparation of data upstream, so that human time is devoted to the decision (who to follow up? with what message? on what date?) rather than to formatting."
      },
      {
        "type": "paragraph",
        "text": "Concretely, I listed what was wasting my time the most:"
      },
      {
        "type": "list",
        "items": [
          "sorting by customer and by period, with error-prone copy and paste",
          "the consistency of the totals, which had to be rechecked at each iteration",
          "hunting for duplicates, on several columns, never pleasant to do by hand",
          "the layout, to deliver a file ready to print and always in the same format"
        ]
      },
      {
        "type": "paragraph",
        "text": "From there, I designed a small backend service (FastAPI + Pandas) to do all the “dirty work”: parse, normalize, aggregate, control. And I added a lightweight React UI that allows me to upload a file, instantly see the useful metrics (total amount, follow-up customers, breakdown by seller/level), then download a clean and standardized Excel. My goal is simple: keep the simplicity of Excel at the end of the chain, while making the preparation so quick and reliable that I no longer have to think about it."
      },
      {
        "type": "heading",
        "text": "Issue"
      },
      {
        "type": "list",
        "items": [
          "Heterogeneous raw data from AS/400, difficult to use",
          "Very time-consuming and error-prone manual sorting and formatting",
          "No summary view to manage reminders (seller, level, period)"
        ]
      },
      {
        "type": "heading",
        "text": "Solution"
      },
      {
        "type": "list",
        "items": [
          "A FastAPI backend that parses, normalizes and aggregates data (Pandas), then generates a formatted Excel (OpenPyXL)",
          "A lightweight React frontend to upload files, view metrics and download results",
          "Validation and control rules: minimum columns, date formats, duplicates on multi-field key"
        ]
      },
      {
        "type": "heading",
        "text": "Key results"
      },
      {
        "type": "list",
        "items": [
          "Reminder preparation time divided by approximately 4",
          "Standardization of files sent and better traceability",
          "Immediate view by seller and by reminder level"
        ]
      },
      {
        "type": "heading",
        "text": "Media"
      },
      {
        "type": "heading",
        "text": "Screen gallery"
      },
      {
        "type": "list",
        "items": [
          "Upload interface and metrics"
        ]
      },
      {
        "type": "list",
        "items": [
          "Excel generated (customer groups/names and customer/month)"
        ]
      },
      {
        "type": "heading",
        "text": "Main features"
      },
      {
        "type": "list",
        "items": [
          "Data processing",
          "Excel generation ready for printing",
          "Analysis and management"
        ]
      },
      {
        "type": "heading",
        "text": "Technical architecture"
      },
      {
        "type": "list",
        "items": [
          "Backend: FastAPI, Uvicorn, Pandas, Pydantic, python‑multipart, OpenPyXL",
          "Frontend: React 18, Bootstrap 5, Chart.js (+ react‑chartjs‑2), Axios"
        ]
      },
      {
        "type": "paragraph",
        "text": "Simplified tree structure:"
      },
      {
        "type": "code",
        "text": "Automation of customer reminders/\n├── backend/ # FastAPI + Pandas + OpenPyXL\n│ ├── main.py # Endpoints API\n│ ├── data_processor.py # Parsing/validation/aggregation\n│ └── requirements.txt # Python dependencies\n├── frontend/ # React + Chart.js + Bootstrap\n│ ├── public/\n│ └── src/\n│ ├── components/\n│ │ ├── DataUploader.js\n│ │ └── Dashboard.js\n│ ├── App.js\n│ └── index.js\n├── Other/ # Alternative interfaces/scripts\n│ ├── index.html # Static HTML (fast processing)\n│ └── process_excel*.py\n├── index 2.html # Standalone version\n├── process_excel.py # Standalone Python script\n└── run_project.bat # Autostart (Windows)"
      },
      {
        "type": "heading",
        "text": "Flow"
      },
      {
        "type": "list",
        "items": [
          "Upload file → FastAPI API → parsing/validation → aggregation → formatted Excel → upload",
          "Dashboard → Real-time KPIs → graphs by seller/level"
        ]
      },
      {
        "type": "heading",
        "text": "Endpoints (excerpt)"
      },
      {
        "type": "list",
        "items": [
          "POST /process: CSV in form‑data → Formatted Excel",
          "POST /api/process: Fixed-width upload → processing → Excel",
          "GET /api/download-csv: CSV export of processed data",
          "GET /docs and /redoc: interactive documentation"
        ]
      },
      {
        "type": "heading",
        "text": "Quick use"
      },
      {
        "type": "paragraph",
        "text": "1) Start the backend on port 8000, then the frontend on 3000"
      },
      {
        "type": "paragraph",
        "text": "2) Upload the reminder CSV/Excel file"
      },
      {
        "type": "paragraph",
        "text": "3) Check metrics and charts"
      },
      {
        "type": "paragraph",
        "text": "4) Download the formatted Excel and send reminders"
      },
      {
        "type": "heading",
        "text": "Installation (summary)"
      },
      {
        "type": "list",
        "items": [
          "Prerequisites: Python 3.7+, Node.js 14+, pip",
          "Windows automatic script: run_project.bat",
          "Manual:"
        ]
      },
      {
        "type": "heading",
        "text": "Quality and controls"
      },
      {
        "type": "list",
        "items": [
          "Checking date formats and amounts",
          "Control of totals by customer and consistency vs. summary",
          "Duplicate highlighting and targeted manual review"
        ]
      },
      {
        "type": "heading",
        "text": "Roadmap"
      },
      {
        "type": "list",
        "items": [
          "v2.0: Postgres persistence, authentication, history, notifications",
          "v2.1: Advanced filters, PDF export, API tokens, detailed logs, tests ≥ 80%"
        ]
      },
      {
        "type": "heading",
        "text": "Credits"
      },
      {
        "type": "paragraph",
        "text": "© 2025 — Automation of customer reminders — BIGOT Matériaux"
      }
    ]
  },
  "as400-beta-2-automatisation-comptable": {
    "title": "Accounting application v1 — Look & Feel AS/400",
    "shortDescription": "Web application that reproduces the key functions of AS/400 and automates recurring entries to reduce entry time.",
    "fullDescription": "Modern accounting application inspired by AS/400 ergonomics, developed for the Touquet Athletic Club (TAC). Terminal-style keyboard navigation (black background, green text), double entry entry with validations, OCR bank import, generation of legal reports (FEC, Balance, General Ledger, VAT), and AI assistant (Claude) for analysis and detection of anomalies.",
    "category": "Development",
    "tags": [
      "React",
      "TypeScript",
      "Node.js",
      "Claude API",
      "Supabase",
      "OCR"
    ],
    "company": "TAC Hockey Club",
    "problem": "Manual and redundant entry from PDF. Interfaces that are not very accessible and not very error tolerant. Difficulty quickly producing compliant reports (FEC, Balance, VAT).",
    "solution": "AS/400 look & feel interface (black background, green text, keyboard navigation) + double entry entry + OCR import + one-click legal reports + Claude AI assistant.",
    "impact": [
      "Approximately 60% input time saved on recurring periods",
      "Reduce errors with validations and assistive AI",
      "Better accessibility for non-expert users"
    ],
    "challenges": [
      "Reproduce AS/400 ergonomics while modernizing the UX",
      "Integration of an AI assistant that analyzes without inventing entries",
      "Legal compliance of generated reports (FEC)"
    ],
    "learnings": [
      "Modern TypeScript full-stack architecture",
      "Integrating AI into critical business applications",
      "Importance of familiar usability for adoption"
    ],
    "technologies": [
      {
        "name": "React 18 + TypeScript",
        "usage": "Frontend"
      },
      {
        "name": "Vite + Tailwind CSS",
        "usage": "Build and styles"
      },
      {
        "name": "Node.js / Express",
        "usage": "API Backend"
      },
      {
        "name": "Claude (Anthropic SDK)",
        "usage": "Built-in AI assistant"
      },
      {
        "name": "Supabase / PostgreSQL",
        "usage": "Database and auth"
      }
    ],
    "media": [],
    "content": [
      {
        "type": "heading",
        "text": "Overview"
      },
      {
        "type": "paragraph",
        "text": "Modern accounting application, inspired by AS/400 ergonomics, developed for the Touquet Athletic Club (TAC). It takes familiar keyboard usage while adding automation, legal compliance and AI analytics."
      },
      {
        "type": "heading",
        "text": "Context"
      },
      {
        "type": "paragraph",
        "text": "In the summer of 2025, I helped my father keep the accounts at Touquet Athletic Club (TAC). Historically, everything was done on old AS/400 type software. I spent hours re-entering transactions from PDF bank statements, with very repetitive entries from one month to the next. I quickly noticed three things:"
      },
      {
        "type": "list",
        "items": [
          "A lot of time wasted on mechanical entry and little added value",
          "Risk of errors (copy and paste, Debit/Credit reversals, poorly chosen accounts)",
          "Effective keyboard ergonomics but not easily accessible for other people in the team"
        ]
      },
      {
        "type": "paragraph",
        "text": "My objective was to keep what works for us – quick AS/400-style keyboard navigation – while modernizing the rest: automate recurring entries, import bank statements in PDF format, secure the data and generate legal reports in one click (FEC, Balance, General Ledger, VAT). To speed up the checks, I also added an AI assistant which explains, alerts and suggests corrections."
      },
      {
        "type": "paragraph",
        "text": "I therefore designed and developed an “AS/400 look & feel” web application which uses our reflexes (black background, green text, option numbering, input validation) but is based on a modern architecture (React/TypeScript, Node/Express API, Supabase/PostgreSQL, Claude AI service). The idea: to significantly reduce the time spent on routine maintenance and make the production of reports more reliable, while remaining immediately usable by someone accustomed to AS/400."
      },
      {
        "type": "heading",
        "text": "Issue"
      },
      {
        "type": "list",
        "items": [
          "Manual and redundant entry of entries from PDF.",
          "Interfaces that are not very accessible and not very error tolerant.",
          "Difficulty quickly producing compliant reports (FEC, Balance, General Ledger, VAT).",
          "Waste of time for a person already busy with other responsibilities."
        ]
      },
      {
        "type": "heading",
        "text": "Solution"
      },
      {
        "type": "list",
        "items": [
          "AS/400 “look & feel” interface: black background, green text, keyboard navigation, option numbers.",
          "Double entry entry with validations and automatic matching.",
          "Automation of recurring entries and OCR bank import.",
          "Generation of legal reports in one click: FEC, Balance, General Ledger, VAT.",
          "AI assistant (Claude) to analyze, explain and detect anomalies.",
          "Secure multi‑user (Supabase Auth + RLS) to separate companies."
        ]
      },
      {
        "type": "heading",
        "text": "Key results"
      },
      {
        "type": "list",
        "items": [
          "Approximately 60% input time saved on recurring periods.",
          "Reduced errors with validations and assistive AI.",
          "Better accessibility for non-expert users."
        ]
      },
      {
        "type": "heading",
        "text": "Media"
      },
      {
        "type": "heading",
        "text": "Demo video"
      },
      {
        "type": "heading",
        "text": "Screen gallery"
      },
      {
        "type": "list",
        "items": [
          "Home page / main menu",
          "Entry of double entry entries",
          "Lettering and journals AC/VE/BQ/OD/AN",
          "Reports: Balance, General Ledger, FEC, VAT",
          "AI assistant: analyzes and anomaly detection"
        ]
      },
      {
        "type": "heading",
        "text": "Main features"
      },
      {
        "type": "list",
        "items": [
          "Authentication and multi-company",
          "Chart of accounts and journals",
          "Writings and closings",
          "Reporting and Compliance",
          "Bank import and automation",
          "AI Assistant",
          "Dashboard"
        ]
      },
      {
        "type": "heading",
        "text": "Technical architecture"
      },
      {
        "type": "list",
        "items": [
          "Frontend: React 18 + TypeScript, Vite, Tailwind CSS, React Router, TanStack Query",
          "Backend API: Node.js + Express (TypeScript)",
          "AI: Dedicated service integrating Claude via Anthropic SDK",
          "Database: PostgreSQL (hosted via Supabase)",
          "Deployment: Frontend on Vercel/Netlify. Backend(s) on Render/Railway"
        ]
      },
      {
        "type": "paragraph",
        "text": "Simplified tree structure:"
      },
      {
        "type": "code",
        "text": "AS400 v1/\n├── frontend/ # React + TS + Vite\n├── backend/ # API Node + Express + TS\n├── supabase/ # PostgreSQL Schema (schema.sql)\n├── ai-backend/ # AI Assistant Server (Claude)\n└── *.md # Full documentation"
      },
      {
        "type": "heading",
        "text": "Main flows"
      },
      {
        "type": "list",
        "items": [
          "Auth → profile recovery and active company → RLS permissions",
          "Input → typed validations → recording → lettering",
          "PDF import → OCR → writing proposals → user validation",
          "Reports → aggregated SQL queries → export FEC/Balance/GL/VAT",
          "AI → calls to the Claude service → summaries, checks, alerts"
        ]
      },
      {
        "type": "heading",
        "text": "BDD diagram (extracts)"
      },
      {
        "type": "list",
        "items": [
          "companies, accounts, journals, entries, vat_declarations, closures",
          "Triggers and constraints for consistency and numbering",
          "RLS policies by user and company"
        ]
      },
      {
        "type": "heading",
        "text": "Security"
      },
      {
        "type": "list",
        "items": [
          "Auth Supabase + RLS for multi‑tenant isolation",
          "API side server validation before writing to database"
        ]
      },
      {
        "type": "heading",
        "text": "Quick use"
      },
      {
        "type": "list",
        "items": [
          "Keyboard navigation (AS/400 style)",
          "Recommended route"
        ]
      },
      {
        "type": "heading",
        "text": "Installation (summary)"
      },
      {
        "type": "list",
        "items": [
          "Prerequisites: Node.js 18+, Supabase account, Claude API key",
          "Environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY",
          "Typical startup:"
        ]
      },
      {
        "type": "heading",
        "text": "Synthetic roadmap"
      },
      {
        "type": "list",
        "items": [
          "Complete React/TypeScript migration and optimization via TanStack Query",
          "Unit testing and E2E",
          "Offline mode with synchronization"
        ]
      },
      {
        "type": "heading",
        "text": "Credits"
      },
      {
        "type": "paragraph",
        "text": "© 2025 — AS400 Accounting TAC Touquet Hockey Club"
      }
    ]
  },
  "as400-horizontal-application-comptabilite-moderne": {
    "title": "Accounting application v2 — Horizontal navigation + AI",
    "shortDescription": "New version of the TAC Hockey accounting app: smooth horizontal navigation, conversational AI assistant (Claude + GenUI), Supabase, PDF/CSV exports.",
    "fullDescription": "Complete overhaul of the v1 accounting application with Next.js 15 and scroll-driven horizontal navigation. 9 sections (dashboard → plan → logs → postings → fog → lettering → reports → settings → AI). Conversational AI assistant with streaming (Claude + Thesys GenUI). Neat PDF/CSV exports. Supabase base with typed diagrams.",
    "category": "Development",
    "tags": [
      "Next.js",
      "TypeScript",
      "Claude API",
      "Supabase",
      "FramerMotion",
      "Tailwind"
    ],
    "company": "TAC Hockey Club",
    "problem": "Very terminal UX making the integration of conversational AI laborious. Limited animations and dashboards. Industrialization (careful PDF/CSV exports) requiring a more modern stack.",
    "solution": "Next.js 15 + horizontal navigation in 9 sections + conversational AI assistant with streaming (Claude + Thesys GenUI) + careful PDF/CSV exports + Supabase.",
    "impact": [
      "Smoother end-to-end journey, from entering to editing reports",
      "Better immediate understanding via dashboards and section views",
      "Technical base ready for multi-company authentication and roles"
    ],
    "challenges": [
      "Fluid horizontal navigation driven by vertical scroll",
      "AI assistant that responds and explains without ever inventing scriptures",
      "Performance with virtual scrolling on large volumes of data"
    ],
    "learnings": [
      "Next.js 15 App Router architecture with server/client components",
      "Streaming AI into business applications",
      "Consistent system design for a complex application"
    ],
    "technologies": [
      {
        "name": "Next.js 15 / React 18",
        "usage": "Frontend with App Router"
      },
      {
        "name": "TypeScript + Tailwind + Radix UI",
        "usage": "UI and components"
      },
      {
        "name": "Claude (Anthropic SDK)",
        "usage": "Conversational AI assistant with streaming"
      },
      {
        "name": "Thesys GenUI",
        "usage": "Generation of dynamic UI by AI"
      },
      {
        "name": "Supabase / PostgreSQL",
        "usage": "Database, auth and RLS"
      },
      {
        "name": "jsPDF",
        "usage": "PDF export"
      }
    ],
    "media": [
      {
        "url": "/projects/as400-v2-tableau-bord-1.png",
        "caption": "Dashboard — financial indicators & 6-month evolution"
      },
      {
        "url": "/projects/as400-v2-tableau-bord-2.png",
        "caption": "Dashboard — charges by category & top active accounts"
      },
      {
        "url": "/projects/as400-v2-tableau-bord-3.png",
        "caption": "Dashboard — activity, alerts & quick actions"
      },
      {
        "url": "/projects/as400-v2-plan-comptable.png",
        "caption": "Accounting Plan — consultation and management of accounts"
      },
      {
        "url": "/projects/as400-v2-journaux-comptable.png",
        "caption": "Accounting Journals — organization by nature of transaction"
      },
      {
        "url": "/projects/as400-v2-saisie-ecritures.png",
        "caption": "Entry of Entries — double entry with balance validation"
      },
      {
        "url": "/projects/as400-v2-gestion-brouillard.png",
        "caption": "Fog Management — validation of pending batches"
      },
      {
        "url": "/projects/as400-v2-lettrage-comptes.png",
        "caption": "Lettering of Accounts — debit/credit reconciliation"
      },
      {
        "url": "/projects/as400-v2-rapports-editions.png",
        "caption": "Reports & Editions — Balance, General Ledger, VAT, FEC"
      },
      {
        "url": "/projects/as400-v2-parametres-comptabilite.png",
        "caption": "Accounting parameters — exercise and structure"
      },
      {
        "url": "/projects/as400-v2-assistant-ia-comptable-1.png",
        "caption": "AI Accounting Assistant — conversational interface"
      },
      {
        "url": "/projects/as400-v2-assistant-ia-comptable-2.png",
        "caption": "AI Accounting Assistant — chat and contextual suggestions"
      }
    ],
    "content": [
      {
        "type": "heading",
        "text": "Overview"
      },
      {
        "type": "paragraph",
        "text": "AS400 Horizontal is my \"v2\" version of the TAC Hockey Club accounting application. I redesigned the UX around fluid horizontal navigation, added a conversational AI assistant and modernized the entire stack to make it an application that is educational, fast and complete."
      },
      {
        "type": "heading",
        "text": "Context"
      },
      {
        "type": "paragraph",
        "text": "I started from a very concrete need at TAC Hockey Club. During the summer, I got my hands on operational accounting and realized how much time going back and forth between entry, control and generation of reports was wasting my time. My v1, modeled on AS/400 ergonomics, allowed me to go quickly and respect our keyboard reflexes, but I encountered several limits when adding more ambitious features."
      },
      {
        "type": "paragraph",
        "text": "What I really wanted to do:"
      },
      {
        "type": "list",
        "items": [
          "Accelerate “real” daily data entry and reduce the error rate without making the tool more complex",
          "Make the accounting structure readable for someone who is not an expert, with visual cues and contextual help",
          "Centralize the entire flow in the same experience: enter → control → letter → edit the states",
          "Connect an AI that responds, explains and alerts, without ever “inventing” scriptures"
        ]
      },
      {
        "type": "paragraph",
        "text": "Why start from scratch:"
      },
      {
        "type": "list",
        "items": [
          "The very “terminal” UX of v1 made integrating conversational AI and rich screens laborious",
          "Animations, virtual scrolling and dashboards remained technically limited",
          "Industrialization (careful PDF/CSV exports, performance, reusability of components) required a more modern front structure"
        ]
      },
      {
        "type": "paragraph",
        "text": "My structuring choices:"
      },
      {
        "type": "list",
        "items": [
          "Upgrade to Next.js + React 18 for smooth “sectioned” navigation and a solid foundation for performance",
          "Adopt horizontal navigation driven by vertical scrolling to clearly segment the 9 major areas of the product (dashboard → plan → logs → entries → fog → lettering → reports → parameters → AI assistant)",
          "Isolate a dedicated AI service (Claude + GenUI) with streaming to obtain guided responses in context, educational and rapid",
          "Rely on Supabase (PostgreSQL + Auth) to guarantee clean schemas and reliable exports"
        ]
      },
      {
        "type": "paragraph",
        "text": "Concretely, I redesigned the experience so that I could sequence my tasks without “friction”: open the section, see the right indicators, enter with guardrails, check immediately, then produce a clean report when everything is OK. My goal is not to replace accounting expertise, but to save myself time and avoid stupid errors, while keeping the output compliant and readable."
      },
      {
        "type": "list",
        "items": [
          "Input still costly and error-prone without context-sensitive help",
          "Difficulty linking entry, control, lettering and edition of reports in the same readable flow",
          "UI not very educational for people who are not experts in accounting",
          "Integration of complicated AI into very “terminal” ergonomics"
        ]
      },
      {
        "type": "heading",
        "text": "Solution"
      },
      {
        "type": "list",
        "items": [
          "A modern and responsive UI, designed in horizontal sections controlled by vertical scroll and keyboard",
          "A conversational AI assistant (Claude + GenUI) that responds, explains, detects inconsistencies and suggests actions",
          "Rich and visual views to quickly understand: dashboards, graphs, useful animations",
          "Clean and standardized exports (PDF/CSV) and a solid data base (Supabase + Postgres)"
        ]
      },
      {
        "type": "heading",
        "text": "Key results"
      },
      {
        "type": "list",
        "items": [
          "Smoother end-to-end journey, from data entry to report editing",
          "Better immediate understanding via dashboards and section views",
          "Technical base ready for authentication, multi-company and roles (roadmap)"
        ]
      },
      {
        "type": "heading",
        "text": "Media"
      },
      {
        "type": "heading",
        "text": "Demo video"
      },
      {
        "type": "heading",
        "text": "Screen gallery"
      },
      {
        "type": "list",
        "items": [
          "Dashboard and horizontal navigation"
        ]
      },
      {
        "type": "list",
        "items": [
          "Entry of entries and fog"
        ]
      },
      {
        "type": "list",
        "items": [
          "Lettering and newspapers"
        ]
      },
      {
        "type": "list",
        "items": [
          "Reports: Balance, General Ledger, FEC, VAT"
        ]
      },
      {
        "type": "list",
        "items": [
          "AI assistant (Thesys GenUI + Claude)"
        ]
      },
      {
        "type": "heading",
        "text": "Main features"
      },
      {
        "type": "list",
        "items": [
          "Horizontal navigation and shortcuts",
          "Complete accounting",
          "AI Assistant",
          "Visualizations",
          "Performance and UX"
        ]
      },
      {
        "type": "heading",
        "text": "Technical architecture"
      },
      {
        "type": "list",
        "items": [
          "Frontend: Next.js 15 (App Router), React 18, TypeScript, Tailwind, Radix UI, Framer Motion, Lucide, @tanstack/react-virtual",
          "AI & agents: @anthropic-ai/sdk (Claude 3.5 Sonnet), Thesys GenUI, @crayonai/*, streaming",
          "Backend: Node.js + Express (TypeScript), Morgan",
          "Data: Supabase (PostgreSQL + Auth), typed schemas and validations",
          "Exports: jsPDF (+ autotable) for standard PDF, CSV"
        ]
      },
      {
        "type": "paragraph",
        "text": "Simplified tree structure:"
      },
      {
        "type": "code",
        "text": "AS400 v2/\n├── app/ #Next.js App Router\n├── components/ # sections/, ai-assistant/, ui/\n├── hooks/ # use-keyboard-shortcuts, use-supabase…\n├── lib/ # supabase, api, utils, constants\n├── backend/ # API Express (TS)\n├── ai-backend/ # AI service (Claude)\n└── scripts/ # utilities"
      },
      {
        "type": "heading",
        "text": "Major flows"
      },
      {
        "type": "list",
        "items": [
          "Auth (roadmap) → company selection → permissions",
          "Entry → fog → validations → lettering → states",
          "AI → contextual analysis → recommendations/actions",
          "Reports → PDF/CSV generation → sharing"
        ]
      },
      {
        "type": "heading",
        "text": "Database (extracts)"
      },
      {
        "type": "list",
        "items": [
          "companies, accounts, journals, journal_entries, company_settings",
          "Views/req. for sales, balance checks, lettering"
        ]
      },
      {
        "type": "heading",
        "text": "Performance"
      },
      {
        "type": "list",
        "items": [
          "FCP < 1.5s, TTI < 3s (targets and local measurements)",
          "Code splitting, lazy loading, memoization"
        ]
      },
      {
        "type": "heading",
        "text": "Quick use"
      },
      {
        "type": "list",
        "items": [
          "Ctrl+K: command palette",
          "Arrows or scroll: change section",
          "Entries: balance Debit = Credit, batch validated if |Σ Debits − Σ Credits| < 0.01€",
          "Reports: Balance, General Ledger, FEC, VAT in 1 click"
        ]
      },
      {
        "type": "heading",
        "text": "Installation (summary)"
      },
      {
        "type": "list",
        "items": [
          "Prerequisites: Node.js 18+, Supabase account, Anthropic key",
          "Environments: .env.local (frontend), backend/.env, ai-backend/.env",
          "Typical startup:"
        ]
      },
      {
        "type": "heading",
        "text": "Synthetic roadmap"
      },
      {
        "type": "list",
        "items": [
          "v1.1: Auth Supabase, roles, CSV/Excel import, offline mode (PWA)",
          "v1.2: Multi-company, validation workflow, audit trail, public API"
        ]
      },
      {
        "type": "heading",
        "text": "Credits"
      },
      {
        "type": "paragraph",
        "text": "© 2025 — AS400 Horizontal — TAC Hockey Club"
      }
    ]
  },
  "veille-hub": {
    "title": "Watch Hub — Intelligent search engine for my AI watch",
    "shortDescription": "Personal monitoring application built to solve a real problem: finding any of my 40-50 tweets recorded per day using AI search, with annotations, notes and statistics.",
    "fullDescription": "Born from a concrete problem: I save 40 to 50 tweets and numerous YouTube videos daily as part of my artificial intelligence monitoring. Twitter's native search is too basic — impossible to filter, sort or do a semantic search. So I built Veille Hub: a full-stack application that indexes all my Twitter bookmarks and my YouTube videos in Supabase, and makes them accessible via an AI assistant capable of understanding natural language queries. I can find any content, whether it's from yesterday or 3 years ago.",
    "category": "AI",
    "tags": [
      "Next.js",
      "Supabase",
      "AI SDK",
      "TypeScript",
      "Python",
      "Cloudflare",
      "Vercel"
    ],
    "company": "",
    "problem": "I save 40 to 50 tweets per day in my Twitter bookmarks for my AI monitoring, but Twitter's native search is too simplistic: no filters, no sorting, no semantic search. Finding a specific tweet among thousands becomes a nightmare. Same problem with my hundreds of saved YouTube videos.",
    "solution": "Full-stack application that automatically scrapes my Twitter bookmarks and YouTube videos, stores them in Supabase, and makes them accessible via a natural language AI assistant. Ability to annotate, comment and rate each content — this metadata is integrated into the search.",
    "impact": [
      "Immediate access to years of natural language intelligence",
      "16,000+ indexed and searchable tweets and videos",
      "Annotations and notes integrated into the search ranking",
      "Stats dashboard: activity heatmap, authors followed, top actions",
      "Automated scraping via Python + cron scripts"
    ],
    "challenges": [
      "Reliable scraping of Twitter bookmarks without official API (cookies-based)",
      "Relevant semantic search on a volume of 16,000+ contents",
      "Integration of user annotations in the AI ​​ranking"
    ],
    "learnings": [
      "Building to solve your own problem produces the best specifications",
      "RAG architecture applied to a personal knowledge base",
      "Value of user metadata (ratings, comments) to improve search relevance"
    ],
    "technologies": [
      {
        "name": "Next.js 15",
        "usage": "Full-stack framework, App Router"
      },
      {
        "name": "Supabase",
        "usage": "PostgreSQL database and bookmark storage"
      },
      {
        "name": "AI SDK (Vercel)",
        "usage": "OpenAI/xAI integration for AI assistant"
      },
      {
        "name": "Python",
        "usage": "Scripts for scraping Twitter bookmarks and YouTube videos"
      },
      {
        "name": "Cloudflare Pages",
        "usage": "Deployment via OpenNext"
      },
      {
        "name": "TypeScript",
        "usage": "End-to-end typing"
      },
      {
        "name": "Recharts",
        "usage": "Activity graphs and heatmap"
      }
    ],
    "media": [
      {
        "url": "/projects/veille-hub/screenshot-1.png",
        "caption": "Monitoring dashboard — annual view with activity heatmap and global stats"
      },
      {
        "url": "/projects/veille-hub/screenshot-2.png",
        "caption": "Monitoring dashboard — detailed activity and recent signals"
      },
      {
        "url": "/projects/veille-hub/screenshot-3.png",
        "caption": "Signal Flow — overview of tweets and videos with top authors"
      },
      {
        "url": "/projects/veille-hub/screenshot-4.png",
        "caption": "AI assistant — natural language search interface in bookmarks"
      },
      {
        "url": "/projects/veille-hub/screenshot-5.png",
        "caption": "AI assistant — search result with detailed tweet details"
      }
    ],
    "content": [
      {
        "type": "heading",
        "text": "Overview"
      },
      {
        "type": "paragraph",
        "text": "Veille Hub is a personal application built to solve a real problem in my daily life: I am passionate about artificial intelligence and I save 40 to 50 tweets every day in my X bookmarks (formerly Twitter) to keep track of discoveries, articles, threads and notable ideas."
      },
      {
        "type": "paragraph",
        "text": "The problem: Twitter's native search is far too basic. No filters, no sorting by date or relevance, no semantic search. Finding a specific tweet among thousands of bookmarks quickly becomes impossible. Ditto for my hundreds of recorded YouTube videos."
      },
      {
        "type": "paragraph",
        "text": "The solution I built: a full-stack application that indexes all my content in Supabase and makes it accessible via an AI assistant capable of understanding natural language questions — \"What does Karpathy think of generative AI?\", \"Show me the tweets about Claude and Anthropic from last week\", \"Which authors publish the most about AI agents?\""
      },
      {
        "type": "heading",
        "text": "Why X / Twitter despite the controversy?"
      },
      {
        "type": "paragraph",
        "text": "X remains, whether we like it or not, the best platform for following AI news in real time. Researchers, founders of AI startups, engineers from Google DeepMind, Anthropic, OpenAI publish there first. No other platform offers this density of information on my field. It is precisely because I spend time there that I needed a tool to make the most of this time spent."
      },
      {
        "type": "heading",
        "text": "Main features"
      },
      {
        "type": "list",
        "items": [
          "Natural language AI search — Ask a question on your bookmarks, the assistant understands and finds relevant content",
          "Automatic indexing — Python scripts that scrape Twitter bookmarks and YouTube videos at regular intervals",
          "Annotations & notes — Each tweet or video can be annotated, commented and rated; this metadata enriches the search",
          "Stats dashboard — Heatmap of annual/monthly/weekly activity, total tweets, video duration, top followed authors",
          "Advanced filters — By type (tweet, video, photo), by author, by language, by date",
          "Video transcriptions — YouTube videos are transcribed to be searchable by content"
        ]
      },
      {
        "type": "heading",
        "text": "Technical architecture"
      },
      {
        "type": "paragraph",
        "text": "Stack: Next.js 15 (App Router) · Supabase (PostgreSQL) · AI SDK Vercel · OpenAI / xAI · Python (scraping) · Cloudflare Pages"
      },
      {
        "type": "list",
        "items": [
          "Scraping: Python scripts (scrape-daily.py, scrape-youtube.py) executed in cron, authentication via Twitter cookies",
          "Storage: All bookmarks and videos are normalized and stored in Supabase with their metadata",
          "AI assistant: Vercel's AI SDK orchestrates calls to the model (OpenAI / xAI) with access to the Supabase database as context",
          "Frontend: Next.js 15 with App Router, Tailwind CSS, Recharts for graphics, Radix UI for components",
          "Deployment: Cloudflare Pages via OpenNext for global edge performance"
        ]
      },
      {
        "type": "heading",
        "text": "Results"
      },
      {
        "type": "list",
        "items": [
          "✅ 16,000+ instantly indexed and searchable content",
          "✅ Find any tweet in seconds, even from 3 years ago",
          "✅ Valuable daily monitoring: each tweet saved becomes a sustainable resource",
          "✅ Annotations and notes integrated into the AI ​​assistant ranking",
          "✅ Real change in my daily life — actively used every day"
        ]
      }
    ]
  },
  "unlimited-cognition": {
    "title": "Unlimited Cognition",
    "shortDescription": "Augmented learning web application: SRS, quizzes, writing, audio, annotations, intelligent planning, analytics and AI generation — designed to use AI as a lever for cognitive effort, not as a substitute.",
    "fullDescription": "Personal learning application built from scratch in React 19 + TypeScript. It brings together a spaced repetition system (SRS), quizzes and writing exercises, a content generator managed by Claude, a multimedia library with audio, a configurable revision schedule, analytics, annotations and a mind maps space. Thought over 2-3 years, developed to meet my own cognitive needs first and foremost.",
    "category": "Web App",
    "tags": [
      "React 19",
      "TypeScript",
      "Supabase",
      "Claude AI",
      "SRS",
      "Quickly",
      "Tailwind CSS",
      "Zustand",
      "KaTeX",
      "Mermaid"
    ],
    "company": "",
    "problem": "An alarming observation: around me, classmates I have known for 3 years delegate their entire thinking to the AI ​​— each exercise, each assessment, each competition. Observable result: real and progressive cognitive impoverishment. I was not exempt from it myself, to a lesser extent. The problem isn't AI per se, it's the lack of deliberate cognitive effort. There are a number of existing applications (Quizlet, StudySmart, etc.), but none offered the level of customization and functionality I was looking for.",
    "solution": "After studying the 3 stages of learning (Encoding, Automation, Metacognition), I designed a multifunction application tailored to my needs: a spaced repetition system (SRS) for encoding and automation, an AI-driven content generator (Claude) for material production, and a rich workspace (Prism) for metacognition — with LaTeX writing, mind maps, and snippets. The central idea: use AI as a generation tool, never as a cognitive crutch.",
    "impact": [
      "Personally enhanced memorization and revision skills thanks to SRS, quiz sessions and writing exercises",
      "Automated import of thousands of questions (TOEIC, Kwizmo, Tage Mage) — zero manual entry",
      "Intelligent planning with agenda, personalized rules and AI logs to organize sessions",
      "Detailed analytics: activity, deck mastery, quiz performance and progress",
      "Multimedia library with audio player, mind maps and contextual annotations",
      "Generation of flashcards and contextual quizzes via Claude (Anthropic) in seconds",
      "Open-source application (planned): knowledge must be accessible to all",
      "Proof that in 2026, we do not need a brain chip to remain cognitively competitive"
    ],
    "challenges": [
      "Design an SRS algorithm flexible enough for different subjects and learning paces",
      "Integrate Claude as a co-constructor of content without the app becoming a cognitive crutch",
      "Parse and standardize heterogeneous formats (TOEIC scanned books, Kwizmo exports, CSV Tage Mage)",
      "Build a rich interface (quizzes, writing, audio, analytics, planning, mind maps) that remains fluid and non-intimidating",
      "Finding the right balance between deep customization and a usable experience for others"
    ],
    "learnings": [
      "Deliberate cognitive effort is irreplaceable — AI amplifies, it does not replace",
      "An application designed for yourself has an efficiency that generic tools cannot match",
      "Feature-based architecture in React for complex functional areas (SRS, generation, import)",
      "2-3 years of reflection on one's own learning is worth any specification"
    ],
    "technologies": [
      {
        "name": "React 19 + TypeScript",
        "usage": "Frontend — responsive and typed UI"
      },
      {
        "name": "Vite 8",
        "usage": "Ultra-fast build tool"
      },
      {
        "name": "Tailwind CSS v4",
        "usage": "Utility styling"
      },
      {
        "name": "Supabase",
        "usage": "Backend, database and authentication"
      },
      {
        "name": "Anthropic SDK (Claude)",
        "usage": "Generation of flashcards, quizzes and educational content"
      },
      {
        "name": "Zustand",
        "usage": "Global state management (SRS store, sessions)"
      },
      {
        "name": "KaTeX",
        "usage": "Rendering mathematical formulas in Prism"
      },
      {
        "name": "Mermaid",
        "usage": "Generation of mind maps and diagrams"
      },
      {
        "name": "Framer Motion + GSAP",
        "usage": "Animations (card flipping, transitions)"
      },
      {
        "name": "PDF.js",
        "usage": "Reading and importing from PDF documents"
      },
      {
        "name": "React Markdown + remark-math",
        "usage": "Enriched Markdown rendering with math"
      }
    ],
    "media": [
      {
        "url": "/projects/unlimited-cognition/screentune-tutoriel.mp4",
        "caption": "ScreenTune tutorial video — Guided demonstration of Unlimited Cognition",
        "type": "video",
        "poster": "/projects/unlimited-cognition/screenshot-01-home-upload.png"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-01-home-upload.png",
        "caption": "Home — Import or deposit new knowledge"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-02-review-queue.png",
        "caption": "Review session — Card queues ready to review"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-03-library-decks.png",
        "caption": "Library — Library of decks, folders and categories"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-04-quiz-session.png",
        "caption": "Quiz — Interactive questions and session progress"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-05-flashcard-session.png",
        "caption": "Flashcards — Spaced Repetition with Difficulty Feedback"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-06-quiz-editor.png",
        "caption": "Quiz Editor — Detailed Editing of Questions"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-07-quiz-answer-review.png",
        "caption": "Correction — Rereading answers and explanations"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-08-writing-practice.png",
        "caption": "Writing — Writing exercise with required words"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-09-study-modes.png",
        "caption": "Learning modes — Flashcards, quizzes, writing and custom settings"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-10-ai-recommendations.png",
        "caption": "AI Assistant — Session Recommendations from Study Data"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-11-analytics-dashboard.png",
        "caption": "Analytics — Performance dashboard"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-12-analytics-detail.png",
        "caption": "Analytics — Mastering quizzes, decks and performances"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-13-planning-agenda.png",
        "caption": "Planning — Agenda and scheduled sessions"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-14-planning-logs.png",
        "caption": "Planning — AI logs and applied rules"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-15-planning-rule-editor.png",
        "caption": "Scheduling Rules — Customizing Constraints"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-16-annotations.png",
        "caption": "Annotations — Contextual notes related to content"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-17-audio-library.png",
        "caption": "Audio Library — Multimedia Listening and Review"
      },
      {
        "url": "/projects/unlimited-cognition/screenshot-18-mind-map.png",
        "caption": "Mind Map — Visualization of notions and conceptual links"
      }
    ],
    "content": [
      {
        "type": "heading",
        "text": "The observation"
      },
      {
        "type": "paragraph",
        "text": "It all started with a simple, and quite disturbing, observation. In my prep class, I have friends that I have been around for 3 years. Daily. And since the explosion of LLMs, for any exercise, evaluation, or mock competition — they delegate everything. Absolutely everything. Without the slightest cognitive effort."
      },
      {
        "type": "paragraph",
        "text": "The result is visible: a real, progressive, observable intellectual impoverishment. I would not make such an alarming observation if I had not been a partial victim myself. The temptation is strong, the tools are there, and the effort seems useless when the machine does better in 3 seconds."
      },
      {
        "type": "paragraph",
        "text": "But here's the thing: just because the AI ​​can think for you doesn't mean you should let it do it. The cognitive muscle atrophies like a physical muscle. Result: you will become dependent on a tool that you do not understand, unable to function without it."
      },
      {
        "type": "heading",
        "text": "Why this app"
      },
      {
        "type": "paragraph",
        "text": "After taking the time to study the 3 detailed stages of learning — Encoding, Automation, Metacognition — I decided to construct a concrete answer. Not another app in the sea of ​​EdTech, but an app built to address my specific problems, with a level of customization not seen anywhere else."
      },
      {
        "type": "paragraph",
        "text": "We can legitimately object that applications like Quizlet, StudySmart or Anki already exist, and rightly so. But Unlimited Cognition has features that those apps don't have, a radically different level of system customization, and will most likely be made open-source — because in my opinion, knowledge should be free and accessible."
      },
      {
        "type": "paragraph",
        "text": "I have no confidence that this app will work for everyone. It was built to address my problems in the first place. But maybe that's precisely why it works so well for me: I thought about it for over 2 years, I designed it, and somehow, it belongs to me."
      },
      {
        "type": "heading",
        "text": "Main features"
      },
      {
        "type": "heading",
        "text": "SRS — Spaced Repetition"
      },
      {
        "type": "list",
        "items": [
          "Flashcard system with spaced repetition algorithm (SRS)",
          "Study sessions with difficulty feedback (easy/medium/hard)",
          "Progress tracking per deck — automatically calculated intervals",
          "Support for LaTeX rendering in math and science maps"
        ]
      },
      {
        "type": "heading",
        "text": "Generation AI (Claude)"
      },
      {
        "type": "list",
        "items": [
          "Generation of flashcards from any text or document",
          "Generation of contextual quizzes with questions and corrections",
          "Study session recommendations based on performance and deadlines",
          "Claude as a co-constructor of educational content, not as a cognitive crutch"
        ]
      },
      {
        "type": "heading",
        "text": "Learning modes"
      },
      {
        "type": "list",
        "items": [
          "SRS flashcards for lasting memorization",
          "Interactive quizzes with editor and detailed correction",
          "Writing with imposed words to work on written production",
          "Audio library to revise also by listening"
        ]
      },
      {
        "type": "heading",
        "text": "Multi-source import"
      },
      {
        "type": "list",
        "items": [
          "TOEIC import from scanned books (photos → questions automatically parsed)",
          "Import from Kwizmo (dedicated Python scraper)",
          "Import Tage Mage (normalized JSON format)",
          "PDF support via PDF.js for content extraction"
        ]
      },
      {
        "type": "heading",
        "text": "Dashboard & monitoring"
      },
      {
        "type": "list",
        "items": [
          "Daily Briefing — daily view of revisions due",
          "Planning — calendar, custom rules and AI logs",
          "Analytics — activity, mastery by deck, performance by quiz",
          "Annotations — contextual notes related to maps and content",
          "Mind maps — visualization of conceptual connections"
        ]
      },
      {
        "type": "heading",
        "text": "Technical architecture"
      },
      {
        "type": "paragraph",
        "text": "Stack: React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · Supabase · Anthropic SDK · Zustand · KaTeX · Mermaid · Framer Motion · GSAP · PDF.js"
      },
      {
        "type": "list",
        "items": [
          "Feature-based architecture: each functional area (srs, generation, quizzes, import) is isolated in its own module",
          "Zustand for global status management, including the SRS store (intervals, sessions, progress)",
          "Supabase in backend: authentication, deck storage, cloud sync (roadmap)",
          "Claude (Anthropic) integrated via official SDK for the generation of educational content",
          "Prism Workspace: custom editor with code editor (@uiw/react-textarea-code-editor), KaTeX and Mermaid rendering"
        ]
      },
      {
        "type": "heading",
        "text": "Vision"
      },
      {
        "type": "paragraph",
        "text": "Unlimited Cognition is also a position: I do not believe that with the emergence of AI, we are obliged to implant chips in our brain to continue to exist cognitively. We can use these tools to amplify our intelligence, not to delegate it. This app is my practical response to this belief."
      }
    ]
  },
  "screentune": {
    "title": "ScreenTune — Product demo studio for freelancers",
    "shortDescription": "Native macOS application to transform a screenshot or video into a clear customer demo: zooms, pauses, arrows, annotations, visual style and MP4 export without subscription.",
    "fullDescription": "ScreenTune is a native macOS application built to solve a concrete problem for teleworking freelancers: delivering products that are well understood by clients who are sometimes uncomfortable with technology. Instead of just sending a Notion page with text and screenshots, the app allows you to produce annotated video demonstrations, with zooms on important areas, pauses, arrows, highlights, highlighted cursor and export ready to share.",
    "category": "macOS app",
    "tags": [
      "SwiftUI",
      "macOS",
      "ScreenCaptureKit",
      "AVFoundation",
      "Video Editing",
      "Freelance",
      "Documentation"
    ],
    "company": "",
    "problem": "In freelancing and teleworking, the difficulty does not end with the delivery of the product: the client must also understand what has been delivered. Notion documentation with text and images helps, but remains limited for explaining an interface, showing a path, drawing attention to the right elements or guiding a less technical customer.",
    "solution": "Create a native macOS application that transforms a capture or video into professional demonstration support: timeline, time zooms, freezes, annotations, arrows, visual styles, cursor tracking and MP4 export. The objective: to produce educational deliverables without depending on a paid SaaS.",
    "impact": [
      "Clearer customer demos than simple Notion captures",
      "Adding zooms and pauses to explain key moments of a delivered product",
      "Visual annotations: arrows, text, shapes, highlights and style settings",
      "MP4 export shareable directly in documentation or customer message",
      "Personal tool without subscription, adapted to a recurring freelance workflow",
      "Native macOS prototype built in one day around a real business need"
    ],
    "challenges": [
      "Synchronize zooms, freezes, annotations and cursors on the same video timeline",
      "Make captures more premium without losing the readability of the product presented",
      "Manage macOS screenshot permissions properly",
      "Export a final video with stylized background, slider, annotations and integrated pauses",
      "Design a powerful editor that can be used quickly after customer delivery"
    ],
    "learnings": [
      "A technical deliverable is only truly finished when it can be understood by the client",
      "Documentation tools are as important as production tools",
      "SwiftUI + AVFoundation allows you to quickly build a real specialized desktop tool",
      "The freelance context creates excellent product problems: repetitive, concrete and immediately verifiable"
    ],
    "technologies": [
      {
        "name": "SwiftUI",
        "usage": "Native macOS interface, panels, toolbar and timeline"
      },
      {
        "name": "ScreenCaptureKit",
        "usage": "Screenshot, window capture and screen recording"
      },
      {
        "name": "AVFoundation",
        "usage": "MP4 video playback, timeline, rendering and export"
      },
      {
        "name": "AppKit",
        "usage": "macOS interop, NSImage, opening/export panels"
      },
      {
        "name": "Keychain",
        "usage": "Local storage of API keys for AI functions"
      },
      {
        "name": "Swift Package Manager",
        "usage": "Package-first structure and local build"
      }
    ],
    "media": [
      {
        "url": "/projects/screentune/screenshot-01-editor.png",
        "caption": "ScreenTune Editor — Video Timeline, Zooms, Freezes and Style Panel"
      },
      {
        "url": "/projects/screentune/screenshot-02-export-preview.png",
        "caption": "Cursor and export settings — Highlighting interactions before customer sharing"
      }
    ],
    "content": [
      {
        "type": "heading",
        "text": "The problem: delivering is not enough"
      },
      {
        "type": "paragraph",
        "text": "Since working freelance and remotely, I have identified a major problem: communication around deliverables. Building an application, automation or dashboard is only part of the job. It is then necessary to clearly explain what was done, how to use it, where to click, what to check, and why certain decisions were made."
      },
      {
        "type": "paragraph",
        "text": "I was already using Notion to document my deliveries with text, screenshots and links shared to the customer. It's useful, but limited. For a less technical customer, a static capture does not always show the path, gestures, points of attention or important areas of the interface."
      },
      {
        "type": "heading",
        "text": "The idea of ​​ScreenTune"
      },
      {
        "type": "paragraph",
        "text": "ScreenTune was born from this very concrete need: to be able to quickly produce a clear, educational and professional demonstration video, without taking out an additional subscription. The application allows you to capture or import media, then transform it into short and readable training material."
      },
      {
        "type": "paragraph",
        "text": "The objective is not to do general video editing. The goal is much more specific: create product demos that help a customer understand remote delivery."
      },
      {
        "type": "heading",
        "text": "Main features"
      },
      {
        "type": "list",
        "items": [
          "Screenshot, window capture and import of images or videos",
          "Screen recording with cursor tracking and clicks",
          "Timeline dedicated to demos: trim, zoom zones, pauses/freeze frames and temporal annotations",
          "Guided zooms on important areas to attract the customer's attention",
          "Visual annotations: arrows, text, shapes, colors, opacity, dotted lines and thickness",
          "Presentation styles: background, padding, rounded corners, shadows and visual presets",
          "Cursor customization: size, style and click ring",
          "Image or MP4 export ready to integrate into Notion, an email or customer delivery"
        ]
      },
      {
        "type": "heading",
        "text": "Technical architecture"
      },
      {
        "type": "paragraph",
        "text": "Stack: SwiftUI · ScreenCaptureKit · AVFoundation · AppKit · Swift Package Manager · Keychain"
      },
      {
        "type": "list",
        "items": [
          "SwiftUI for main editor, toolbar, style panel, modals and timeline",
          "ScreenCaptureKit to capture the screen, a specific window or record a session",
          "AVFoundation to play, synchronize and export the final video to MP4",
          ".screentune project template for saving media, annotations, zooms and adjustments",
          "Separate services: capture, rendering, export, project library, keychain and AI analysis"
        ]
      },
      {
        "type": "heading",
        "text": "Why it is useful in my workflow"
      },
      {
        "type": "paragraph",
        "text": "ScreenTune directly complements my freelance work. After delivering an app or automation, I can record a short demo, zoom in on key areas, add arrows or pauses, and then embed the video into a Notion documentation. The customer understands more quickly, asks fewer blocking questions, and keeps a trace that can be consulted after delivery."
      },
      {
        "type": "heading",
        "text": "Result"
      },
      {
        "type": "list",
        "items": [
          "✅ Working native macOS app",
          "✅ Product demonstration-oriented video editor",
          "✅ Timeline with zooms, freezes, trims, annotations and cursor",
          "✅ MP4 export to easily share demos",
          "✅ Tool built around a real freelance need, not an abstract idea"
        ]
      }
    ]
  },
  "adn-dashboard": {
    "title": "ADN Dashboard — Tailor-made AI web application",
    "shortDescription": "Tailor-made web application for ADN POTENTIEL: automated news monitoring by AI, post creation studio with real-time LinkedIn and Instagram preview, direct publication, and two separate user accounts.",
    "fullDescription": "Web application built from scratch to replace the n8n and Notion tools used by ADN POTENTIEL. Six modules: Home, Sleep, Studio, Calendar, API Costs and Settings. Gabriel and Loïc each have their own data on the same dashboard. Deployed on Vercel with a PostgreSQL database.",
    "category": "Web development",
    "tags": [
      "Next.js",
      "TypeScript",
      "Vercel",
      "Neon PostgreSQL",
      "OpenAI",
      "Instagram API",
      "LinkedIn API",
      "Apify"
    ],
    "company": "ADN POTENTIEL",
    "problem": "The automation tool used during the internship reached its monthly limit, blocking the day before. Notion did not allow previewing posts or posting to Instagram. The whole thing was fragile.",
    "solution": "A tailor-made web application deployed on Vercel, completely replacing the old tools: without execution limits, with realistic previews of posts before publication, and the possibility of publishing directly from the interface.",
    "impact": [
      "No more monthly limits — the watch runs every day without interruption",
      "Real-time LinkedIn and Instagram preview in the studio before publication",
      "Direct publishing to LinkedIn and Instagram from the app",
      "Two separate accounts: Gabriel and Loïc each have their own articles and posts",
      "LinkedIn engagement stats (likes, comments) retrieved automatically",
      "Choice of AI model (OpenAI, Anthropic, Perplexity) modifiable without touching the code",
      "Publication templates to vary formats (storytelling, list, lead magnet, etc.)"
    ],
    "challenges": [
      "LinkedIn statistics (likes, comments) are not accessible via the official API without LinkedIn validation — resolved with a third-party tool (Apify)",
      "Posting to Instagram requires the image to be hosted online before being sent — added an automatic hosting step",
      "Manage the expiration of LinkedIn connections and dynamically identify the author account"
    ],
    "learnings": [
      "Build a complete web application (front, back, database) with Next.js on Vercel",
      "Set up a secure home-made connection system, without a third-party auth library",
      "Finding alternatives when an official API is too restrictive",
      "The templates injected into the AI ​​prompts significantly improve the quality and consistency of the posts generated"
    ],
    "technologies": [
      {
        "name": "Next.js 16",
        "usage": "Web framework, automatic scheduled tasks, API"
      },
      {
        "name": "TypeScript",
        "usage": "Strict typing across the entire project"
      },
      {
        "name": "Neon PostgreSQL + Drizzle ORM",
        "usage": "Cloud database"
      },
      {
        "name": "JWT / bcryptjs",
        "usage": "Authentication and secure sessions"
      },
      {
        "name": "LinkedIn API v2",
        "usage": "Publication and monitoring of posts"
      },
      {
        "name": "Instagram Graph API",
        "usage": "Publication of photos and visuals"
      },
      {
        "name": "Apify",
        "usage": "Retrieving LinkedIn Engagement Statistics"
      },
      {
        "name": "OpenAI / Anthropic / Perplexity",
        "usage": "Analysis of articles, generation of posts"
      },
      {
        "name": "DALL-E / Gemini",
        "usage": "Generating images for posts"
      }
    ],
    "media": [
      {
        "url": "/projects/adn-dashboard/screentune-tutoriel.mp4",
        "caption": "ScreenTune Tutorial Video — Guided Demonstration of Dashboard DNA",
        "type": "video",
        "poster": "/projects/adn-dashboard/accueil.png"
      },
      {
        "url": "/projects/adn-dashboard/accueil.png",
        "caption": "Home — stats, yesterday's launch, template selector"
      },
      {
        "url": "/projects/adn-dashboard/veille.png",
        "caption": "Monitoring — articles analyzed by AI with impact score and filters"
      },
      {
        "url": "/projects/adn-dashboard/studio.png",
        "caption": "Studio — editor with real-time LinkedIn and Instagram preview"
      },
      {
        "url": "/projects/adn-dashboard/calendrier.png",
        "caption": "Calendar — history and schedule of publications"
      },
      {
        "url": "/projects/adn-dashboard/couts-api.png",
        "caption": "API Costs — tracking AI spend by service and operation"
      },
      {
        "url": "/projects/adn-dashboard/parametres.png",
        "caption": "Settings — RSS sources, prompts, AI models and templates"
      }
    ],
    "content": [
      {
        "type": "heading",
        "text": "Why this app?"
      },
      {
        "type": "paragraph",
        "text": "During the internship, automated monitoring ran on a third-party tool (n8n cloud). In February, the monthly limit was reached every month, blocking the day before. Notion stored the generated posts, but without preview and without being able to publish on Instagram."
      },
      {
        "type": "paragraph",
        "text": "The freelance mission was clear: build something solid to replace all that."
      },
      {
        "type": "heading",
        "text": "6 modules"
      },
      {
        "type": "list",
        "items": [
          "Home — Dashboard with stats for the week, launch button for the day before and template selector",
          "Monitoring — News articles filtered and scored by AI (1-10), with search, filters and draft generation in one click",
          "Studio — Post editor with real-time LinkedIn and Instagram preview, AI image generation, direct publishing",
          "Calendar — Monthly view of past and upcoming posts",
          "API Costs — Track AI spend by service (OpenAI, Gemini) and operation",
          "Settings — RSS sources, prompts, AI models, post templates, API keys"
        ]
      },
      {
        "type": "heading",
        "text": "Two users, separate data"
      },
      {
        "type": "paragraph",
        "text": "Gabriel and Loïc connect to the same dashboard with separate accounts. Everyone only sees their articles, posts and settings."
      },
      {
        "type": "heading",
        "text": "Some challenges"
      },
      {
        "type": "list",
        "items": [
          "LinkedIn does not provide access to stats (likes, comments) without special validation — bypassed with a third-party tool that automatically retrieves them",
          "Instagram requires the image to already be live at the time of posting — adding seamless staging"
        ]
      },
      {
        "type": "heading",
        "text": "Technical stack"
      },
      {
        "type": "paragraph",
        "text": "Next.js 16 · TypeScript · Neon PostgreSQL · Drizzle ORM · Vercel · JWT/bcryptjs · LinkedIn API · Instagram Graph API · Apify · OpenAI · Anthropic · Perplexity · DALL-E · Gemini"
      }
    ]
  },
  "mecenes-hdf-prospection-enrichissement": {
    "title": "Prospecting & Enrichment Patrons — Hauts-de-France",
    "shortDescription": "Automated workflow to identify potential corporate sponsors in Hauts-de-France and retrieve their key contacts (CSR, Communication, CEO) — 48 companies enriched in a few minutes.",
    "fullDescription": "n8n automation in two modes: Enrichment adds the contacts of companies already listed, Prospecting identifies new ones. The AI ​​(Gemini) searches for the names, emails and telephone numbers of those responsible. Results centralized in Google Sheets with a patronage sensitivity score.",
    "category": "Automation",
    "tags": [
      "n8n",
      "Gemini",
      "Papers API",
      "Google Sheets",
      "Prospecting",
      "AI"
    ],
    "company": "ADN POTENTIEL",
    "problem": "ADN POTENTIEL had to find corporate sponsors for its cultural actions in Hauts-de-France. Manually searching the contacts of dozens of companies (CSR, Communication, CEO) took a lot of time.",
    "solution": "A form-triggered workflow with two modes: Enrichment for already known companies, and Prospecting to find new ones. The AI ​​automatically completes the contacts and assigns a patronage sensitivity score.",
    "impact": [
      "48 companies enriched with CSR, Communication and CEO contacts (name, email, telephone)",
      "Sensitivity score from 1 to 5 stars to prioritize contacts",
      "~10 new companies identified per launch (2-3 minutes of execution)",
      "Zero manual searching — everything is automated",
      "Video tutorial delivered so the team can use it independently"
    ],
    "challenges": [
      "AI-generated contacts (emails, telephones) may be approximate — requires verification before sending",
      "Avoid duplicates during several successive launches on the same companies",
      "Some company names do not match any legal records — management of cases not found"
    ],
    "learnings": [
      "Build a conditional workflow with two execution paths from a single form",
      "Combining a forensic database and AI for more reliable results",
      "A workflow without a tutorial goes unused — documentation is as important as code"
    ],
    "technologies": [
      {
        "name": "n8n",
        "usage": "Workflow orchestration, trigger form, conditional logic"
      },
      {
        "name": "Gemini API",
        "usage": "Search for decision-making contacts, sponsorship scoring"
      },
      {
        "name": "Pappers API",
        "usage": "Verification and legal data of companies"
      },
      {
        "name": "Google Sheets",
        "usage": "Data storage and updating"
      }
    ],
    "media": [
      {
        "url": "/projects/mecenes-hdf-prospection-enrichissement/workflow.png",
        "caption": "n8n workflow — view of both modes (Prospecting at the top, Enrichment at the bottom)"
      }
    ],
    "content": [
      {
        "type": "heading",
        "text": "Two modes, one form"
      },
      {
        "type": "paragraph",
        "text": "The workflow is launched from a form with a “Mode” field. Depending on the choice, it takes two different paths."
      },
      {
        "type": "heading",
        "text": "Enrichment Mode"
      },
      {
        "type": "paragraph",
        "text": "For already known companies: a legal API (Pappers) finds the official company information, then Gemini searches for CSR, Communication and CEO contacts with their emails and telephone numbers. A second AI call assigns a sensitivity score to patronage."
      },
      {
        "type": "heading",
        "text": "Prospecting mode"
      },
      {
        "type": "paragraph",
        "text": "Without a starting list: Gemini generates around ten potential corporate sponsors in a given sector, then enriches each one as in Enrichment mode."
      },
      {
        "type": "heading",
        "text": "Data collected"
      },
      {
        "type": "list",
        "items": [
          "CSR: Name, Email, Telephone",
          "Communication: Name, Email, Telephone",
          "CEO: Name, Email, Phone",
          "Legal number and city",
          "Patronage sensitivity: ⭐ to ⭐⭐⭐⭐⭐"
        ]
      },
      {
        "type": "heading",
        "text": "Delivery"
      },
      {
        "type": "paragraph",
        "text": "Workflow delivered with a video tutorial so the DNA team can use it alone. Top Tip: Check AI-generated contacts before sending."
      }
    ]
  }
} as const
