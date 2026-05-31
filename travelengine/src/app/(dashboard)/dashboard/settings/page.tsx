"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Settings,
  Bell,
  Wallet,
  Shield,
  CheckCircle,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SettingsPage() {
  const [name, setName] = useState("Traveler");
  const [email, setEmail] = useState("traveler@hackathon.com");
  const [currency, setCurrency] = useState("USD");
  const [interests, setInterests] = useState<string[]>(["Adventure", "Food & Dining"]);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [conflictAlerts, setConflictAlerts] = useState(true);
  const [homeLocation, setHomeLocation] = useState("Jodhpur, India");
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load preferences from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.name) setName(user.name);
        if (user.email) setEmail(user.email);
        if (user.preferences?.currency) setCurrency(user.preferences.currency);
        if (user.preferences?.interests) setInterests(user.preferences.interests);
        if (user.preferences?.homeLocation) setHomeLocation(user.preferences.homeLocation);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleInterestToggle = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setDetecting(true);
    const toastId = toast.loading("Detecting your location...");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (!res.ok) throw new Error("Reverse geocoding failed");
          const geoData = await res.json();
          const city = geoData.city || geoData.locality || "";
          const region = geoData.principalSubdivision || "";
          const country = geoData.countryName || "";
          
          const formatted = [city, region, country].filter(Boolean).join(", ");
          if (formatted) {
            setHomeLocation(formatted);
            toast.success(`Location detected: ${formatted}`, { id: toastId });
          } else {
            toast.error("Could not format location. Please enter manually.", { id: toastId });
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to fetch location name.", { id: toastId });
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        console.error(error);
        toast.error("Location access denied or timed out. Please enter manually.", { id: toastId });
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    setTimeout(() => {
      const userObj = {
        name,
        email,
        preferences: {
          currency,
          interests,
          weatherAlerts,
          budgetAlerts,
          conflictAlerts,
          homeLocation,
        },
      };

      // Save user configuration to localStorage for immediate UI binding updates
      localStorage.setItem("user", JSON.stringify(userObj));
      setSaving(false);
      toast.success("Preferences successfully saved!");
      
      // Delay dispatching event to let toast finish
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }, 1000);
  };

  const travelInterestsList = [
    "Adventure",
    "Food & Dining",
    "Culture & Arts",
    "History & Heritage",
    "Nature & Wildlife",
    "Shopping & Lifestyle",
    "Relaxation",
  ];

  const currenciesList = [
    { code: "USD", symbol: "$", label: "USD ($)" },
    { code: "EUR", symbol: "€", label: "EUR (€)" },
    { code: "INR", symbol: "₹", label: "INR (₹)" },
    { code: "GBP", symbol: "£", label: "GBP (£)" },
    { code: "JPY", symbol: "¥", label: "JPY (¥)" },
    { code: "AUD", symbol: "A$", label: "AUD (A$)" },
    { code: "CAD", symbol: "C$", label: "CAD (C$)" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
          <Settings className="w-8 h-8 text-blue-600 animate-spin-slow" />
          Settings & Preferences
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Customize your user profile, currency units, active travel interests, and event alert rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-xs">
                Update your registration details, home location, and how you want to be greeted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg bg-white/50 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 border-slate-200 rounded-lg bg-white/50 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Home / Base Location</label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detecting}
                    className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded cursor-pointer transition-all hover:bg-blue-100 disabled:opacity-50"
                  >
                    {detecting ? "Detecting..." : "Detect My Location"}
                  </button>
                </div>
                <Input
                  value={homeLocation}
                  onChange={(e) => setHomeLocation(e.target.value)}
                  placeholder="e.g. Jodhpur, Rajasthan, India"
                  className="h-10 border-slate-200 rounded-lg bg-white/50 focus:border-blue-500"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-teal-500" />
                Currency & Interests Configuration
              </CardTitle>
              <CardDescription className="text-xs">
                These settings will automatically customize your budget units and AI generation prompt engines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Currency */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Preferred Currency</label>
                <div className="flex gap-2.5 flex-wrap">
                  {currenciesList.map((curr) => (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => setCurrency(curr.code)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        currency === curr.code
                          ? "bg-teal-50 border-teal-500 text-teal-700 shadow-sm"
                          : "bg-white/50 border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {curr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Travel Interests (Select all that apply)</label>
                <div className="flex gap-2 flex-wrap">
                  {travelInterestsList.map((interest) => {
                    const selected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          selected
                            ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                            : "bg-white/50 border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer"
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "Save Preferences"}
            </Button>
          </div>
        </div>

        {/* Sidebar Settings Panel */}
        <div className="space-y-6">
          {/* Notifications Card */}
          <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Real-Time Updates ^& Alerts
              </CardTitle>
              <CardDescription className="text-xs">
                Configure notifications triggered by the dynamic travel engine services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {/* Weather Alert */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Weather Disruption Warnings</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Notify me of rain, storms, or forecast shifts.</p>
                </div>
                <input
                  type="checkbox"
                  checked={weatherAlerts}
                  onChange={(e) => setWeatherAlerts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-200 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Budget Alert */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Budget Limit Thresholds</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Alert when spending crosses 80% limit.</p>
                </div>
                <input
                  type="checkbox"
                  checked={budgetAlerts}
                  onChange={(e) => setBudgetAlerts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-200 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Conflict Alert */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Itinerary Conflict Checks</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Notify when activity schedules overlap.</p>
                </div>
                <input
                  type="checkbox"
                  checked={conflictAlerts}
                  onChange={(e) => setConflictAlerts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-200 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          {/* Subscription Tier */}
          <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4">
              <Shield className="w-12 h-12 text-teal-400 opacity-20" />
            </div>
            <CardHeader>
              <Badge className="bg-teal-400 hover:bg-teal-500 text-slate-900 border-none font-extrabold w-max text-[9px] uppercase tracking-wider mb-2">
                Hackathon Premium Tier
              </Badge>
              <CardTitle className="text-lg font-extrabold">Active License Status</CardTitle>
              <CardDescription className="text-slate-400 text-xs mt-1">
                Unlocked access to unrestricted structured AI itinerary completions, AES wallet lockers, and streaming chat assistant capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs font-medium space-y-2 pt-0 border-t border-white/10 mt-3 pt-3">
              <div className="flex items-center gap-2 text-teal-300">
                <CheckCircle className="w-4 h-4" />
                <span>Unlimited dynamic AI trip plans</span>
              </div>
              <div className="flex items-center gap-2 text-teal-300">
                <CheckCircle className="w-4 h-4" />
                <span>High-frequency live weather caches</span>
              </div>
              <div className="flex items-center gap-2 text-teal-300">
                <CheckCircle className="w-4 h-4" />
                <span>Sub-second wallet AES decrypt keys</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
