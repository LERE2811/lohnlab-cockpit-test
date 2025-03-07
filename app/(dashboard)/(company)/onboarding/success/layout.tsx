import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding abgeschlossen | LohnLab",
  description: "Onboarding erfolgreich abgeschlossen",
};

export default function OnboardingSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {children}
    </div>
  );
}
