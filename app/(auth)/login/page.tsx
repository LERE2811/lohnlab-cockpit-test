"use client";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorMessage = searchParams.get("error");
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError("E-Mail oder Passwort ist falsch.");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.");
        } else {
          setError(
            "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
          );
        }
        return;
      }
      router.push("/dashboard");
    } catch (error) {
      setError(
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      );
      console.error("Error logging in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold">
              Lohn Cockpit
            </CardTitle>
            <CardDescription className="text-center">
              Bitte melden Sie sich mit Ihren Anmeldeinformationen an.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && <FormError message={error} />}
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="E-Mail eingeben..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Passwort eingeben.."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Link className="text-sm text-gray-500" href="/forgot-password">
                  Passwort vergessen?
                </Link>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Einloggen..." : "Einloggen"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Suspense>
  );
}
