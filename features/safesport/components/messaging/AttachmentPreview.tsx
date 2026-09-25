"use client"

import Image from "next/image";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { XIcon, SendIcon, FileIcon } from "lucide-react";


interface AttachmentPreviewProps {
  files: File[]
  type: "image" | "video" | "document"
  onSend: (caption: string) => void
  onCancel: () => void
}

export function AttachmentPreview({ files, type, onSend, onCancel }: AttachmentPreviewProps) {
  const [caption, setCaption] = useState("")

  const renderPreview = (file: File, index: number) => {
    const url = URL.createObjectURL(file)

    if (type === "image") {
      return (
        <div key={index} className="relative rounded-lg overflow-hidden bg-muted">
          <Image width={640} height={480} unoptimized
            src={url}
            alt={file.name}
            className="w-full h-48 object-contain"
            onLoad={() => URL.revokeObjectURL(url)}
          />
        </div>
      )
    }

    if (type === "video") {
      return (
        <div key={index} className="relative rounded-lg overflow-hidden bg-black">
          <video
            src={url}
            className="w-full h-48 object-contain"
            controls
            onLoadedData={() => URL.revokeObjectURL(url)}
          />
        </div>
      )
    }

    // Document preview
    return (
      <Card key={index} className="p-4">
        <div className="flex items-center gap-3">
          <FileIcon className="size-10 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          {type === "image" && "Send Image"}
          {type === "video" && "Send Video"}
          {type === "document" && "Send Document"}
          {files.length > 1 && ` (${files.length})`}
        </h3>
        <Button size="icon" variant="ghost" onClick={onCancel}>
          <XIcon className="size-4" />
        </Button>
      </div>

      <div className="grid gap-2 max-h-64 overflow-y-auto">
        {files.map((file, index) => renderPreview(file, index))}
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Add a message..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSend(caption)
            }
          }}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={() => onSend(caption)}
            className="bg-primary hover:bg-primary/90"
          >
            <SendIcon className="size-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </Card>
  )
}
