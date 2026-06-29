"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateVideoRequest } from "@/api/videos";

interface FormValues {
  label: string;
  description: string;
  includesAudio: boolean;
  file?: FileList;
}

interface VideoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUploading: boolean;
  projectId: number;
  onSubmit: (data: CreateVideoRequest) => Promise<void>;
  initialData?: {
    id: number;
    label: string;
    description: string;
    includesAudio: boolean;
  };
}

export function VideoFormModal({
  isOpen,
  onClose,
  isUploading,
  projectId,
  onSubmit,
  initialData,
}: VideoFormModalProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      label: initialData?.label || "",
      description: initialData?.description || "",
      includesAudio: initialData?.includesAudio || false,
    },
  });

  const fileWatch = watch("file");
  const hasFile = fileWatch && fileWatch.length > 0;

  React.useEffect(() => {
    if (hasFile) {
      const fileName = fileWatch[0].name.replace(/\.[^/.]+$/, "");
      setValue("label", fileName, { shouldValidate: true });
    }
  }, [fileWatch, hasFile, setValue]);

  React.useEffect(() => {
    if (isOpen) {
      reset({
        label: initialData?.label || "",
        description: initialData?.description || "",
        includesAudio: initialData?.includesAudio || false,
      });
    }
  }, [isOpen, initialData, reset]);

  const onFormSubmit = (data: FormValues) => {
    onSubmit({
      label: data.label,
      description: data.description,
      includesAudio: data.includesAudio,
      projectId: projectId,
      file: data.file?.[0] as File,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl w-full min-h-[600px] flex flex-col justify-between">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>{isEdit ? "Edit Video" : "Add New Video"}</DialogTitle>
              <DialogDescription>
                {isEdit ? "Update your video configuration." : "Select and configure a video."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {!isEdit && (
                <div className="space-y-1.5">
                  <Label htmlFor="file" className="text-sm font-semibold text-foreground">VIDEO</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="video/*"
                    className={errors.file ? "border-destructive" : ""}
                    {...register("file", { required: "A video file is required" })}
                  />
                  {errors.file && <p className="text-xs font-medium text-destructive">{errors.file.message}</p>}
                </div>
              )}

              <div className="flex items-center space-x-2 py-1">
                <Controller
                  name="includesAudio"
                  control={control}
                  render={({ field }) => (
                    <Checkbox id="includesAudio" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="includesAudio" className="text-sm font-medium cursor-pointer">Includes Audio</Label>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="label" className="text-sm font-semibold text-foreground">Title</Label>
                <Input
                  id="label"
                  {...register("label", { required: "Title is required", maxLength: 150 })}
                  placeholder="Enter title..."
                  className={errors.label ? "border-destructive" : ""}
                />
                {errors.label && <p className="text-xs font-medium text-destructive">{errors.label.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground">Description</Label>
                <Textarea
                  id="description"
                  {...register("description", { required: "Description is required" })}
                  placeholder="Enter Description..."
                  className={`min-h-[200px] ${errors.description ? "border-destructive" : ""}`}
                />
                {errors.description && <p className="text-xs font-medium text-destructive">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isUploading}>Cancel</Button>
            <Button type="submit" disabled={isUploading} className="gap-1.5">
              <Upload className="h-4 w-4" />
              {isUploading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
