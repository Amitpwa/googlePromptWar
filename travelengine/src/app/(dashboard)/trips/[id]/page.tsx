"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Wallet,
  Users,
  Compass,
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  Tag,
  CheckCircle,
  AlertTriangle,
  Plane,
  Camera,
  Utensils,
  Hotel,
  Coffee,
  Ticket,
  ShoppingBag,
  Info,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency, formatDateRange, getDaysBetween } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface Activity {
  id: string;
  orderIndex: number;
  type: string;
  title: string;
  description: string | null;
  locationName: string | null;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number | null;
  estimatedCost: string;
  notes: string | null;
  tags: string[] | null;
}

interface ItineraryDay {
  id: string;
  dayNumber: number;
  date: string;
  title: string | null;
  summary: string | null;
  estimatedCost: string;
  activities: Activity[];
}

interface Budget {
  totalBudget: string;
  spent: string;
  currency: string;
  items: {
    id: string;
    category: string;
    description: string;
    estimatedCost: string;
    actualCost: string | null;
    isPaid: boolean;
  }[];
}

interface TripDetail {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  numTravelers: number;
  totalBudget: string | null;
  estimatedCost: string | null;
  currency: string;
  status: string;
  aiGenerated: boolean;
  itineraryDays: ItineraryDay[];
  budget: Budget | null;
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: tripId } = use(params);

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Form State for Adding Activity
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [actType, setActType] = useState<"TRANSPORT" | "ACCOMMODATION" | "ATTRACTION" | "DINING" | "ACTIVITY" | "SHOPPING" | "EVENT" | "REST">("ACTIVITY");
  const [actTitle, setActTitle] = useState("");
  const [actDesc, setActDesc] = useState("");
  const [actLocation, setActLocation] = useState("");
  const [actStart, setActStart] = useState("09:00");
  const [actDuration, setActDuration] = useState("60");
  const [actCost, setActCost] = useState("0");
  const [actNotes, setActNotes] = useState("");
  const [actTags, setActTags] = useState("");

  const fetchTripDetail = async () => {
    try {
      const response = await fetch(`/api/v1/trips/${tripId}`);
      const result = await response.json();
      if (response.ok && result.data) {
        setTrip(result.data);
      } else {
        toast.error(result.message || "Failed to load trip details");
        router.push("/dashboard/trips");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch trip details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetail();
  }, [tripId]);

  const handleDeleteTrip = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete this trip and all its itineraries?")) return;

    try {
      const response = await fetch(`/api/v1/trips/${tripId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Trip deleted successfully!");
        router.push("/dashboard/trips");
      } else {
        const result = await response.json();
        toast.error(result.message || "Could not delete trip");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting the trip.");
    }
  };

  const handleAddActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle) {
      toast.error("Activity title is required");
      return;
    }

    const currentDay = trip?.itineraryDays[selectedDayIndex];
    if (!currentDay) return;

    try {
      const response = await fetch(`/api/v1/trips/${tripId}/activities?dayId=${currentDay.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: actType,
          title: actTitle,
          description: actDesc || null,
          locationName: actLocation || null,
          startTime: actStart || null,
          durationMinutes: actDuration ? parseInt(actDuration) : null,
          estimatedCost: actCost ? parseFloat(actCost) : 0,
          notes: actNotes || null,
          tags: actTags ? actTags.split(",").map(t => t.trim()).filter(Boolean) : [],
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Activity added successfully!");
        setIsAddOpen(false);
        
        // Reset state
        setActTitle("");
        setActDesc("");
        setActLocation("");
        setActStart("09:00");
        setActDuration("60");
        setActCost("0");
        setActNotes("");
        setActTags("");

        // Refresh Detail Page
        fetchTripDetail();
      } else {
        toast.error(result.message || "Failed to add activity");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while adding activity.");
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!window.confirm("Delete this activity?")) return;

    try {
      const response = await fetch(`/api/v1/trips/${tripId}/activities?activityId=${activityId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Activity deleted!");
        fetchTripDetail();
      } else {
        const result = await response.json();
        toast.error(result.message || "Failed to delete activity");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error occurred while deleting activity.");
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "TRANSPORT":
        return <Plane className="w-4 h-4 text-sky-600 -rotate-45" />;
      case "ACCOMMODATION":
        return <Hotel className="w-4 h-4 text-emerald-600" />;
      case "DINING":
        return <Utensils className="w-4 h-4 text-indigo-600" />;
      case "ATTRACTION":
        return <Camera className="w-4 h-4 text-amber-600" />;
      case "REST":
        return <Coffee className="w-4 h-4 text-orange-600" />;
      case "SHOPPING":
        return <ShoppingBag className="w-4 h-4 text-pink-600" />;
      case "EVENT":
        return <Ticket className="w-4 h-4 text-purple-600" />;
      default:
        return <Compass className="w-4 h-4 text-blue-600 animate-spin-slow" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-6 w-32 bg-slate-100 skeleton" />
        <div className="h-10 w-2/3 bg-slate-100 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-[450px] bg-slate-100 skeleton rounded-3xl" />
          <div className="h-[450px] bg-slate-100 skeleton rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const currentDay = trip.itineraryDays[selectedDayIndex];
  const daysTotal = getDaysBetween(trip.startDate, trip.endDate);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back to trips link */}
      <Link
        href="/dashboard/trips"
        className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to all trips
      </Link>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-teal-500" />
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {trip.destination}
            </span>
            <Badge className="bg-blue-100 text-blue-800 border-none font-bold uppercase tracking-wider text-[10px]">
              {trip.status}
            </Badge>
            {trip.aiGenerated && (
              <Badge className="bg-gradient-to-r from-blue-500 to-teal-400 text-white border-none font-bold uppercase tracking-wider text-[10px]">
                AI Generated
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
            {trip.title}
          </h1>
          <p className="text-slate-500 text-sm flex items-center gap-1.5 font-medium">
            <Calendar className="w-4 h-4" />
            {formatDateRange(trip.startDate, trip.endDate)} ({daysTotal} days)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleDeleteTrip} variant="destructive" className="rounded-xl font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border-none cursor-pointer">
            <Trash2 className="w-4.5 h-4.5 mr-2" />
            Delete Trip
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Itinerary Timeline Section (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xl font-extrabold text-slate-800">Daily Timeline</h2>
            {currentDay && (
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger
                render={
                  <Button size="sm" className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 cursor-pointer">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Activity
                  </Button>
                }
              />
                <DialogContent className="max-w-md bg-white border rounded-3xl p-6">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-800">Add Activity to Day {currentDay.dayNumber}</DialogTitle>
                    <DialogDescription className="text-xs text-slate-400">
                      Populate location, details, and costs to dynamically calibrate budgets.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddActivitySubmit} className="space-y-4 pt-4">
                    <div className="space-y-1">
                      <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-slate-500">Activity Type</Label>
                      <select
                        id="type"
                        value={actType}
                        onChange={(e) => setActType(e.target.value as any)}
                        className="w-full h-11 border border-slate-200 rounded-xl px-3 bg-white text-slate-800 text-sm focus:border-blue-500 outline-none"
                      >
                        <option value="ACTIVITY">Activity</option>
                        <option value="ATTRACTION">Attraction</option>
                        <option value="TRANSPORT">Transport</option>
                        <option value="ACCOMMODATION">Accommodation</option>
                        <option value="DINING">Dining / Eating Out</option>
                        <option value="REST">Rest & Relaxation</option>
                        <option value="SHOPPING">Shopping</option>
                        <option value="EVENT">Live Event</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-500">Title</Label>
                      <Input id="title" value={actTitle} onChange={(e) => setActTitle(e.target.value)} placeholder="e.g. Visit Senso-ji Temple" className="h-11 border-slate-200 focus:border-blue-500 rounded-xl" required />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-slate-500">Location Name</Label>
                      <Input id="location" value={actLocation} onChange={(e) => setActLocation(e.target.value)} placeholder="e.g. Asakusa, Tokyo" className="h-11 border-slate-200 focus:border-blue-500 rounded-xl" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="start" className="text-xs font-bold uppercase tracking-wider text-slate-500">Start Time</Label>
                        <Input id="start" type="time" value={actStart} onChange={(e) => setActStart(e.target.value)} className="h-11 border-slate-200 focus:border-blue-500 rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-wider text-slate-500">Duration (mins)</Label>
                        <Input id="duration" type="number" min={0} value={actDuration} onChange={(e) => setActDuration(e.target.value)} className="h-11 border-slate-200 focus:border-blue-500 rounded-xl" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="cost" className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Cost (USD)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">$</span>
                        <Input id="cost" type="number" min={0} value={actCost} onChange={(e) => setActCost(e.target.value)} className="pl-7 h-11 border-slate-200 focus:border-blue-500 rounded-xl" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-slate-500">Tips / Description</Label>
                      <Input id="notes" value={actNotes} onChange={(e) => setActNotes(e.target.value)} placeholder="Special reminders, ticket details, etc." className="h-11 border-slate-200 focus:border-blue-500 rounded-xl" />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl font-semibold cursor-pointer">Cancel</Button>
                      <Button type="submit" className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md shadow-blue-500/10">Add Activity</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Day Tab Selectors */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {trip.itineraryDays.map((day, idx) => (
              <Button
                key={day.id}
                onClick={() => setSelectedDayIndex(idx)}
                variant={selectedDayIndex === idx ? "default" : "outline"}
                className={`rounded-xl font-bold text-xs uppercase tracking-wider flex-shrink-0 cursor-pointer ${
                  selectedDayIndex === idx
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                Day {day.dayNumber}
              </Button>
            ))}
          </div>

          {/* Selected Day Timeline View */}
          {currentDay ? (
            <div className="space-y-6">
              {/* Day Header details */}
              <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>Day {currentDay.dayNumber}: {currentDay.title || "Adventure"}</span>
                </h3>
                {currentDay.summary && <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">{currentDay.summary}</p>}
                <div className="flex gap-4 mt-3 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {currentDay.activities.length} activities
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <Wallet className="w-3.5 h-3.5" />
                    Daily cost: {formatCurrency(parseFloat(currentDay.estimatedCost), trip.currency)}
                  </span>
                </div>
              </div>

              {/* Day's Activities List */}
              {currentDay.activities.length === 0 ? (
                <div className="border-dashed border-2 border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center max-w-sm mx-auto">
                  <Compass className="w-8 h-8 text-slate-300 animate-pulse-glow mb-4" />
                  <h4 className="text-sm font-bold text-slate-800">No activities scheduled</h4>
                  <p className="text-slate-400 text-xs mt-1 max-w-[200px] leading-relaxed">
                    Click &quot;Add Activity&quot; above to begin detailing your daily timeline logs.
                  </p>
                </div>
              ) : (
                <div className="relative border-l border-slate-100 ml-4.5 pl-6 space-y-6 pt-2">
                  {currentDay.activities.map((act) => (
                    <div key={act.id} className="relative group/card">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-4 w-5 h-5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center group-hover/card:border-blue-500 transition-colors">
                        {getActivityIcon(act.type)}
                      </div>

                      {/* Activity card */}
                      <Card className="border-slate-200/60 shadow-sm group-hover/card:shadow-md hover:border-slate-300 transition-all rounded-2xl overflow-hidden bg-white/70">
                        <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 border-none">
                                {act.type}
                              </Badge>
                              {act.startTime && (
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {act.startTime}
                                  {act.durationMinutes ? ` (${act.durationMinutes}m)` : ""}
                                </span>
                              )}
                            </div>
                            <CardTitle className="text-base font-bold text-slate-800">
                              {act.title}
                            </CardTitle>
                            {act.locationName && (
                              <CardDescription className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {act.locationName}
                              </CardDescription>
                            )}
                          </div>
                          <Button
                            onClick={() => handleDeleteActivity(act.id)}
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </CardHeader>

                        {act.description && (
                          <CardContent className="pb-3 pt-0">
                            <p className="text-slate-500 text-xs leading-relaxed">{act.description}</p>
                          </CardContent>
                        )}

                        <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between text-xs">
                          {act.notes ? (
                            <span className="text-slate-400 flex items-center gap-1 font-medium truncate max-w-[70%]">
                              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                              {act.notes}
                            </span>
                          ) : (
                            <span />
                          )}
                          <span className="font-bold text-blue-600 flex-shrink-0">
                            {parseFloat(act.estimatedCost) > 0 ? formatCurrency(parseFloat(act.estimatedCost), trip.currency) : "Free"}
                          </span>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">No days generated for this itinerary.</div>
          )}
        </div>

        {/* Right Sidebar Section (1 Column) */}
        <div className="space-y-6">
          {/* Stats & Budget Summary */}
          <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500" />
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-slate-800">Trip Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm font-medium">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="w-4.5 h-4.5" /> Travelers
                </span>
                <span className="font-extrabold text-slate-700">{trip.numTravelers} traveler(s)</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Wallet className="w-4.5 h-4.5" /> Total Budget
                </span>
                <span className="font-extrabold text-slate-700">
                  {trip.totalBudget ? formatCurrency(parseFloat(trip.totalBudget), trip.currency) : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4.5 h-4.5 text-blue-500" /> Est. Cost
                </span>
                <span className="font-extrabold text-blue-600">
                  {trip.estimatedCost ? formatCurrency(parseFloat(trip.estimatedCost), trip.currency) : "N/A"}
                </span>
              </div>

              {trip.totalBudget && trip.estimatedCost && (
                <div className="pt-2 border-t border-slate-50 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Budget Utilized</span>
                    <span>
                      {Math.round((parseFloat(trip.estimatedCost) / parseFloat(trip.totalBudget)) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(parseFloat(trip.estimatedCost) / parseFloat(trip.totalBudget)) * 100}
                    className={`h-2 bg-slate-100 rounded-full ${
                      parseFloat(trip.estimatedCost) > parseFloat(trip.totalBudget)
                        ? "[&>div]:bg-rose-500"
                        : "[&>div]:bg-emerald-500"
                    }`}
                  />
                  {parseFloat(trip.estimatedCost) > parseFloat(trip.totalBudget) && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-500 font-bold bg-rose-50 p-2 rounded-lg mt-1 border border-rose-100">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      Warning: Trip cost exceeds budget!
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick AI Assistant Card */}
          <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-indigo-900 to-slate-800 text-white rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <Compass className="absolute w-28 h-28 -right-4 -bottom-4 text-white" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-amber-300 animate-pulse" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80 text-xs leading-relaxed font-normal">
                Want to customize this trip details? Ask the assistant to find alternative hotels, cafes, or suggest adjustments if it rains.
              </p>
              <Link
                href="/dashboard/assistant"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full rounded-xl font-bold bg-white text-indigo-950 hover:bg-slate-50 border-none shadow-md text-xs h-10 flex items-center justify-center cursor-pointer"
                )}
              >
                Chat Travel Assistant
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
