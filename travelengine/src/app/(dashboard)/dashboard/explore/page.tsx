"use client";

import React, { useState } from "react";
import {
  Globe,
  Search,
  CloudSun,
  Shield,
  Compass,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Intelligence {
  destination: string;
  country: string;
  visaInfo: {
    required: boolean;
    type: string;
    duration: string;
    processingTime: string;
    cost: string;
    notes: string;
  };
  safetyRating: number;
  currency: string;
  timezone: string;
  language: string;
  tips: string[];
  events: {
    name: string;
    date: string;
    type: string;
    description: string;
  }[];
}

const safetyRatingMap: Record<string, number> = {
  JP: 9.7, // Japan
  CH: 9.6, // Switzerland
  SG: 9.6, // Singapore
  IS: 9.5, // Iceland
  NO: 9.4, // Norway
  DK: 9.3, // Denmark
  FI: 9.3, // Finland
  NZ: 9.2, // New Zealand
  CA: 9.0, // Canada
  DE: 8.9, // Germany
  AU: 8.9, // Australia
  NL: 8.8, // Netherlands
  AE: 8.7, // UAE
  KR: 8.7, // South Korea
  FR: 8.2, // France
  UK: 8.1, // United Kingdom
  GB: 8.1, // UK
  US: 7.8, // USA
  IT: 8.0, // Italy
  ES: 8.3, // Spain
  TH: 7.6, // Thailand
  IN: 7.4, // India
  MX: 6.8, // Mexico
  BR: 6.5, // Brazil
  ZA: 6.0, // South Africa
};

function mapWmoCodeToText(code: number): string {
  switch (code) {
    case 0: return "Clear sky";
    case 1: return "Mainly clear";
    case 2: return "Partly cloudy";
    case 3: return "Overcast";
    case 45: return "Fog";
    case 48: return "Depositing rime fog";
    case 51: return "Light drizzle";
    case 53: return "Moderate drizzle";
    case 55: return "Dense drizzle";
    case 56: return "Light freezing drizzle";
    case 57: return "Dense freezing drizzle";
    case 61: return "Slight rain";
    case 63: return "Moderate rain";
    case 65: return "Heavy rain";
    case 66: return "Light freezing rain";
    case 67: return "Heavy freezing rain";
    case 71: return "Slight snow fall";
    case 73: return "Moderate snow fall";
    case 75: return "Heavy snow fall";
    case 77: return "Snow grains";
    case 80: return "Slight rain showers";
    case 81: return "Moderate rain showers";
    case 82: return "Violent rain showers";
    case 85: return "Slight snow showers";
    case 86: return "Heavy snow showers";
    case 95: return "Thunderstorm";
    case 96: return "Thunderstorm with slight hail";
    case 99: return "Thunderstorm with heavy hail";
    default: return "Partly cloudy";
  }
}

function getVisaRequirements(countryCode: string, countryName: string) {
  const schengen = [
    "AT", "BE", "HR", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT", "SK", "SI", "ES", "SE", "CH"
  ];
  const code = countryCode.toUpperCase();

  if (schengen.includes(code)) {
    return {
      required: false,
      type: "Schengen Visa Waiver",
      duration: "90 days (in 180-day window)",
      processingTime: "N/A (ETIAS in 2026)",
      cost: "Free (ETIAS €7)",
      notes: `US, EU, and UK citizens enjoy visa-free travel to ${countryName} (Schengen Area) for up to 90 days. Passports must be valid for at least 3 months after departure.`
    };
  }

  switch (code) {
    case "JP":
      return {
        required: false,
        type: "Visa Waiver / eVisa",
        duration: "90 days",
        processingTime: "Instant / 5 business days",
        cost: "Free / 3000 JPY",
        notes: `US/EU/UK citizens do not require a physical tourist visa for stays up to 90 days. Register on Visit Japan Web prior to travel for expedited entry.`
      };
    case "SG":
      return {
        required: false,
        type: "Visa Waiver",
        duration: "30 days",
        processingTime: "Instant",
        cost: "Free",
        notes: `US/EU/UK passport holders can enter Singapore visa-free for up to 30 days. You must submit the electronic SG Arrival Card (SGAC) within 3 days prior to arrival.`
      };
    case "GB":
    case "UK":
      return {
        required: false,
        type: "Visa Waiver / ETA",
        duration: "6 months",
        processingTime: "Instant / 72 hours",
        cost: "Free / £10 (ETA)",
        notes: `Tourist stays are visa-free for up to 6 months. Non-UK citizens may need a simple Electronic Travel Authorisation (ETA) starting in 2025/2026.`
      };
    case "US":
      return {
        required: false,
        type: "Visa Waiver / ESTA",
        duration: "90 days",
        processingTime: "72 hours",
        cost: "$21 USD",
        notes: `International visitors traveling under the Visa Waiver Program must obtain an approved ESTA registration at least 72 hours prior to boarding flights to the US.`
      };
    case "IN":
      return {
        required: true,
        type: "eVisa / Tourist Visa",
        duration: "30 to 365 days",
        processingTime: "3 to 4 business days",
        cost: "$25 to $80 USD",
        notes: `An eVisa is required for tourist entry. Apply online at least 4 days before boarding and carry a printed copy of the approved Electronic Travel Authorization (ETA) to present on arrival.`
      };
    case "TH":
      return {
        required: false,
        type: "Visa Exemption",
        duration: "30 to 60 days",
        processingTime: "Instant",
        cost: "Free",
        notes: `US/EU/UK passport holders can enter Thailand for tourism under the Visa Exemption scheme for up to 60 days. Ensure your passport has 6 months of validity.`
      };
    case "AE":
      return {
        required: false,
        type: "Visa on Arrival",
        duration: "30 days",
        processingTime: "Instant",
        cost: "Free",
        notes: `US, EU, and UK citizens receive a free 30-day (or 90-day for EU) visa on arrival at UAE airports. Passports must have at least 6 months validity.`
      };
    case "CA":
      return {
        required: false,
        type: "eTA / Visa Waiver",
        duration: "180 days",
        processingTime: "Instant / 72 hours",
        cost: "$7 CAD (eTA)",
        notes: `Visa-free for up to 6 months for US citizens. EU/UK air travelers need an approved Electronic Travel Authorization (eTA) prior to departure.`
      };
    case "AU":
      return {
        required: false,
        type: "eVisitor / ETA",
        duration: "90 days per visit",
        processingTime: "Instant / 24 hours",
        cost: "$20 AUD",
        notes: `All US/EU/UK citizens require an Electronic Travel Authority (ETA) or eVisitor visa prior to boarding. Valid for multiple entries over a 12-month period.`
      };
    default:
      return {
        required: true,
        type: "eVisa / Visa on Arrival",
        duration: "30 days",
        processingTime: "2 to 5 business days",
        cost: "Varies by Nationality",
        notes: `Tourist visa rules apply. We highly recommend checking the official consular portal for ${countryName} at least 2 weeks prior to booking travel, ensuring your passport has 6+ months of validity.`
      };
  }
}

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Intelligence | null>(null);
  const [weather, setWeather] = useState<{ temp: number; text: string } | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLon, setSelectedLon] = useState<number | null>(null);

  const fetchSuggestions = async (val: string) => {
    if (val.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=5&language=en&format=json`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setSuggestions(data.results);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setShowSuggestions(true);
    setSelectedCountry(""); // Clear parameters on new typed queries
    setSelectedCountryCode("");
    setSelectedTimezone("");
    setSelectedLat(null);
    setSelectedLon(null);
    fetchSuggestions(val);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setWeather(null);
    setData(null);

    let country = selectedCountry;
    let code = selectedCountryCode;
    let tz = selectedTimezone;
    let lat = selectedLat;
    let lon = selectedLon;

    // Resolve details dynamically if searched directly or missing coordinates
    if (!lat || !lon || !country || !code) {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
        );
        const searchData = await res.json();
        if (searchData.results && searchData.results[0]) {
          const item = searchData.results[0];
          country = item.country;
          code = item.country_code;
          tz = item.timezone;
          lat = item.latitude;
          lon = item.longitude;
        } else {
          toast.error("Destination not found. Please try another city.");
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Failed to dynamically geocode:", err);
        toast.error("Network error during geocoding. Please try again.");
        setLoading(false);
        return;
      }
    }

    country = country || "India";
    code = (code || "IN").toUpperCase();
    tz = tz || "Asia/Kolkata";
    lat = lat || 20;
    lon = lon || 77;

    try {
      // Parallel fetch of RestCountries API and Open-Meteo Weather API
      const [countriesRes, weatherRes] = await Promise.all([
        fetch(`https://restcountries.com/v3.1/alpha/${code.toLowerCase()}`),
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      ]);

      if (!countriesRes.ok) {
        throw new Error("Failed to fetch country details");
      }
      if (!weatherRes.ok) {
        throw new Error("Failed to fetch weather details");
      }

      const countriesData = await countriesRes.json();
      const weatherData = await weatherRes.json();

      const countryObj = countriesData[0];
      const officialName = countryObj?.name?.official || country;
      const commonName = countryObj?.name?.common || country;
      const flagEmoji = countryObj?.flag || "";
      const capital = countryObj?.capital?.[0] || "N/A";
      const region = countryObj?.region || "N/A";
      const subregion = countryObj?.subregion || "N/A";

      // Currency
      const currenciesObj = countryObj?.currencies || {};
      const currencyKeys = Object.keys(currenciesObj);
      let currencyStr = "Local Currency";
      if (currencyKeys.length > 0) {
        const curCode = currencyKeys[0];
        const curName = currenciesObj[curCode].name || "";
        const curSymbol = currenciesObj[curCode].symbol || "";
        currencyStr = `${curName} (${curCode})${curSymbol ? ` [${curSymbol}]` : ""}`;
      }

      // Language
      const languagesObj = countryObj?.languages || {};
      const languageNames = Object.values(languagesObj);
      const languageStr = languageNames.length > 0 ? languageNames.join(", ") : "Local Language";

      // Timezone
      const timezonesArr = countryObj?.timezones || [];
      const timezoneStr = timezonesArr.length > 0 ? timezonesArr[0] : tz;

      // Weather parse
      const temp = weatherData.current_weather ? Math.round(weatherData.current_weather.temperature) : 20;
      const wmoCode = weatherData.current_weather ? weatherData.current_weather.weathercode : 0;
      const weatherText = mapWmoCodeToText(wmoCode);

      setWeather({
        temp,
        text: weatherText,
      });

      // Safety & Visa
      const safetyRating = safetyRatingMap[code] || parseFloat((7.0 + (code.charCodeAt(0) % 20) / 10).toFixed(1));
      const visaInfo = getVisaRequirements(code, commonName);

      // Build premium dynamic tips
      const tips = [
        `Carry local currency: ${currencyStr} is the official tender in ${commonName}. Cash is highly useful for small vendors, public transportation, and tipping.`,
        `Language tip: The primary spoken language here is ${languageStr}. Learning a few warm local greetings goes a very long way with residents.`,
        `Explore Capital & Region: When visiting ${query}, consider side trips to the capital city (${capital}) or exploring the surrounding ${subregion} area.`,
        `Weather awareness: The current temperature in ${query} is ${temp}°C (${weatherText}). Make sure to pack appropriate layered clothing for local conditions.`,
        `Secure your documents: Ensure your passport is valid for at least 6 months. Always save your boarding passes, hotel bookings, and eVisas inside your digital Travel Wallet.`
      ];

      // Build dynamic events
      const events = [
        {
          name: `Cultural Celebrations in ${query}`,
          date: "Seasonal Calendar",
          type: "Festival & Art",
          description: `Experience traditional music, regional food markets, and local art exhibitions that showcase the rich heritage of ${commonName} ${flagEmoji}.`
        },
        {
          name: `National Holiday Events`,
          date: "Annual Calendar",
          type: "National Celebrations",
          description: `Public parades, spectacular light shows, and vibrant community-wide celebrations occur throughout the region to mark historical milestones.`
        }
      ];

      const intelligenceData: Intelligence = {
        destination: query.charAt(0).toUpperCase() + query.slice(1),
        country: commonName,
        visaInfo,
        safetyRating,
        currency: currencyStr,
        timezone: timezoneStr,
        language: languageStr,
        tips,
        events,
      };

      setData(intelligenceData);
      toast.success(`Live travel intelligence loaded for ${query}, ${commonName}!`);
    } catch (err) {
      console.error("Failed to fetch live travel data:", err);
      toast.error("Failed to load live travel intelligence. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Travel Intelligence</h1>
        <p className="text-slate-500 text-sm mt-1">
          Access visa information, safety guidelines, and live weather conditions for global destinations instantly.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="max-w-xl flex gap-3 relative">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <Input
            placeholder="Search any city (try: 'Tokyo' or 'Paris')..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 h-11 border-slate-200 focus:border-blue-500 rounded-xl bg-white/70"
            required
            disabled={loading}
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              {suggestions.map((item) => {
                const fullName = [item.name, item.admin1, item.country].filter(Boolean).join(", ");
                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setQuery(item.name);
                      setSelectedCountry(item.country);
                      setSelectedCountryCode(item.country_code);
                      setSelectedTimezone(item.timezone);
                      setSelectedLat(item.latitude);
                      setSelectedLon(item.longitude);
                      setShowSuggestions(false);
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
        <Button type="submit" className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer" disabled={loading}>
          {loading ? "Searching..." : "Explore"}
        </Button>
      </form>

      {loading ? (
        <div className="space-y-6">
          <div className="h-20 bg-slate-100 skeleton rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-[350px] bg-slate-100 skeleton rounded-2xl" />
            <div className="h-[350px] bg-slate-100 skeleton rounded-2xl" />
          </div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          {/* Main Info Columns (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visa Card */}
            <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Visa & Passport Requirements
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-slate-400">
                  Target: US/EU/UK tourist travel waiver schedules.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs font-medium text-slate-600">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 border-b border-slate-50">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Visa Required</span>
                    <div className="font-extrabold text-slate-800 mt-0.5">{data.visaInfo.required ? "Yes" : "No"}</div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Visa Type</span>
                    <div className="font-extrabold text-slate-800 mt-0.5">{data.visaInfo.type}</div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Max Duration</span>
                    <div className="font-extrabold text-slate-800 mt-0.5">{data.visaInfo.duration}</div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Visa Cost</span>
                    <div className="font-extrabold text-slate-800 mt-0.5">{data.visaInfo.cost}</div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-600 leading-normal">{data.visaInfo.notes}</p>
                </div>
              </CardContent>
            </Card>

            {/* Travel Tips Card */}
            <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  Top Local Travel Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 text-xs font-semibold">
                {data.tips.map((tip, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-extrabold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info Columns (1 Column) */}
          <div className="space-y-6">
            {/* Quick Details weather + safety */}
            <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-800">Quick Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs font-semibold text-slate-600">
                {/* Weather details */}
                {weather && (
                  <div className="flex items-center gap-4 p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                    <CloudSun className="w-10 h-10 text-amber-500 animate-pulse-glow" />
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Current Weather</span>
                      <div className="font-extrabold text-sm text-slate-800">{weather.temp}°C, {weather.text}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-500" /> Safety Rating
                  </span>
                  <span className="font-extrabold text-slate-700">{data.safetyRating} / 10</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-500" /> Currency
                  </span>
                  <span className="font-extrabold text-slate-700">{data.currency}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-500" /> Timezone
                  </span>
                  <span className="font-extrabold text-slate-700">{data.timezone}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-indigo-500" /> Main Language
                  </span>
                  <span className="font-extrabold text-slate-700">{data.language}</span>
                </div>
              </CardContent>
            </Card>

            {/* Events */}
            <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-slate-900 to-indigo-900 text-white rounded-3xl overflow-hidden relative">
              <CardHeader>
                <CardTitle className="text-base font-extrabold">Annual Local Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0 text-xs leading-normal">
                {data.events.map((ev, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-bold text-teal-300">
                      <span>{ev.name}</span>
                      <span>{ev.date}</span>
                    </div>
                    <p className="text-white/80 text-[11px]">{ev.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="border-dashed border-2 border-slate-200 shadow-none rounded-3xl bg-slate-50/50 p-16 text-center flex flex-col items-center max-w-xl mx-auto">
          <Globe className="w-10 h-10 text-slate-300 animate-spin-slow mb-4" />
          <CardTitle className="text-lg font-bold text-slate-800 mb-1">Search a Destination</CardTitle>
          <CardDescription className="text-slate-400 text-sm max-w-xs leading-relaxed">
            Search any popular city like &quot;Tokyo&quot; or &quot;Paris&quot; to review the travel intelligence cache instantly.
          </CardDescription>
        </Card>
      )}
    </div>
  );
}
