import { useContext } from "react";
import { OnboardingContext } from "./context";

// Hook für den einfachen Zugriff auf den Kontext
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
