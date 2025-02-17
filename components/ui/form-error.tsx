import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
interface FormErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export function FormError({ message, className, ...props }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "mt-2 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive",
        className,
      )}
      {...props}
    >
      <AlertCircle className="h-22 w-22" />
      {message}
    </div>
  );
}
