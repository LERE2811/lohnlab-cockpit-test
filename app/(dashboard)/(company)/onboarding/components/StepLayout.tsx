"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepNavigation } from "./StepNavigation";
import { useOnboarding } from "../context/onboarding-context";

interface StepLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  onSave?: () => Promise<void>;
  onComplete?: () => Promise<void>;
  disableNext?: boolean;
}

export const StepLayout = ({
  title,
  description,
  children,
  onSave,
  onComplete,
  disableNext,
}: StepLayoutProps) => {
  const { isLoading } = useOnboarding();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="h-8 w-64 animate-pulse rounded bg-muted-foreground/20" />
          {description && (
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted-foreground/20" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-12 w-full animate-pulse rounded bg-muted-foreground/20"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {children}
          <StepNavigation
            onSave={onSave}
            onComplete={onComplete}
            disableNext={disableNext}
          />
        </div>
      </CardContent>
    </Card>
  );
};
