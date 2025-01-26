"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { toast } from "sonner";

interface EmailShareProps {
  patientId: string;
}

export function EmailShare({ patientId }: EmailShareProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/email/${patientId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails: [email],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      toast.success("Email sent successfully!");
      setEmail("");
    } catch (error) {
      toast.error("Failed to send email. Please try again.");
      console.error("Error sending email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
        <Mail className="w-4 h-4" />
        Share with Family
      </h3>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 h-9"
        />
        <Button 
          onClick={handleShare}
          disabled={isLoading}
          size="sm"
        >
          {isLoading ? "Sending..." : "Share"}
        </Button>
      </div>
    </div>
  );
} 