"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabase/client";
import * as icons from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleResetPassword = async () => {
    if (!email.trim() as boolean) {
      setMessage({
        type: "error",
        text: "Bitte geben Sie Ihre E-Mail-Adresse ein.",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${SITE_URL}/auth/reset_password?invite=false`,
        },
      );

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Eine E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts wurde gesendet.",
      });
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      setMessage({
        type: "error",
        text: "Fehler beim Senden der Zurücksetzungs-E-Mail. Bitte versuchen Sie es erneut.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Passwort zurücksetzen</CardTitle>
        </CardHeader>

        <form
          method="dialog"
          onSubmit={(e) => {
            e.preventDefault();
            handleResetPassword();
          }}
        >
          <CardContent>
            {message && (
              <div
                className={`mb-[16px] flex items-center gap-[12px] self-stretch rounded-[4px] px-[16px] py-[6px] ${
                  message.type === "success"
                    ? "bg-[--Success-Alert-Background] text-[--Success-Alert-Content]"
                    : "bg-[--Error-Alert-Background] text-[--Error-Alert-Content]"
                }`}
              >
                <div className="py-[7px]">
                  {message.type === "success" ? (
                    <icons.CheckCircle
                      className="text-[--Success-Main]"
                      width={22}
                    />
                  ) : (
                    <icons.AlertCircle
                      className="text-[--Error-Main]"
                      width={22}
                    />
                  )}
                </div>
                <div className="py-[8px] text-[14px]/[143%] font-[400]">
                  {message.text}
                </div>
              </div>
            )}

            <Input
              placeholder="just@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </CardContent>
          <CardFooter>
            <div className="flex w-full justify-center gap-[16px]">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/login")}
              >
                Zurück zur Anmeldung
              </Button>
              <Button
                type="submit"
                onClick={handleResetPassword}
                disabled={isLoading || !email.trim().includes("@")}
              >
                {isLoading ? "Wird gesendet..." : "Passwort zurücksetzen"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
