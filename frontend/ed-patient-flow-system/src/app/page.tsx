"use client";

import { useEffect, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { InfoIcon, ScanIcon, HeartPulse, ArrowLeftRight, XCircle, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const MotionButton = motion(Button);
const MotionCard = motion(Card);

const isValidPatientUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === 'localhost' &&
      parsedUrl.port === '3000' &&
      parsedUrl.pathname.startsWith('/patient/') &&
      parsedUrl.pathname.match(/^\/patient\/anon_\d{4}$/) !== null
    );
  } catch {
    return false;
  }
};

export default function Home() {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const handleScan = (result: { rawValue: string }[]) => {
    if (result.length > 0) {
      const scannedUrl = result[0].rawValue;
      console.log("Scanned URL:", scannedUrl);
      
      if (!isValidPatientUrl(scannedUrl)) {
        setScanning(false);
        setShowErrorDialog(true);
        return;
      }

      setScanning(false);
      window.location.href = scannedUrl;
    }
  };

  const handleError = (error: unknown) => {
    setError(error instanceof Error ? error.message : 'Failed to scan QR code');
    console.error(error);
  };

  return (
    <>
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-xl font-bold">
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-2 rounded-lg bg-destructive/10 dark:bg-destructive/20"
              >
                <XCircle className="h-6 w-6 text-destructive" />
              </motion.div>
              <span className="text-destructive">Invalid QR Code</span>
            </DialogTitle>
            <DialogDescription className="pt-4 text-base leading-relaxed">
              The scanned QR code is not valid. Please ensure you're scanning the QR code from your patient wristband.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <MotionButton
              variant="default"
              size="lg"
              onClick={() => {
                setShowErrorDialog(false);
                setScanning(true);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-medium"
            >
              Try Again
            </MotionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TooltipProvider>
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background dark:from-primary/5 dark:via-background dark:to-background"
        >
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:flex fixed top-0 left-0 w-full h-16 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-border/40 shadow-sm items-center justify-between px-8 z-50"
          >
            <div className="flex items-center space-x-3">
              <Tooltip>
                <TooltipTrigger>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20 transition-colors hover:bg-primary/20 dark:hover:bg-primary/30"
                  >
                    <HeartPulse className="h-5 w-5 text-primary animate-pulse" />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>Emergency Department Patient Flow</TooltipContent>
              </Tooltip>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-500 dark:from-primary dark:to-indigo-400 text-transparent bg-clip-text"
              >
                WaitWell
              </motion.h1>
            </div>
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-green-500 mr-2"
                  />
                  Scanner Active
                </Badge>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-muted/50 dark:bg-muted/20 text-muted-foreground"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span>Scan QR code from any angle</span>
              </motion.div>
            </div>
          </motion.div>

          <div className="w-full min-h-screen lg:h-screen lg:pt-20 flex flex-col items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex lg:hidden items-center justify-center space-x-3 mb-4"
            >
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20"
              >
                <HeartPulse className="h-6 w-6 text-primary animate-pulse" />
              </motion.div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 dark:from-primary dark:to-indigo-400 text-transparent bg-clip-text">
                WaitWell
              </h1>
            </motion.div>

            <div className="w-full max-w-xl">
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                className="border-0 shadow-2xl shadow-primary/10 dark:shadow-primary/20 backdrop-blur-xl bg-white/95 dark:bg-gray-950/95 ring-1 ring-border/10 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0"
                  animate={{
                    x: ["-200%", "200%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <CardHeader className="text-center space-y-2 pb-4 relative">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <CardTitle className="text-2xl font-bold">
                      <span className="bg-gradient-to-r from-primary/90 via-indigo-500/90 to-primary/90 dark:from-primary dark:via-indigo-400 dark:to-primary text-transparent bg-clip-text">
                        Patient Check-in
                      </span>
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground/90">
                      Please scan the QR code on your wristband to view your status
                    </CardDescription>
                  </motion.div>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  {scanning ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="relative w-full overflow-hidden rounded-xl bg-background/50 dark:bg-background/20 ring-1 ring-border/10">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 z-10 pointer-events-none"
                          style={{
                            background: `
                              linear-gradient(to right, rgba(0,0,0,0.1) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.1) 100%),
                              linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.1) 100%)
                            `
                          }}
                        />
                        <AspectRatio ratio={4/3} className="overflow-hidden">
                          <Scanner
                            onScan={handleScan}
                            onError={handleError}
                            constraints={{
                              facingMode: "environment",
                              aspectRatio: 4/3,
                              width: { ideal: 720 },
                              height: { ideal: 540 }
                            }}
                            formats={["qr_code"]}
                            styles={{
                              container: {
                                width: "100%",
                                height: "100%",
                                padding: 0,
                                border: "none",
                              },
                              video: {
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "0.75rem",
                              }
                            }}
                            components={{
                              audio: false,
                              torch: false,
                              finder: false
                            }}
                            scanDelay={500}
                          />
                        </AspectRatio>
                      </div>
                      <MotionButton 
                        variant="outline"
                        className="w-full border-primary/20 hover:bg-primary/5 text-primary font-medium py-4 overflow-hidden relative rounded-xl" 
                        onClick={() => setScanning(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          type: "spring",
                          stiffness: 500,
                          damping: 30
                        }}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Stop Scanning
                      </MotionButton>
                    </motion.div>
                  ) : (
                    <MotionButton 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 text-base py-4 overflow-hidden relative rounded-xl" 
                      onClick={() => setScanning(true)}
                      whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(var(--primary) / 0.1), 0 8px 10px -6px rgb(var(--primary) / 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/20 to-primary/0"
                        animate={{
                          x: ["-200%", "200%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <motion.div 
                        className="relative flex items-center justify-center font-medium"
                        initial={false}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <ScanIcon className="mr-2 h-5 w-5" />
                        Start Scanning
                      </motion.div>
                    </MotionButton>
                  )}
                  
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <Alert variant="destructive" className="border-destructive/20 bg-destructive/5 dark:border-destructive/20 dark:bg-destructive/10">
                        <AlertTitle className="text-destructive dark:text-destructive-foreground font-medium flex items-center gap-2 text-sm">
                          <XCircle className="h-4 w-4" />
                          Error Scanning
                        </AlertTitle>
                        <AlertDescription className="text-destructive/90 dark:text-destructive-foreground/90 mt-1 text-sm">
                          {error}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Alert className="border-muted/50 bg-muted/30 dark:border-muted/30 dark:bg-muted/10 cursor-pointer transition-colors hover:bg-muted/50 dark:hover:bg-muted/20">
                          <HelpCircle className="h-4 w-4 text-foreground/80 dark:text-foreground/80" />
                          <AlertTitle className="text-foreground font-medium text-sm">Need Help?</AlertTitle>
                          <AlertDescription className="text-muted-foreground/90 text-sm">
                            Ask any staff member for assistance
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    </HoverCardTrigger>
                    <HoverCardContent 
                      className="w-72"
                      align="center"
                    >
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-1.5"
                      >
                        <h4 className="text-sm font-semibold">Scanning Instructions</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>1. Hold your wristband QR code up to the camera</p>
                          <p>2. Keep the code within the scanning frame</p>
                          <p>3. Ensure good lighting and minimal movement</p>
                        </div>
                        <p className="text-xs font-medium text-primary mt-1.5">
                          Staff are always available to help!
                        </p>
                      </motion.div>
                    </HoverCardContent>
                  </HoverCard>
                </CardContent>
              </MotionCard>
            </div>
          </div>
        </motion.main>
      </TooltipProvider>
    </>
  );
}
