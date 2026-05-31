"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Plane,
  Calendar,
  Wallet,
  Users,
  Compass,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const interestsList = [
  "Culture & Arts",
  "Culinary & Food",
  "Nature & Outdoors",
  "Adventure & Sports",
  "Architecture & Design",
  "Shopping & Fashion",
  "History & Museums",
  "Nightlife & Entertainment",
  "Relaxation & Spa",
];

const hotelPrefs = [
  { value: "budget", label: "Budget (Hostels & Guesthouses)" },
  { value: "mid-range", label: "Mid-Range (Standard Hotels & B&Bs)" },
  { value: "luxury", label: "Luxury (Premium Hotels & Resorts)" },
];

const transportPrefs = [
  { value: "public transit", label: "Public Transit (Subways, Buses)" },
  { value: "taxi/ride-share", label: "Taxi / Ride-Sharing (Uber, Grab)" },
  { value: "rental car", label: "Rental Car (Self-Driving)" },
  { value: "walking", label: "Walking (Explore on foot)" },
];

export default function NewTripWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatingStatus, setGeneratingStatus] = useState("Analyzing preferences...");

  // Form State
  const [destination, setDestination] = useState("");
  const [origin, setOrigin] = useState("");
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");

  // Load user home location on mount to pre-populate origin city
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.preferences?.homeLocation) {
          setOrigin(user.preferences.homeLocation);
        }
      } catch (e) {
        console.error("Failed to load user home location for origin pre-fill:", e);
      }
    }
  }, []);

  const fetchSuggestions = async (query: string, type: "destination" | "origin") => {
    if (query.trim().length < 2) {
      if (type === "destination") setDestSuggestions([]);
      else setOriginSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        if (type === "destination") setDestSuggestions(data.results);
        else setOriginSuggestions(data.results);
      } else {
        if (type === "destination") setDestSuggestions([]);
        else setOriginSuggestions([]);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
  };

  const handleDestinationChange = (val: string) => {
    setDestination(val);
    setShowDestSuggestions(true);
    fetchSuggestions(val, "destination");
  };

  const handleOriginChange = (val: string) => {
    setOrigin(val);
    setShowOriginSuggestions(true);
    fetchSuggestions(val, "origin");
  };
  const [numTravelers, setNumTravelers] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [hotelPref, setHotelPref] = useState("mid-range");
  const [selectedTransports, setSelectedTransports] = useState<string[]>(["public transit"]);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleTransportToggle = (transport: string) => {
    setSelectedTransports((prev) =>
      prev.includes(transport) ? prev.filter((t) => t !== transport) : [...prev, transport]
    );
  };

  const nextStep = () => {
    if (step === 1 && (!destination || !origin || !startDate || !endDate)) {
      toast.error("Please fill in destination, origin, and travel dates");
      return;
    }
    if (step === 2 && (!budget || numTravelers <= 0)) {
      toast.error("Please enter a valid budget and number of travelers");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const simulateProgress = () => {
    const statuses = [
      { progress: 15, text: "Analyzing your travel preferences..." },
      { progress: 35, text: "Searching routes and accommodation details..." },
      { progress: 55, text: "Structuring daily tours and attractions..." },
      { progress: 75, text: "Estimating cost breakdown and day logs..." },
      { progress: 95, text: "Finalizing your dynamic custom itinerary..." },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < statuses.length) {
        setGeneratingProgress(statuses[index].progress);
        setGeneratingStatus(statuses[index].text);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1800);

    return interval;
  };

  const handleGenerate = async () => {
    if (selectedInterests.length === 0) {
      toast.error("Please choose at least one interest to build your trip");
      return;
    }

    setLoading(true);
    setGeneratingProgress(5);
    setGeneratingStatus("Initializing TravelEngine GPT model...");
    const progressInterval = simulateProgress();

    try {
      const response = await fetch("/api/v1/trips/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          startDate,
          endDate,
          budget: parseFloat(budget),
          numTravelers,
          interests: selectedInterests,
          hotelPreference: hotelPref,
          transportPreference: selectedTransports,
          additionalNotes,
        }),
      });

      const result = await response.json();
      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(result.message || "AI generation failed");
      }

      setGeneratingProgress(100);
      setGeneratingStatus("Success! Redirection in progress...");
      toast.success("Trip generated successfully!");

      router.push(`/dashboard/trips/${result.data.id}`);
      router.refresh();
    } catch (error: any) {
      clearInterval(progressInterval);
      console.error(error);
      toast.error(error.message || "Failed to generate AI trip. Please check details.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
        <Card className="max-w-md w-full border-slate-200 shadow-xl rounded-3xl p-8 bg-white text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full animate-bounce">
              <Compass className="w-12 h-12 animate-spin-slow" />
            </div>
          </div>
          <CardTitle className="text-2xl font-extrabold text-slate-800 mb-2">
            AI Travel Agent At Work
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm mb-8">
            Please wait while TravelEngine constructs a high-fidelity, customized itinerary for you.
          </CardDescription>

          <div className="space-y-4">
            <Progress value={generatingProgress} className="h-2 bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-blue-600 [&>div]:to-teal-500 rounded-full" />
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                {generatingStatus}
              </span>
              <span>{generatingProgress}%</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Wizard Progress Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Create AI <span className="gradient-text">Itinerary</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Let AI craft the perfect trip optimized for your tastes and budget.
          </p>
        </div>
        <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Step {step} of 3
        </div>
      </div>

      <Progress value={(step / 3) * 100} className="h-1.5 bg-slate-100 [&>div]:bg-blue-600 rounded-full mb-8" />

      <Card className="border-slate-200/60 shadow-xl bg-white rounded-3xl overflow-hidden">
        {/* Step 1: Destination and Dates */}
        {step === 1 && (
          <>
            <CardHeader className="border-b border-slate-50 pb-6">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Plane className="w-5 h-5 -rotate-45 text-blue-600" />
                Destinations & Travel Dates
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">
                Where are you traveling to, and when are you planning to go?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2 relative">
                <Label htmlFor="destination" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Target Destination
                </Label>
                <Input
                  id="destination"
                  type="text"
                  placeholder="e.g. Tokyo, Japan"
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onFocus={() => setShowDestSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowDestSuggestions(false), 200)}
                  className="h-11 border-slate-200 focus:border-blue-500 rounded-xl"
                  required
                  autoComplete="off"
                />
                {showDestSuggestions && destSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    {destSuggestions.map((item) => {
                      const fullName = [item.name, item.admin1, item.country].filter(Boolean).join(", ");
                      return (
                        <div
                          key={item.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setDestination(fullName);
                            setShowDestSuggestions(false);
                          }}
                          className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 border-b border-slate-100 last:border-b-0 flex items-center justify-between"
                        >
                          <span>{fullName}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.country_code}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="origin" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Origin City / Airport
                </Label>
                <Input
                  id="origin"
                  type="text"
                  placeholder="e.g. San Francisco, USA"
                  value={origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  onFocus={() => setShowOriginSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                  className="h-11 border-slate-200 focus:border-blue-500 rounded-xl"
                  required
                  autoComplete="off"
                />
                {showOriginSuggestions && originSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    {originSuggestions.map((item) => {
                      const fullName = [item.name, item.admin1, item.country].filter(Boolean).join(", ");
                      return (
                        <div
                          key={item.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setOrigin(fullName);
                            setShowOriginSuggestions(false);
                          }}
                          className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-700 border-b border-slate-100 last:border-b-0 flex items-center justify-between"
                        >
                          <span>{fullName}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.country_code}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Departure Date
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-10 h-11 border-slate-200 focus:border-blue-500 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Return Date
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pl-10 h-11 border-slate-200 focus:border-blue-500 rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 py-5 bg-slate-50/50 flex justify-end">
              <Button onClick={nextStep} className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 cursor-pointer">
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </>
        )}

        {/* Step 2: Budget and Travelers */}
        {step === 2 && (
          <>
            <CardHeader className="border-b border-slate-50 pb-6">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                Budget & Group Count
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">
                Establish the financial limits and group size for your trip.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Budget Limit (USD)
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm pointer-events-none">$</span>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g. 3000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="pl-8 h-11 border-slate-200 focus:border-blue-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelers" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Number of Travelers
                </Label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                  <Input
                    id="travelers"
                    type="number"
                    min={1}
                    value={isNaN(numTravelers) ? "" : numTravelers}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setNumTravelers(isNaN(val) ? NaN : val);
                    }}
                    className="pl-10 h-11 border-slate-200 focus:border-blue-500 rounded-xl"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 py-5 bg-slate-50/50 flex justify-between">
              <Button onClick={prevStep} variant="ghost" className="rounded-xl font-semibold text-slate-600 cursor-pointer">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={nextStep} className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 cursor-pointer">
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </>
        )}

        {/* Step 3: Interests & Preferences */}
        {step === 3 && (
          <>
            <CardHeader className="border-b border-slate-50 pb-6">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600 animate-spin-slow" />
                Interests & Preferences
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">
                Fine-tune your schedule to accommodate your personal style.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Interests Checklist */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Personal Interests
                </Label>
                <div className="flex flex-wrap gap-2.5">
                  {interestsList.map((interest) => {
                    const selected = selectedInterests.includes(interest);
                    return (
                      <Badge
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border hover:-translate-y-0.5 active:translate-y-0 transition-transform ${
                          selected
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {interest}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Hotel Selector */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Accommodation Style
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {hotelPrefs.map((pref) => {
                    const selected = hotelPref === pref.value;
                    return (
                      <div
                        key={pref.value}
                        onClick={() => setHotelPref(pref.value)}
                        className={`p-4 border rounded-2xl cursor-pointer text-center flex flex-col justify-center items-center hover:shadow-md transition-all ${
                          selected
                            ? "border-blue-600 bg-blue-50/50"
                            : "border-slate-200 bg-slate-50/30 hover:border-slate-300"
                        }`}
                      >
                        <span className={`text-xs font-bold ${selected ? "text-blue-600" : "text-slate-700"}`}>
                          {pref.label.split(" (")[0]}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">
                          {pref.label.split(" (")[1]?.replace(")", "")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transport Selector */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Transport Preference
                </Label>
                <div className="flex flex-wrap gap-2.5">
                  {transportPrefs.map((pref) => {
                    const selected = selectedTransports.includes(pref.value);
                    return (
                      <Badge
                        key={pref.value}
                        onClick={() => handleTransportToggle(pref.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border hover:-translate-y-0.5 active:translate-y-0 transition-transform ${
                          selected
                            ? "bg-teal-600 text-white border-teal-600 shadow-md"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {pref.label.split(" (")[0]}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Additional Notes / Special Instructions
                </Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="e.g. I prefer vegan restaurants. Avoid high hills for walking. Schedule most activities in the morning."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none text-slate-800 text-sm"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 py-5 bg-slate-50/50 flex justify-between">
              <Button onClick={prevStep} variant="ghost" className="rounded-xl font-semibold text-slate-600 cursor-pointer">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleGenerate} className="rounded-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2">
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                AI Generate Trip
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
