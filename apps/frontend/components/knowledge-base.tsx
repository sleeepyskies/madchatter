"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  UploadCloud,
  FileText,
  Trash2,
  FileCode,
  Presentation,
} from "lucide-react";
import { toast } from "sonner";

export function KnowledgeBaseStep() {
  const [activeTab, setActiveTab] = useState("file");
  const [manualText, setManualText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    if (value === "text") {
      setUploadedFiles([]);
    }

    if (value === "file") {
      setManualText("");
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(Array.from(files));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(Array.from(files));
    }
  };

  const addFiles = (files: File[]) => {
    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const validFiles = files.filter((file) => {
      return allowedTypes.includes(file.type) || file.name.endsWith(".txt");
    });

    if (validFiles.length !== files.length) {
      toast.error("Only PDF, TXT, and Word files are supported.", {
        position: "top-center",
      });
    }

    setUploadedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (indexToRemove: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl w-full border rounded-xl p-6 bg-background shadow-sm">
      <div>
        <p className="text-xs text-muted-foreground">
          Provide background knowledge for your chatebot.
        </p>
        <p className="text-xs text-muted-foreground">
          Please choose one method only (File Upload / Text Input)
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/60 p-1 rounded-lg">
          <TabsTrigger value="file" className="text-xs py-1.5 rounded-md">
            File Upload
          </TabsTrigger>
          <TabsTrigger value="text" className="text-xs py-1.5 rounded-md">
            Text Input
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="file"
          className="flex flex-col gap-4 focus-visible:outline-none"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".txt,.pdf,.doc,.docx"
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-primary bg-primary/5 text-primary scale-[0.99]"
                : "border-slate-200 hover:border-primary/50 hover:bg-muted/30 text-muted-foreground"
            }`}
          >
            <div
              className={`p-3 rounded-full border border-dashed transition-colors ${isDragging ? "bg-background border-primary" : "bg-muted"}`}
            >
              <UploadCloud
                className={`h-6 w-6 ${isDragging ? "text-primary" : "text-muted-foreground"}`}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag & drop the file here
              </p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Supports PDF, Word, TXT files.
              </p>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30 text-sm group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-primary/80" />
                    <span className="truncate font-medium text-xs text-foreground/80">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="text" className="focus-visible:outline-none">
          <Textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Paste or type your knowledge base content here..."
            className="min-h-[180px] text-sm border-slate-200 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 resize-none rounded-lg p-3"
          />
          <div className="flex justify-between items-center mt-2 text-[11px] text-muted-foreground px-1"></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
