"use client"

import Image from "next/image";
import { useState } from "react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import type { Attachment } from "../../types/messaging";

interface ImageMessageProps {
  attachment: Attachment
  isCurrentUser?: boolean
}

export function ImageMessage({ attachment }: ImageMessageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = attachment.url
    link.download = attachment.fileName
    link.click()
  }

  if (imageError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 max-w-sm">
        <p className="text-sm text-destructive">Failed to load image</p>
        <p className="text-xs text-muted-foreground mt-1">{attachment.fileName}</p>
      </div>
    )
  }

  return (
    <Dialog>
      <div className="group relative max-w-md">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
        
        <DialogTrigger>
          <button className="relative block rounded-lg overflow-hidden cursor-pointer hover:opacity-95 transition-opacity">
            <Image width={640} height={480} unoptimized
              src={attachment.url}
              alt={attachment.fileName}
              className="w-full h-auto max-h-96 object-contain rounded-lg"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </button>
        </DialogTrigger>

        {imageLoaded && (
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
        )}

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

      <DialogContent className="max-w-4xl p-0">
        <div className="relative">
          <Image width={640} height={480} unoptimized
            src={attachment.url}
            alt={attachment.fileName}
            className="w-full h-auto max-h-[85vh] object-contain"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{attachment.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button onClick={handleDownload}>
                <DownloadIcon className="size-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
