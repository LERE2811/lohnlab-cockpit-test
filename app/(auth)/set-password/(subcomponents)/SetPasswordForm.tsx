"use client";
import { User } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { toast } from "@/hooks/use-toast";

const SetPasswordForm = ({ user }: { user: User }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      toast({
        title: "Passwort erfolgreich gesetzt",
      });
      router.push("/dashboard");
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Passwort setzen</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          {error && <FormError message={error} />}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Neues Passwort</Label>
              <Input
                type="password"
                id="password"
                placeholder="Passwort eingeben..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                type="password"
                id="confirmPassword"
                placeholder="Passwort bestätigen..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Passwort setzen..." : "Passwort setzen"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SetPasswordForm;
