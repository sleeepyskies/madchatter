import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface EditResourceHeaderProps {
  children?: React.ReactNode;
}

export function EditResourceHeader({ children }: { children?: React.ReactNode }) {
  const router = useRouter();

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center h-16 shrink-0 border-b px-6">
      <div className="flex justify-start">
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-9 px-2 text-muted-foreground hover:text-foreground transition"
          onClick={router.back}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {children && (
        <div className="flex justify-center">
          {children}
        </div>
      )}

      <div />
    </header>
  );
}
