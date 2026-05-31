"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Calendar,
  Wallet,
  ArrowRight,
  Plane,
  Compass,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency, formatDateRange, getDaysBetween } from "@/lib/utils";

interface Trip {
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
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("Traveler");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user details
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.name) {
          setUserName(user.name);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch user trips
    const fetchTrips = async () => {
      try {
        const response = await fetch("/api/v1/trips");
        const result = await response.json();
        if (response.ok && result.data) {
          setTrips(result.data);
        }
      } catch (err) {
        console.error("Failed to load trips:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const activeTripsCount = trips.filter((t) => t.status === "ACTIVE").length;
  const plannedTripsCount = trips.filter((t) => t.status === "PLANNED").length;
  const totalBudgeted = trips.reduce((sum, t) => sum + (t.totalBudget ? parseFloat(t.totalBudget) : 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold">Active</Badge>;
      case "PLANNED":
        return <Badge className="bg-blue-100 text-blue-800 border-none font-bold">Planned</Badge>;
      case "COMPLETED":
        return <Badge className="bg-purple-100 text-purple-800 border-none font-bold">Completed</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 border-none font-bold">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Welcome back, <span className="gradient-text">{userName}</span>!
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Let&apos;s plan your next adventure or track your active trips.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/assistant"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-xl font-semibold border-slate-200"
            )}
          >
            <MessageCircle className="w-4.5 h-4.5 mr-2" />
            Chat Assistant
          </Link>
          <Link
            href="/dashboard/trips/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 border-none"
            )}
          >
            <Sparkles className="w-4.5 h-4.5 mr-2 animate-pulse" />
            AI Plan Trip
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Trips</CardTitle>
            <Compass className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-800">{trips.length}</div>
            <p className="text-xs text-slate-400 mt-1">All-time planned destinations</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Trips</CardTitle>
            <Plane className="w-5 h-5 text-emerald-500 -rotate-45" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-800">{activeTripsCount}</div>
            <p className="text-xs text-slate-400 mt-1">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Planned Trips</CardTitle>
            <Calendar className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-800">{plannedTripsCount}</div>
            <p className="text-xs text-slate-400 mt-1">Upcoming departures scheduled</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Budgeted</CardTitle>
            <Wallet className="w-5 h-5 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-800">{formatCurrency(totalBudgeted)}</div>
            <p className="text-xs text-slate-400 mt-1">Invested across all plans</p>
          </CardContent>
        </Card>
      </div>

      {/* Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-800">Your Active & Upcoming Trips</h2>
          {trips.length > 0 && (
            <Link
              href="/dashboard/trips"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              View all trips
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden h-[220px]">
                <div className="w-full h-2.5 bg-slate-100 skeleton" />
                <CardHeader className="space-y-2">
                  <div className="h-6 w-2/3 bg-slate-100 skeleton" />
                  <div className="h-4 w-1/2 bg-slate-100 skeleton" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 w-5/6 bg-slate-100 skeleton" />
                  <div className="h-8 w-1/3 bg-slate-100 skeleton rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 shadow-none rounded-3xl bg-slate-50/50 p-12 text-center flex flex-col items-center max-w-xl mx-auto">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-6">
              <Compass className="w-10 h-10 animate-spin-slow" />
            </div>
            <CardTitle className="text-xl font-extrabold text-slate-800 mb-2">No trips found</CardTitle>
            <CardDescription className="text-slate-500 mb-8 max-w-xs leading-relaxed">
              Create your very first trip using our state-of-the-art AI planner to get complete custom itineraries.
            </CardDescription>
            <Link
              href="/dashboard/trips/new"
              className={cn(
                buttonVariants({ variant: "default" }),
                "rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 border-none"
              )}
            >
              <Sparkles className="w-4.5 h-4.5 mr-2 animate-pulse" />
              AI Generate Trip
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.slice(0, 6).map((trip) => {
              const days = getDaysBetween(trip.startDate, trip.endDate);
              return (
                <Card
                  key={trip.id}
                  className="group relative border-slate-200/60 shadow-sm hover:shadow-xl rounded-2xl overflow-hidden bg-white/70 hover:border-blue-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-teal-400" />
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {trip.destination}
                      </span>
                      {getStatusBadge(trip.status)}
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {trip.title}
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-xs flex items-center gap-1.5 mt-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDateRange(trip.startDate, trip.endDate)} ({days} days)
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-4">
                    <div className="flex items-center justify-between text-sm border-t border-slate-50 pt-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget</span>
                        <div className="font-extrabold text-slate-800 mt-0.5">
                          {trip.totalBudget ? formatCurrency(parseFloat(trip.totalBudget), trip.currency) : "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estimated Cost</span>
                        <div className="font-extrabold text-slate-800 mt-0.5">
                          {trip.estimatedCost ? formatCurrency(parseFloat(trip.estimatedCost), trip.currency) : "N/A"}
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    {trip.aiGenerated && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-teal-400 text-white border-none font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 shadow-sm">
                        AI Generated
                      </Badge>
                    )}
                    <Link
                      href={`/dashboard/trips/${trip.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "ml-auto text-blue-600 hover:text-blue-700 font-bold gap-1 cursor-pointer"
                      )}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Direct Quick Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Plane className="absolute w-40 h-40 -rotate-45 -right-10 -bottom-10 text-white" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-extrabold">Plan Your Next Trip with AI</CardTitle>
            <CardDescription className="text-white/80 text-sm">
              Use our structured trip generator to instantly outline an itinerary with custom food, accommodations, and transit.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link
              href="/dashboard/trips/new"
              className={cn(
                buttonVariants({ variant: "default" }),
                "rounded-xl font-bold bg-white text-blue-700 hover:bg-slate-50 border-none shadow-lg"
              )}
            >
              Start AI Wizard
              <ArrowRight className="w-4.5 h-4.5 ml-2" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-teal-600 to-emerald-600 text-white rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <MessageCircle className="absolute w-40 h-40 -right-10 -bottom-10 text-white" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-extrabold">Instant Assistant Chat</CardTitle>
            <CardDescription className="text-white/80 text-sm">
              Got travel disruptions, flight delays, or weather warning questions? Chat with our context-aware agent instantly.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link
              href="/dashboard/assistant"
              className={cn(
                buttonVariants({ variant: "default" }),
                "rounded-xl font-bold bg-white text-teal-700 hover:bg-slate-50 border-none shadow-lg"
              )}
            >
              Open Chat Helper
              <ArrowRight className="w-4.5 h-4.5 ml-2" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
