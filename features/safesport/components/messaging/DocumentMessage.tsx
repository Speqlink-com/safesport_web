"use client"


import { Card } from "@/components/ui/card";
import { FileTextIcon, DownloadIcon, Loader2Icon } from "lucide-react";
import type { Attachment } from "../../types/messaging";

interface DocumentMessageProps {
  attachment: Attachment
  isCurrentUser?: boolean
}

export function DocumentMessage({ attachment, isCurrentUser }: DocumentMessageProps) {
  const getFileIcon = () => {

    // All documents get the same PDF-style icon for consistency
    return <FileTextIcon className="size-10 text-white" />
  }

  const getFileInfo = () => {
    const ext = attachment.fileName.match(/\.([^.]+)$/)?.[1]?.toUpperCase() || "FILE"
    const sizeMB = (attachment.fileSize / 1024 / 1024).toFixed(1)
    
    // Check if it's a PDF and has pages info (you can extend this)
    if (ext === "PDF") {
      return `PDF · ${sizeMB} MB`
    }
    
    return `${ext} · ${sizeMB} MB`
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = attachment.url
    link.download = attachment.fileName
    link.click()
  }

  return (
    <Card 
      className={`max-w-sm p-4 cursor-pointer transition-colors hover:opacity-90 ${
        isCurrentUser 
          ? "bg-primary/10 border-primary/20" 
          : "bg-muted"
      }`}
      onClick={handleDownload}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 size-12 rounded-lg bg-red-500 flex items-center justify-center">
          {getFileIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate mb-0.5">
            {attachment.fileName}
          </p>
          <p className="text-xs text-muted-foreground">
            {getFileInfo()}
          </p>
        </div>

        {attachment.uploadStatus === "uploading" ? (
          <Loader2Icon className="size-5 animate-spin text-muted-foreground shrink-0" />
        ) : attachment.uploadStatus === "failed" ? (
          <div className="text-xs text-destructive shrink-0">
            Failed
          </div>
        ) : (
          <DownloadIcon className="size-5 text-muted-foreground shrink-0" />
        )}
      </div>
    </Card>
  )
}
