"use client"

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon, PlayIcon } from "lucide-react";
import type { Attachment } from "../../types/messaging";

interface VideoMessageProps {
  attachment: Attachment
  isCurrentUser?: boolean
}

export function VideoMessage({ attachment }: VideoMessageProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showControls, setShowControls] = useState(false)

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = attachment.url
    link.download = attachment.fileName
    link.click()
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="group relative max-w-md rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={attachment.url}
        poster={attachment.thumbnailUrl}
        controls={showControls}
        className="w-full h-auto max-h-96 bg-black rounded-lg"
        onPlay={() => setShowControls(true)}
        controlsList="nodownload"
        preload="metadata"
      >
        Your browser does not support video playback.
      </video>

      {!showControls && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => {
              videoRef.current?.play()
              setShowControls(true)
            }}
            className="flex items-center justify-center size-16 rounded-full bg-primary/90 hover:bg-primary transition-colors backdrop-blur-sm"
          >
            <PlayIcon className="size-8 text-primary-foreground fill-current ml-1" />
          </button>
        </div>
      )}

      {attachment.duration && !showControls && (
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-background/80 backdrop-blur-sm text-xs font-medium">
          {formatDuration(attachment.duration)}
        </div>
      )}

      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation()
          handleDownload()
        }}
      >
        <DownloadIcon className="size-4" />
      </Button>

      {attachment.uploadStatus === "uploading" && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="h-1 bg-background/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${attachment.uploadProgress || 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
