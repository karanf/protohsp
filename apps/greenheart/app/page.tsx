"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@repo/ui/components/ui/alert";
import { authenticate } from './actions';

function HomeContent() {
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const handleEnterClick = async () => {
    if (!password) {
      setError("Please enter a password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await authenticate(password);
      if (result.success) {
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          router.push("/sevis-user");
        }
      } else {
        setError(result.error || "Invalid password");
      }
    } catch (err) {
      setError("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center relative">      
      <div className="flex flex-col items-center gap-6 max-w-2xl">
        <Alert variant="info" className="mt-8 w-full">
          <AlertTitle>Please enter password to continue</AlertTitle>
          <AlertDescription>
            This prototype is only accessible to authorised users. Please contact the person who has shared the link with you to get access.
          </AlertDescription>
        </Alert>
        <div className="flex items-center gap-2 w-full justify-center">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEnterClick()}
            className="w-[200px] h-10"
          />
          <Button 
            variant="default" 
            className="h-10" 
            onClick={handleEnterClick}
            disabled={!password || loading}
          >
            {loading ? "..." : "Enter"}
          </Button>
        </div>
        
        {error && (
          <Alert variant="error" className="w-full">
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
