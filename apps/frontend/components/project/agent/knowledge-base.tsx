/**
 * UI component for managing the knowledge base of agent.
 */
"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, FileText, Trash2 } from "lucide-react";
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
    <div className="flex flex-col gap-3 w-full border rounded-lg p-3 bg-background shadow-sm">
      {/* helper text */}
      <div className="space-y-0.5">
        <p className="text-[12px] text-muted-foreground leading-tight">
          Provide background knowledge for your chatbot.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="flex w-full gap-1 bg-muted/30 p-1 rounded-lg">
          <TabsTrigger
            value="file"
            className="flex-1 text-xs py-1 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-muted-foreground"
          >
            File
          </TabsTrigger>

          <TabsTrigger
            value="text"
            className="flex-1 text-xs py-1 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-muted-foreground"
          >
            Text
          </TabsTrigger>
        </TabsList>

        {/* file upload */}
        <TabsContent value="file" className="flex flex-col gap-3">
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
            className={`border rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-slate-200 hover:border-primary/40 hover:bg-muted/20"
            }`}
          >
            <div className="p-2 rounded-full border bg-muted">
              <UploadCloud className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="text-center">
              <p className="text-xs font-medium">Upload or drag & drop files</p>
              <p className="text-[11px] text-muted-foreground">
                PDF / Word / TXT
              </p>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto pr-1">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md border bg-muted/20 text-xs group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* text input*/}
        <TabsContent value="text">
          <Textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Paste your knowledge base..."
            className="min-h-[120px] text-sm border-slate-200 resize-none rounded-md p-2"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
