"use client";

import { useCallback, useState } from "react";
import { Upload, FileArchive, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { projectsApi } from "@/api/projects";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.name.endsWith(".zip")) return;
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const f = e.dataTransfer.files?.[0];
    handleFile(f);
  }, []);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] || null);
  };

  const upload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      await projectsApi.importProject(file);
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-6">
      <Card
        className={`w-full rounded-xl max-w-lg p-8 border-dashed transition ${dragActive ? "border-primary bg-primary/5" : ""
          }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <Upload className="w-10 h-10 text-muted-foreground" />

          <div>
            <h2 className="text-xl font-semibold">Import project</h2>
            <p className="text-sm text-muted-foreground">
              Drop a .zip file or click to upload
            </p>
          </div>

          <input
            type="file"
            accept=".zip"
            className="hidden"
            id="zip-upload"
            onChange={onSelect}
          />

          <label htmlFor="zip-upload">
            <Button asChild>
              <span className="cursor-pointer">Select ZIP</span>
            </Button>
          </label>

          {file && (
            <>
              <div className="w-full mt-4 flex items-center justify-between bg-muted p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <FileArchive className="w-4 h-4" />
                  <span className="text-sm truncate max-w-[250px]">
                    {file.name}
                  </span>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <Button
                className="w-full mt-2"
                onClick={upload}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Upload ZIP"}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
