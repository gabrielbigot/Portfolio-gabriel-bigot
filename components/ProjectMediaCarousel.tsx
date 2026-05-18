"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { ImageIcon, Play, Video } from "lucide-react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

type ProjectMediaItem = {
  url: string
  caption?: string
  type?: "image" | "video"
  poster?: string
}

type ProjectMediaCarouselProps = {
  media: ProjectMediaItem[]
}

const videoExtensions = [".mp4", ".webm", ".mov", ".m4v", ".ogg"]

function getMediaType(item: ProjectMediaItem) {
  if (item.type) return item.type
  const url = item.url.toLowerCase().split("?")[0]
  return videoExtensions.some((extension) => url.endsWith(extension)) ? "video" : "image"
}

export default function ProjectMediaCarousel({ media }: ProjectMediaCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const items = useMemo(
    () => media.map((item) => ({ ...item, type: getMediaType(item) })),
    [media],
  )

  useEffect(() => {
    if (!api) return

    const updateSelectedIndex = () => {
      setSelectedIndex(api.selectedScrollSnap())
    }

    updateSelectedIndex()
    api.on("select", updateSelectedIndex)
    api.on("reInit", updateSelectedIndex)

    return () => {
      api.off("select", updateSelectedIndex)
      api.off("reInit", updateSelectedIndex)
    }
  }, [api])

  if (items.length === 0) return null

  const selectedItem = items[selectedIndex]

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl sm:text-3xl font-light">Médias</h2>
        <div className="text-sm text-muted-foreground font-mono">
          {String(selectedIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </div>
      </div>

      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: items.length > 1 }}
        className="relative"
      >
        <CarouselContent className="-ml-0">
          {items.map((item, index) => (
            <CarouselItem key={`${item.url}-${index}`} className="pl-0">
              <figure className="space-y-3">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-foreground/[0.02]">
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      poster={item.poster}
                      controls
                      preload="metadata"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Image
                      src={item.url}
                      alt={item.caption ?? `Capture d'écran ${index + 1}`}
                      fill
                      sizes="(min-width: 1024px) 720px, calc(100vw - 48px)"
                      className="object-contain"
                      unoptimized
                    />
                  )}
                </div>

                {item.caption && (
                  <figcaption className="text-sm text-muted-foreground text-center">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>

        {items.length > 1 && (
          <>
            <CarouselPrevious className="left-3 top-[calc(50%-1rem)] bg-background/90 backdrop-blur border-border hover:bg-background" />
            <CarouselNext className="right-3 top-[calc(50%-1rem)] bg-background/90 backdrop-blur border-border hover:bg-background" />
          </>
        )}
      </Carousel>

      {items.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item, index) => (
            <button
              key={`thumb-${item.url}-${index}`}
              type="button"
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border bg-foreground/[0.02] transition-colors",
                selectedIndex === index
                  ? "border-foreground"
                  : "border-border hover:border-muted-foreground/60",
              )}
              aria-label={`Afficher le média ${index + 1}`}
            >
              {item.type === "video" ? (
                <>
                  {item.poster ? (
                    <Image
                      src={item.poster}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Video className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                    <Play className="h-4 w-4 fill-current" />
                  </div>
                </>
              ) : (
                <Image
                  src={item.url}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              )}
            </button>
          ))}
        </div>
      )}

      {selectedItem?.caption && (
        <p className="sr-only" aria-live="polite">
          {selectedItem.caption}
        </p>
      )}
    </section>
  )
}
