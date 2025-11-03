"use client";

import Image from 'next/image';
import { Button } from "@repo/ui/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@repo/ui/components/ui/alert";

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const router = useRouter();

  const handleViewClick = () => {
    if (selectedUser === "sevis") {
      router.push("/sevis-user");
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center relative">      
      <div className="flex flex-col items-center gap-6 max-w-2xl">
        <div className="flex items-center gap-6 w-full justify-center">
          <Image
            src="/assets/logo.svg"
            alt="Juno Logo"
            width={240}
            height={60}
            priority
            className="h-[60px] w-auto"
          />
          <div className="h-10 w-px bg-gray-300 mx-1"></div>
          <div className="flex items-center">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sevis">SEVIS</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-2"></div>
            <Button 
              variant="default" 
              className="h-10" 
              onClick={handleViewClick}
              disabled={!selectedUser}
            >
              View
            </Button>
          </div>
        </div>
        
        <Alert variant="info" className="mt-8 w-full">
          <AlertTitle>Juno Prototypes</AlertTitle>
          <AlertDescription>
            This prototype is to view and give feedback on the Juno platform. It is not representative of the final product in development and may change during the course of the development cycle.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
