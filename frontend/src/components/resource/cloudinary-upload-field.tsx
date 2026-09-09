import { useCallback, useRef, useState } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

interface CloudinaryUploadFieldProps {
  value?: string | null;
  onChange: (result: CloudinaryUploadResult | null) => void;
  disabled?: boolean;
}

interface CloudinaryWidgetResult {
  event: string;
  info?: { secure_url: string; public_id: string };
}

interface CloudinaryWidget {
  open: () => void;
}

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: CloudinaryWidgetResult) => void
      ) => CloudinaryWidget;
    };
  }
}

export function CloudinaryUploadField({ value, onChange, disabled }: CloudinaryUploadFieldProps) {
  const widgetRef = useRef<CloudinaryWidget | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const openWidget = useCallback(() => {
    if (!window.cloudinary) {
      toast.error("Upload widget failed to load. Please refresh the page.");
      return;
    }

    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUD_NAME,
          uploadPreset: UPLOAD_PRESET,
          sources: ["local", "url", "camera", "image_search"],
          multiple: false,
          cropping: true,
        },
        (error, result) => {
          if (error) {
            setIsUploading(false);
            toast.error("Upload failed");
            return;
          }
          if (result?.event === "success" && result.info) {
            onChange({ url: result.info.secure_url, publicId: result.info.public_id });
            setIsUploading(false);
          }
          if (result?.event === "close") {
            setIsUploading(false);
          }
        }
      );
    }

    setIsUploading(true);
    widgetRef.current.open();
  }, [onChange]);

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-fit">
          <img src={value} alt="Banner" className="h-32 w-auto rounded-md border object-cover" />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              className="absolute -right-2 -top-2 rounded-full"
              onClick={() => onChange(null)}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex h-32 w-48 items-center justify-center rounded-md border border-dashed text-muted-foreground">
          <ImageIcon className="size-6" />
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || isUploading}
        onClick={openWidget}
      >
        {isUploading ? <Loader2 className="size-4 animate-spin" /> : null}
        {isUploading ? "Uploading..." : value ? "Replace image" : "Upload image"}
      </Button>
    </div>
  );
}
