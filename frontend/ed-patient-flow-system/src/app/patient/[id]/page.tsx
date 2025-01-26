"use client";

import React from 'react';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Loader2, AlertCircle, Clock, ClipboardCheck, TestTube, Stethoscope, ArrowRight, HelpCircle, User } from "lucide-react";
import { ChatBot } from "@/components/ChatBot";
import { EmailShare } from "@/components/EmailShare";

const IFEM_API_BASE = "https://ifem-award-mchacks-2025.onrender.com/api/v1";

interface PatientData {
  id: string;
  arrival_time: string;
  triage_category: number;
  queue_position: {
    global: number;
    category: number;
  };
  status: {
    current_phase: string;
    investigations: {
      labs: string;
      imaging: string;
    };
  };
  time_elapsed: number;
}

interface HospitalStats {
  categoryBreakdown: {
    [key: string]: number;
  };
  averageWaitTimes: {
    [key: string]: number;
  };
}

interface QueueData {
  waitingCount: number;
  longestWaitTime: number;
  patients: PatientData[];
}

const MotionCard = motion(Card);

const TRIAGE_COLORS = {
  1: { bg: 'bg-blue-500', text: 'text-blue-500', name: 'RESUSCITATION', description: 'Severely ill, requires immediate care' },
  2: { bg: 'bg-red-500', text: 'text-red-500', name: 'EMERGENT', description: 'Requires rapid medical intervention' },
  3: { bg: 'bg-yellow-500', text: 'text-yellow-500', name: 'URGENT', description: 'Requires urgent care' },
  4: { bg: 'bg-green-500', text: 'text-green-500', name: 'LESS URGENT', description: 'Requires less-urgent care' },
  5: { bg: 'bg-gray-500', text: 'text-gray-500', name: 'NON-URGENT', description: 'Requires non-urgent care' },
};

const PHASE_INFO = {
  'registered': { icon: ClipboardCheck, description: 'Initial registration complete' },
  'triaged': { icon: Stethoscope, description: 'Triage assessment complete' },
  'investigations_pending': { icon: TestTube, description: 'Tests/imaging ordered and awaiting results' },
  'treatment': { icon: Stethoscope, description: 'Actively receiving care' },
  'decision_pending': { icon: HelpCircle, description: 'Doctor reviewing results/treatment response' },
  'discharge_pending': { icon: ArrowRight, description: 'Being prepared for discharge' },
  'admitted': { icon: ArrowRight, description: 'Being transferred to hospital ward' },
  'discharged': { icon: ArrowRight, description: 'Process complete, patient has left ED' },
};

const TimelineStep = ({ 
  icon: Icon, 
  title, 
  description, 
  isActive, 
  isComplete,
  details,
  delay 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  isActive: boolean; 
  isComplete: boolean;
  details?: React.ReactNode;
  delay: number;
}) => {
  const pulseOpacity = useMotionValue(0.5);
  const glowOpacity = useTransform(pulseOpacity, [0.5, 1], [0.2, 0.8]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className="relative"
    >
      <div className="flex flex-col items-center">
        {}
        {isActive && (
          <motion.div
            className="absolute top-0 -inset-x-4 h-full rounded-2xl"
            style={{
              background: 'radial-gradient(circle at center, var(--primary) 0%, transparent 70%)',
              opacity: glowOpacity,
              filter: 'blur(20px)',
            }}
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}

        {}
        <motion.div 
          className={`relative z-20 w-20 h-20 rounded-full flex items-center justify-center ${
            isActive ? 'bg-background shadow-xl' :
            isComplete ? 'bg-background' : 
            'bg-background'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            boxShadow: isActive ? '0 0 30px rgba(var(--primary), 0.2)' : undefined
          }}
        >
          {}
          <motion.div 
            className={`w-16 h-16 rounded-full flex items-center justify-center relative overflow-hidden ${
              isActive ? 'bg-primary text-primary-foreground shadow-lg ring-[3px] ring-primary/20' :
              isComplete ? 'bg-primary/20 text-primary ring-[3px] ring-primary/20' : 
              'bg-muted text-muted-foreground'
            }`}
            animate={isActive ? {
              scale: [1, 1.1, 1],
              transition: { duration: 2, repeat: Infinity }
            } : {}}
          >
            {}
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                animate={{
                  x: ['-200%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            )}
            <Icon className="w-8 h-8 relative z-10" />
          </motion.div>
        </motion.div>

        <motion.div 
          className="text-center space-y-2 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
        >
          <motion.h4 
            className="font-medium"
            animate={isActive ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {title}
          </motion.h4>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
          <AnimatePresence mode="wait">
            {(isActive || isComplete) && details && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="pt-2 space-y-3 overflow-hidden"
              >
                {details}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

const WaitTimeStats = ({ 
  hospitalStats, 
  queueData,
  patientCategory,
  patientData 
}: { 
  hospitalStats: HospitalStats | null;
  queueData: QueueData | null;
  patientCategory: number;
  patientData: PatientData;
}) => {
  if (!hospitalStats || !queueData) return null;

  const getCategoryLoad = (category: number) => {
    const count = hospitalStats.categoryBreakdown[category] || 0;
    const total = Object.values(hospitalStats.categoryBreakdown).reduce((a, b) => a + b, 0);
    const percentage = (count / total) * 100;
    
    if (percentage < 33) return "Low";
    if (percentage < 66) return "Moderate";
    return "High";
  };

  const formatWaitTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getEstimatedCompletion = () => {
    const waitTime = hospitalStats.averageWaitTimes[patientCategory] || 0;
    const elapsedTime = patientData.time_elapsed;
    const remainingTime = Math.max(0, waitTime - elapsedTime);
    
    const now = new Date();
    const completionTime = new Date(now.getTime() + remainingTime * 60000);
    
    return {
      remaining: formatWaitTime(remainingTime),
      time: completionTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      progress: Math.min(100, (elapsedTime / waitTime) * 100)
    };
  };

  const estimatedCompletion = getEstimatedCompletion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto mt-8 space-y-4"
    >
      <Card className="relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="relative p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Current ED Status</h3>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Live Updates
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Current Load</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={
                  getCategoryLoad(patientCategory) === "Low" ? "bg-green-500/10 text-green-500" :
                  getCategoryLoad(patientCategory) === "Moderate" ? "bg-orange-500/10 text-orange-500" :
                  "bg-red-500/10 text-red-500"
                }>
                  {getCategoryLoad(patientCategory)}
                </Badge>
                <span className="text-sm">
                  {hospitalStats.categoryBreakdown[patientCategory] || 0} patients in your category
                </span>
              </div>
            </Card>

            <Card className="p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Estimated Wait</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  ~{formatWaitTime(hospitalStats.averageWaitTimes[patientCategory] || 0)}
                </span>
              </div>
            </Card>

            <Card className="p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Total Waiting</p>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  {queueData.waitingCount} patients
                </span>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Wait Times by Category</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(hospitalStats.averageWaitTimes).map(([category, time]) => (
                <Card 
                  key={category}
                  className={`p-3 ${Number(category) === patientCategory ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="space-y-1">
                    <Badge variant="outline" className={`w-full justify-center ${
                      TRIAGE_COLORS[Number(category) as keyof typeof TRIAGE_COLORS]?.text
                    } ${
                      TRIAGE_COLORS[Number(category) as keyof typeof TRIAGE_COLORS]?.bg.replace('bg-', 'bg-opacity-10')
                    }`}>
                      Level {category}
                    </Badge>
                    <p className="text-xs text-center text-muted-foreground">
                      ~{formatWaitTime(time)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="relative p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Position</h3>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              #{patientData.queue_position.global} Overall
            </Badge>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Queue Progress</span>
                <span className="font-medium">{Math.round(estimatedCompletion.progress)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${estimatedCompletion.progress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Category Position</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${
                    TRIAGE_COLORS[patientCategory as keyof typeof TRIAGE_COLORS]?.text
                  } ${
                    TRIAGE_COLORS[patientCategory as keyof typeof TRIAGE_COLORS]?.bg.replace('bg-', 'bg-opacity-10')
                  }`}>
                    #{patientData.queue_position.category}
                  </Badge>
                  <span className="text-sm">
                    of {hospitalStats.categoryBreakdown[patientCategory]} in Level {patientCategory}
                  </span>
                </div>
              </Card>

              <Card className="p-4 space-y-2">
                <p className="text-sm text-muted-foreground">Estimated Completion</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm">
                    ~{estimatedCompletion.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {estimatedCompletion.remaining} remaining
                </p>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-sm font-medium">{formatWaitTime(patientData.time_elapsed)}</p>
                <p className="text-xs text-muted-foreground">Time Elapsed</p>
              </div>
              <div>
                <p className="text-sm font-medium">{estimatedCompletion.remaining}</p>
                <p className="text-xs text-muted-foreground">Estimated Remaining</p>
              </div>
              <div>
                <p className="text-sm font-medium">{formatWaitTime(hospitalStats.averageWaitTimes[patientCategory])}</p>
                <p className="text-xs text-muted-foreground">Average Total</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default function PatientPage() {
  const params = useParams();
  const patientId = params.id as string;
  
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [hospitalStats, setHospitalStats] = useState<HospitalStats | null>(null);
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const formatWaitTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCategoryLoad = (category: number) => {
    if (!hospitalStats) return "Unknown";
    const count = hospitalStats.categoryBreakdown[category] || 0;
    const total = Object.values(hospitalStats.categoryBreakdown).reduce((a, b) => a + b, 0);
    const percentage = (count / total) * 100;
    
    if (percentage < 33) return "Low";
    if (percentage < 66) return "Moderate";
    return "High";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientResponse, statsResponse, queueResponse] = await Promise.all([
          fetch(`${IFEM_API_BASE}/patient/${patientId}`),
          fetch(`${IFEM_API_BASE}/stats/current`),
          fetch(`${IFEM_API_BASE}/queue`)
        ]);

        if (!patientResponse.ok || !statsResponse.ok || !queueResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [patientData, statsData, queueData] = await Promise.all([
          patientResponse.json(),
          statsResponse.json(),
          queueResponse.json()
        ]);

        setPatientData(patientData);
        setHospitalStats(statsData);
        setQueueData(queueData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try scanning your QR code again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, [patientId]);

  const getExpectedWaitTime = () => {
    if (!patientData?.triage_category || !hospitalStats?.averageWaitTimes) {
      return null;
    }

    const waitTimeMinutes = hospitalStats.averageWaitTimes[patientData.triage_category];
    if (typeof waitTimeMinutes !== 'number') {
      return null;
    }

    const hours = Math.floor(waitTimeMinutes / 60);
    const minutes = waitTimeMinutes % 60;
    
    return { hours, minutes, total: waitTimeMinutes };
  };

  const getQueueInfo = () => {
    if (!expectedWait || !patientData?.queue_position) return null;
    
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-orange-500" />
          <span className="text-orange-500 font-medium">
            ~{expectedWait.hours > 0 ? `${expectedWait.hours}h ` : ''}{expectedWait.minutes}m estimated wait
          </span>
        </div>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <p>Queue Position: #{patientData.queue_position.category} in Category {patientData.triage_category}</p>
          <p>Overall Position: #{patientData.queue_position.global}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading your journey...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Patient Not Found</AlertTitle>
          <AlertDescription>
            We couldn't find your patient record. Please try scanning your QR code again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const expectedWait = getExpectedWaitTime();
  const currentPhase = patientData?.status?.current_phase || 'unknown';

  const steps = [
    {
      icon: User,
      title: "Arrival",
      description: "Initial Check-in",
      isComplete: true,
      isActive: false,
      details: (
        <div className="space-y-2">
          <Badge variant="outline" className="text-sm">
            {new Date(patientData?.arrival_time || '').toLocaleTimeString()}
          </Badge>
          {patientData?.time_elapsed && (
            <div className="flex flex-col gap-1.5">
              <Badge variant="outline" className="text-sm bg-orange-500/10 text-orange-500">
                {Math.floor(patientData.time_elapsed / 60)}h {patientData.time_elapsed % 60}m elapsed
              </Badge>
              <p className="text-xs text-muted-foreground">Patient ID: {patientData.id}</p>
            </div>
          )}
        </div>
      )
    },
    {
      icon: ClipboardCheck,
      title: "Registration",
      description: "Information Processing",
      isComplete: ['registered', 'triaged', 'investigations_pending', 'treatment', 'decision_pending', 'discharge_pending', 'admitted', 'discharged'].includes(currentPhase),
      isActive: currentPhase === 'registered',
      details: (
        <div className="space-y-2">
          <Badge variant="outline" className="text-sm">
            Status: {['registered', 'triaged', 'investigations_pending', 'treatment', 'decision_pending', 'discharge_pending', 'admitted', 'discharged'].includes(currentPhase) ? 'Complete' : 'In Progress'}
          </Badge>
          <div className="text-xs text-muted-foreground">
            <p>Your information has been recorded and is being processed</p>
          </div>
          {currentPhase === 'registered' && expectedWait && getQueueInfo()}
        </div>
      )
    },
    {
      icon: Stethoscope,
      title: "Triage",
      description: "Priority Assessment",
      isComplete: ['triaged', 'investigations_pending', 'treatment', 'decision_pending', 'discharge_pending', 'admitted', 'discharged'].includes(currentPhase),
      isActive: currentPhase === 'triaged',
      details: patientData?.triage_category && (
        <div className="space-y-2">
          <Badge 
            variant="outline" 
            className={`font-medium ${
              TRIAGE_COLORS[patientData.triage_category as keyof typeof TRIAGE_COLORS]?.text
            } ${
              TRIAGE_COLORS[patientData.triage_category as keyof typeof TRIAGE_COLORS]?.bg.replace('bg-', 'bg-opacity-10')
            }`}
          >
            Category {patientData.triage_category}: {TRIAGE_COLORS[patientData.triage_category as keyof typeof TRIAGE_COLORS]?.name}
          </Badge>
          <div className="text-xs text-muted-foreground">
            <p>{TRIAGE_COLORS[patientData.triage_category as keyof typeof TRIAGE_COLORS]?.description}</p>
          </div>
          {currentPhase === 'triaged' && expectedWait && getQueueInfo()}
        </div>
      )
    },
    {
      icon: TestTube,
      title: "Investigations",
      description: "Tests & Imaging",
      isComplete: ['treatment', 'decision_pending', 'discharge_pending', 'admitted', 'discharged'].includes(currentPhase),
      isActive: currentPhase === 'investigations_pending',
      details: (
        <div className="space-y-2">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Laboratory Tests</p>
            <Badge variant="outline" className={`capitalize block ${
              patientData?.status?.investigations?.labs === 'reported' ? 'bg-green-500/10 text-green-500' :
              patientData?.status?.investigations?.labs === 'pending' ? 'bg-orange-500/10 text-orange-500' :
              'bg-muted'
            }`}>
              {patientData?.status?.investigations?.labs || 'none'}
            </Badge>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Medical Imaging</p>
            <Badge variant="outline" className={`capitalize block ${
              patientData?.status?.investigations?.imaging === 'reported' ? 'bg-green-500/10 text-green-500' :
              patientData?.status?.investigations?.imaging === 'pending' ? 'bg-orange-500/10 text-orange-500' :
              'bg-muted'
            }`}>
              {patientData?.status?.investigations?.imaging || 'none'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {patientData?.status?.investigations?.labs === 'reported' && patientData?.status?.investigations?.imaging === 'reported'
              ? 'All results are ready for review'
              : 'Results will be reviewed by your doctor when ready'}
          </p>
          {currentPhase === 'investigations_pending' && expectedWait && getQueueInfo()}
        </div>
      )
    },
    {
      icon: Stethoscope,
      title: "Treatment",
      description: "Medical Care",
      isComplete: ['decision_pending', 'discharge_pending', 'admitted', 'discharged'].includes(currentPhase),
      isActive: currentPhase === 'treatment',
      details: (
        <div className="space-y-2">
          <Badge variant="outline" className={`${
            currentPhase === 'treatment' ? 'bg-primary/10 text-primary' :
            ['decision_pending', 'discharge_pending', 'admitted', 'discharged'].includes(currentPhase) ? 'bg-green-500/10 text-green-500' : 'bg-muted'
          }`}>
            {currentPhase === 'treatment' ? 'In Progress' : 
             ['decision_pending', 'discharge_pending', 'admitted', 'discharged'].includes(currentPhase) ? 'Completed' : 'Pending'}
          </Badge>
          <p className="text-xs text-muted-foreground">
            {currentPhase === 'treatment' ? 'You are currently receiving care' :
             ['decision_pending', 'discharge_pending', 'admitted', 'discharged'].includes(currentPhase) ? 'Your treatment has been completed' : 'Waiting to begin treatment'}
          </p>
          {currentPhase === 'treatment' && expectedWait && getQueueInfo()}
        </div>
      )
    },
    {
      icon: ArrowRight,
      title: "Completion",
      description: "Next Steps",
      isComplete: ['discharged', 'admitted'].includes(currentPhase),
      isActive: ['discharge_pending', 'admitted'].includes(currentPhase),
      details: (
        <div className="space-y-2">
          {currentPhase === 'discharged' ? (
            <>
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                Discharged
              </Badge>
              <p className="text-xs text-muted-foreground">You have completed your ED visit</p>
            </>
          ) : currentPhase === 'admitted' ? (
            <>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                Hospital Admission
              </Badge>
              <p className="text-xs text-muted-foreground">Being transferred to hospital ward</p>
            </>
          ) : currentPhase === 'discharge_pending' ? (
            <>
              <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                Preparing Discharge
              </Badge>
              <p className="text-xs text-muted-foreground">Finalizing your discharge paperwork</p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Awaiting final assessment</p>
          )}
        </div>
      )
    }
  ];

  const progress = steps.filter(step => step.isComplete).length / steps.length * 100;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background/80 to-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/5 to-transparent blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 relative"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-3xl"
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.h1 
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50 relative"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ backgroundSize: '200% auto' }}
          >
            Your ED Journey
          </motion.h1>
          <p className="text-muted-foreground mt-2 relative">
            Tracking your progress through the Emergency Department
          </p>
          {patientData?.time_elapsed && (
            <motion.div 
              className="mt-4 flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Badge variant="outline" className="text-sm bg-orange-500/10 text-orange-500 px-3 py-1 relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0"
                  animate={{
                    x: ['-200%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <span className="relative">
                  {Math.floor(patientData.time_elapsed / 60)}h {patientData.time_elapsed % 60}m elapsed
                </span>
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1">
                Patient ID: {patientData.id}
              </Badge>
            </motion.div>
          )}
        </motion.div>

        <div className="w-full max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-xl p-12 overflow-hidden"
          >
            <div className="relative">
              <div className="absolute top-10 left-0 right-0">
                <div className="h-[2px] bg-border/30 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-border/0 via-border/50 to-border/0" />
                </div>
              </div>

              <div className="absolute top-10 left-0 right-0">
                <motion.div 
                  className="relative h-[2px]"
                  style={{
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary) 100%)',
                    boxShadow: '0 0 20px var(--primary)',
                    width: `${progress}%`,
                  }}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ 
                    width: `${progress}%`,
                    opacity: 1,
                  }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
                >
                  <motion.div
                    className="absolute top-0 right-0 w-12 h-[2px]"
                    style={{
                      background: 'linear-gradient(90deg, rgba(var(--primary), 0) 0%, var(--primary) 50%, rgba(var(--primary), 0) 100%)',
                      filter: 'blur(4px)',
                    }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute -right-1 -top-[3px] w-2 h-2 rounded-full bg-primary"
                    style={{
                      boxShadow: '0 0 10px var(--primary)',
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </div>

              <div className="grid grid-cols-6 gap-8">
                {steps.map((step, index) => (
                  <TimelineStep
                    key={step.title}
                    {...step}
                    delay={index * 0.2}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Panels */}
        {patientData && hospitalStats && queueData && (
          <div className="w-full max-w-3xl mx-auto mt-8 space-y-4">
            {/* Your Position Panel */}
            <Card className="relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              <div className="relative p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Your Position</h3>
                    <p className="text-sm text-muted-foreground mt-1">#{patientData.queue_position.global} Overall</p>
                  </div>
                  <EmailShare patientId={patientId} />
                </div>

                <div className="space-y-6">
                  {(() => {
                    const getEstimatedCompletion = () => {
                      const waitTime = hospitalStats.averageWaitTimes[patientData.triage_category] || 0;
                      const elapsedTime = patientData.time_elapsed;
                      const remainingTime = Math.max(0, waitTime - elapsedTime);
                      
                      const now = new Date();
                      const completionTime = new Date(now.getTime() + remainingTime * 60000);
                      
                      return {
                        remaining: formatWaitTime(remainingTime),
                        time: completionTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        progress: Math.min(100, (elapsedTime / waitTime) * 100)
                      };
                    };

                    const estimatedCompletion = getEstimatedCompletion();

                    return (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Queue Progress</span>
                            <span className="font-medium">{Math.round(estimatedCompletion.progress)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${estimatedCompletion.progress}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Card className="p-4 space-y-2">
                            <p className="text-sm text-muted-foreground">Category Position</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`${
                                TRIAGE_COLORS[patientData.triage_category as keyof typeof TRIAGE_COLORS]?.text
                              } ${
                                TRIAGE_COLORS[patientData.triage_category as keyof typeof TRIAGE_COLORS]?.bg.replace('bg-', 'bg-opacity-10')
                              }`}>
                                #{patientData.queue_position.category}
                              </Badge>
                              <span className="text-sm">
                                of {hospitalStats.categoryBreakdown[patientData.triage_category]} in Level {patientData.triage_category}
                              </span>
                            </div>
                          </Card>

                          <Card className="p-4 space-y-2">
                            <p className="text-sm text-muted-foreground">Estimated Completion</p>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="text-sm">
                                ~{estimatedCompletion.time}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {estimatedCompletion.remaining} remaining
                            </p>
                          </Card>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-sm font-medium">{formatWaitTime(patientData.time_elapsed)}</p>
                            <p className="text-xs text-muted-foreground">Time Elapsed</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{estimatedCompletion.remaining}</p>
                            <p className="text-xs text-muted-foreground">Estimated Remaining</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{formatWaitTime(hospitalStats.averageWaitTimes[patientData.triage_category])}</p>
                            <p className="text-xs text-muted-foreground">Average Total</p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </Card>

            {/* Current ED Status Panel */}
            <Card className="relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              <div className="relative p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Current ED Status</h3>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    Live Updates
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Current Load</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                        getCategoryLoad(patientData.triage_category) === "Low" ? "bg-green-500/10 text-green-500" :
                        getCategoryLoad(patientData.triage_category) === "Moderate" ? "bg-orange-500/10 text-orange-500" :
                        "bg-red-500/10 text-red-500"
                      }>
                        {getCategoryLoad(patientData.triage_category)}
                      </Badge>
                      <span className="text-sm">
                        {hospitalStats.categoryBreakdown[patientData.triage_category]} patients in your category
                      </span>
                    </div>
                  </Card>

                  <Card className="p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Estimated Wait</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        ~{formatWaitTime(hospitalStats.averageWaitTimes[patientData.triage_category])}
                      </span>
                    </div>
                  </Card>

                  <Card className="p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Total Waiting</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        {queueData.waitingCount} patients
                      </span>
                    </div>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Wait Times by Category</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {Object.entries(hospitalStats.averageWaitTimes).map(([category, time]) => (
                      <Card 
                        key={category}
                        className={`p-3 ${Number(category) === patientData.triage_category ? 'ring-2 ring-primary' : ''}`}
                      >
                        <div className="space-y-1">
                          <Badge variant="outline" className={`w-full justify-center ${
                            TRIAGE_COLORS[Number(category) as keyof typeof TRIAGE_COLORS]?.text
                          } ${
                            TRIAGE_COLORS[Number(category) as keyof typeof TRIAGE_COLORS]?.bg.replace('bg-', 'bg-opacity-10')
                          }`}>
                            Level {category}
                          </Badge>
                          <p className="text-xs text-center text-muted-foreground">
                            ~{formatWaitTime(time)}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ChatBot */}
        {patientData && (
          <div className="relative z-50">
            <ChatBot patientId={patientData.id} />
          </div>
        )}
      </div>
    </main>
  );
}