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
  Search,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function TripsListPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
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

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "all") return true;
    return trip.status === activeTab.toUpperCase();
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">My Trips</h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse, manage, and create day-by-day itineraries.
          </p>
        </div>
        <Link
          href="/dashboard/trips/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 border-none self-start sm:self-auto"
          )}
        >
          <Sparkles className="w-4.5 h-4.5 mr-2 animate-pulse" />
          Plan New Trip
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <Input
            placeholder="Search trips by destination or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 border-slate-200 focus:border-blue-500 rounded-xl bg-white/70"
          />
        </div>

        <Tabs
          defaultValue="all"
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="bg-slate-100 p-1 rounded-xl h-11">
            <TabsTrigger value="all" className="rounded-lg text-xs font-bold px-4 py-2 cursor-pointer">
              All
            </TabsTrigger>
            <TabsTrigger value="active" className="rounded-lg text-xs font-bold px-4 py-2 cursor-pointer">
              Active
            </TabsTrigger>
            <TabsTrigger value="planned" className="rounded-lg text-xs font-bold px-4 py-2 cursor-pointer">
              Planned
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg text-xs font-bold px-4 py-2 cursor-pointer">
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Trip Cards Grid */}
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
      ) : filteredTrips.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 shadow-none rounded-3xl bg-slate-50/50 p-16 text-center flex flex-col items-center max-w-xl mx-auto">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-6">
            <Compass className="w-10 h-10 animate-spin-slow" />
          </div>
          <CardTitle className="text-xl font-extrabold text-slate-800 mb-2">No trips match your filters</CardTitle>
          <CardDescription className="text-slate-500 mb-8 max-w-xs leading-relaxed">
            {searchQuery ? "Try altering your query parameters or searching for a different destination." : "Create your very first trip with our AI Travel Planner to get started."}
          </CardDescription>
          <Link
            href="/dashboard/trips/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md border-none"
            )}
          >
            <Sparkles className="w-4.5 h-4.5 mr-2 animate-pulse" />
            AI Plan Trip
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
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
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Budget</span>
                      <div className="font-extrabold text-slate-800 mt-0.5">
                        {trip.totalBudget ? formatCurrency(parseFloat(trip.totalBudget), trip.currency) : "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        Travelers
                      </span>
                      <div className="font-extrabold text-slate-800 mt-0.5 text-right">
                        {trip.numTravelers}
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
                    <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
