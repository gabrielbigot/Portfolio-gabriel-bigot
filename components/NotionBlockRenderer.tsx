"use client"

import Image from "next/image"
import { Check, ChevronRight } from "lucide-react"
import { useState } from "react"
import ImageModal from "./ImageModal"

interface NotionBlock {
  type: string
  text?: string
  items?: any[]
  icon?: string
  language?: string
  url?: string
  caption?: string
  children?: NotionBlock[]
  rows?: string[][]
  has_column_header?: boolean
  has_row_header?: boolean
  columns?: NotionBlock[][]
}

interface NotionBlockRendererProps {
  content: NotionBlock[]
}

export default function NotionBlockRenderer({ content }: NotionBlockRendererProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    caption: string
  } | null>(null)

  if (!content || content.length === 0) {
    return null
  }

  const handleImageClick = (url: string, caption: string) => {
    setSelectedImage({ url, caption })
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedImage(null)
  }

  return (
    <>
      <div className="space-y-6">
        {content.map((block, index) => (
          <BlockItem key={index} block={block} onImageClick={handleImageClick} />
        ))}
      </div>

      {selectedImage && (
        <ImageModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          imageSrc={selectedImage.url}
          imageAlt={selectedImage.caption}
          title={selectedImage.caption}
        />
      )}
    </>
  )
}

function BlockItem({ block, onImageClick }: { block: NotionBlock; onImageClick?: (url: string, caption: string) => void }) {
  switch (block.type) {
    case "heading_1":
      return (
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight mt-12 mb-6 first:mt-0">
          {block.text}
        </h1>
      )

    case "heading_2":
      return (
        <h2 className="text-2xl sm:text-3xl font-light tracking-tight mt-10 mb-5 first:mt-0">
          {block.text}
        </h2>
      )

    case "heading_3":
      return (
        <h3 className="text-xl sm:text-2xl font-light tracking-tight mt-8 mb-4 first:mt-0">
          {block.text}
        </h3>
      )

    case "paragraph":
      return (
        <p className="text-lg text-muted-foreground leading-relaxed">
          {block.text}
        </p>
      )

    case "bulleted_list":
      return (
        <ul className="space-y-3 ml-6">
          {block.items?.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 text-lg text-muted-foreground leading-relaxed"
            >
              <span className="text-foreground/50 mt-1.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )

    case "numbered_list":
      return (
        <ol className="space-y-3 ml-6 list-decimal">
          {block.items?.map((item, i) => (
            <li
              key={i}
              className="text-lg text-muted-foreground leading-relaxed pl-2"
            >
              {item}
            </li>
          ))}
        </ol>
      )

    case "todo_list":
      return (
        <ul className="space-y-3">
          {block.items?.map((item, i) => (
            <li key={i} className="flex gap-3 items-start">
              <div
                className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-1 ${
                  item.checked
                    ? "bg-foreground border-foreground"
                    : "border-border"
                }`}
              >
                {item.checked && <Check className="w-3 h-3 text-background" />}
              </div>
              <span
                className={`text-lg leading-relaxed ${
                  item.checked
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
              >
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      )

    case "quote":
      return (
        <blockquote className="border-l-4 border-foreground/20 pl-6 py-2 my-6">
          <p className="text-xl italic text-muted-foreground leading-relaxed">
            {block.text}
          </p>
        </blockquote>
      )

    case "callout":
      return (
        <div className="p-6 bg-foreground/[0.03] border border-border rounded-lg flex gap-4">
          <span className="text-2xl flex-shrink-0">{block.icon}</span>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {block.text}
          </p>
        </div>
      )

    case "code":
      return (
        <div className="my-6">
          <pre className="p-6 bg-foreground/[0.05] border border-border rounded-lg overflow-x-auto">
            <code className="text-sm font-mono text-foreground">
              {block.text}
            </code>
          </pre>
          {block.language && block.language !== "plaintext" && (
            <div className="text-xs text-muted-foreground mt-2 font-mono">
              {block.language}
            </div>
          )}
        </div>
      )

    case "divider":
      return <hr className="my-12 border-border" />

    case "image":
      return (
        <figure className="my-8">
          <div
            className="relative w-full aspect-video rounded-lg overflow-hidden border border-border cursor-pointer hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-lg group"
            onClick={() => onImageClick?.(block.url || "", block.caption || "")}
          >
            <Image
              src={block.url || ""}
              alt={block.caption || ""}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
          {block.caption && (
            <figcaption className="text-sm text-muted-foreground text-center mt-3">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )

    case "toggle":
      return <ToggleBlock block={block} onImageClick={onImageClick} />

    case "table":
      return <TableBlock block={block} />

    case "column_list":
      return <ColumnList block={block} onImageClick={onImageClick} />

    case "video":
      return <VideoBlock block={block} />

    case "embed":
      return <EmbedBlock block={block} />

    default:
      return null
  }
}

function ToggleBlock({ block, onImageClick }: { block: NotionBlock; onImageClick?: (url: string, caption: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="my-4 border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center gap-3 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors text-left"
      >
        <ChevronRight
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
        />
        <span className="text-lg font-medium">{block.text}</span>
      </button>
      {isOpen && block.children && block.children.length > 0 && (
        <div className="px-6 py-4 space-y-4 border-t border-border">
          {block.children.map((child, index) => (
            <BlockItem key={index} block={child} onImageClick={onImageClick} />
          ))}
        </div>
      )}
    </div>
  )
}

function TableBlock({ block }: { block: NotionBlock }) {
  if (!block.rows || block.rows.length === 0) return null

  const hasColumnHeader = block.has_column_header
  const hasRowHeader = block.has_row_header

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
        {hasColumnHeader && block.rows.length > 0 && (
          <thead>
            <tr className="bg-foreground/[0.05]">
              {block.rows[0].map((cell, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-sm font-semibold border-b border-r border-border last:border-r-0"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {block.rows.slice(hasColumnHeader ? 1 : 0).map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-border last:border-b-0 hover:bg-foreground/[0.02] transition-colors"
            >
              {row.map((cell, cellIndex) => {
                const isRowHeader = hasRowHeader && cellIndex === 0
                const CellTag = isRowHeader ? "th" : "td"

                return (
                  <CellTag
                    key={cellIndex}
                    className={`px-4 py-3 text-sm border-r border-border last:border-r-0 ${
                      isRowHeader ? "font-semibold bg-foreground/[0.03]" : ""
                    }`}
                  >
                    {cell}
                  </CellTag>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ColumnList({ block, onImageClick }: { block: NotionBlock; onImageClick?: (url: string, caption: string) => void }) {
  if (!block.columns || block.columns.length === 0) return null

  const columnCount = block.columns.length
  const gridCols =
    columnCount === 2
      ? "grid-cols-1 md:grid-cols-2"
      : columnCount === 3
      ? "grid-cols-1 md:grid-cols-3"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"

  return (
    <div className={`grid ${gridCols} gap-6 my-6`}>
      {block.columns.map((column, index) => (
        <div key={index} className="space-y-4">
          {column.length > 0 && column.map((child, childIndex) => (
            <BlockItem key={childIndex} block={child} onImageClick={onImageClick} />
          ))}
        </div>
      ))}
    </div>
  )
}

function VideoBlock({ block }: { block: NotionBlock }) {
  if (!block.url) return null

  // Check if it's a YouTube video
  const isYouTube = block.url.includes("youtube.com") || block.url.includes("youtu.be")

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const youtubeId = isYouTube ? getYouTubeId(block.url) : null

  return (
    <figure className="my-8">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-foreground/5">
        {isYouTube && youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <video
            src={block.url}
            controls
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}
      </div>
      {block.caption && (
        <figcaption className="text-sm text-muted-foreground text-center mt-3">
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}

function EmbedBlock({ block }: { block: NotionBlock }) {
  if (!block.url) return null

  // Check if it's a video embed (YouTube, Vimeo, etc.)
  const isYouTube = block.url.includes("youtube.com") || block.url.includes("youtu.be")
  const isVimeo = block.url.includes("vimeo.com")
  const isLoom = block.url.includes("loom.com")

  // Extract video ID for different platforms
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const getVimeoId = (url: string) => {
    const regExp = /vimeo.com\/(\d+)/
    const match = url.match(regExp)
    return match ? match[1] : null
  }

  const getLoomId = (url: string) => {
    const regExp = /loom.com\/share\/([a-zA-Z0-9]+)/
    const match = url.match(regExp)
    return match ? match[1] : null
  }

  let embedUrl = block.url

  if (isYouTube) {
    const videoId = getYouTubeId(block.url)
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`
  } else if (isVimeo) {
    const videoId = getVimeoId(block.url)
    if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`
  } else if (isLoom) {
    const videoId = getLoomId(block.url)
    if (videoId) embedUrl = `https://www.loom.com/embed/${videoId}`
  }

  return (
    <figure className="my-8">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-foreground/5">
        <iframe
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
      {block.caption && (
        <figcaption className="text-sm text-muted-foreground text-center mt-3">
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}
