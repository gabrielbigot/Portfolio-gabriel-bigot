type ContentSection = {
  type: "heading" | "paragraph" | "list" | "quote" | "code"
  text?: string
  items?: string[]
}

export default function BlogContentRenderer({ content }: { content: ContentSection[] }) {
  if (!content || content.length === 0) return null

  return (
    <div className="space-y-6">
      {content.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                key={i}
                className="text-2xl sm:text-3xl font-light tracking-tight mt-12 mb-5 first:mt-0"
              >
                {block.text}
              </h2>
            )
          case "paragraph":
            return (
              <p key={i} className="text-lg text-muted-foreground leading-relaxed">
                {block.text}
              </p>
            )
          case "list":
            return (
              <ul key={i} className="space-y-3 ml-6">
                {block.items?.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-3 text-lg text-muted-foreground leading-relaxed"
                  >
                    <span className="text-foreground/50 mt-1.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-4 border-foreground/20 pl-6 py-2 my-6"
              >
                <p className="text-xl italic text-muted-foreground leading-relaxed">
                  {block.text}
                </p>
              </blockquote>
            )
          case "code":
            return (
              <div key={i} className="my-6">
                <pre className="p-6 bg-foreground/[0.05] border border-border rounded-lg overflow-x-auto">
                  <code className="text-sm font-mono text-foreground whitespace-pre">
                    {block.text}
                  </code>
                </pre>
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
