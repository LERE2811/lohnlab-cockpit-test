import { cn } from "@/lib/utils"

interface FormErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export function FormError({ message, className, ...props }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "text-sm font-medium text-destructive bg-destructive/10 rounded-md px-3 py-2 mt-2",
        className
      )}
      {...props}
    >
      {message}
    </div>
  );
} 