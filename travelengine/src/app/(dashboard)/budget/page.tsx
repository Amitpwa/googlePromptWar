"use client";

import React, { useEffect, useState } from "react";
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  Compass,
  CheckCircle,
  Plus,
  Trash2,
  PieChart as ChartIcon,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  estimatedCost: string;
  actualCost: string | null;
  isPaid: boolean;
}

interface Budget {
  id: string;
  totalBudget: string;
  spent: string;
  currency: string;
  alertThreshold: string;
  items: BudgetItem[];
}

interface Trip {
  id: string;
  title: string;
  destination: string;
  totalBudget: string | null;
  estimatedCost: string | null;
  currency: string;
}

export default function BudgetPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [category, setCategory] = useState("FLIGHT");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");

  const fetchTrips = async () => {
    try {
      const response = await fetch("/api/v1/trips");
      const result = await response.json();
      if (response.ok && result.data) {
        setTrips(result.data);
        if (result.data.length > 0) {
          setSelectedTripId(result.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetDetails = async (tripId: string) => {
    if (!tripId) return;
    try {
      // In Next.js detail query, budget and items are already joined! We can query `/api/v1/trips/[tripId]`
      const response = await fetch(`/api/v1/trips/${tripId}`);
      const result = await response.json();
      if (response.ok && result.data && result.data.budget) {
        setBudget(result.data.budget);
      } else {
        setBudget(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      fetchBudgetDetails(selectedTripId);
    }
  }, [selectedTripId]);

  const handleAddBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !cost) {
      toast.error("Please provide a description and cost amount");
      return;
    }

    // Since we are in a hackathon, we can simulate adding budget items locally to state immediately if we want, or make a POST.
    // For a fully functional API, we will update the state
    if (!budget) return;

    const newItem: BudgetItem = {
      id: crypto.randomUUID(),
      category,
      description,
      estimatedCost: cost,
      actualCost: cost,
      isPaid: false,
    };

    const updatedItems = [...budget.items, newItem];
    const newSpent = updatedItems.reduce((sum, item) => sum + parseFloat(item.estimatedCost), 0);

    setBudget({
      ...budget,
      spent: String(newSpent),
      items: updatedItems,
    });

    toast.success("Budget item added locally!");
    setDescription("");
    setCost("");
  };

  const handleDeleteItem = (itemId: string) => {
    if (!budget) return;
    const updatedItems = budget.items.filter((item) => item.id !== itemId);
    const newSpent = updatedItems.reduce((sum, item) => sum + parseFloat(item.estimatedCost), 0);

    setBudget({
      ...budget,
      spent: String(newSpent),
      items: updatedItems,
    });

    toast.success("Budget item deleted!");
  };

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "FLIGHT": return "bg-blue-500";
      case "HOTEL": return "bg-teal-500";
      case "TRANSPORT": return "bg-amber-500";
      case "FOOD": return "bg-purple-500";
      case "SHOPPING": return "bg-pink-500";
      default: return "bg-slate-400";
    }
  };

  // Group items by category for breakdown
  const categorySummary = budget
    ? budget.items.reduce((acc: Record<string, number>, item) => {
        const costVal = parseFloat(item.estimatedCost);
        acc[item.category] = (acc[item.category] || 0) + costVal;
        return acc;
      }, {})
    : {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Budget Engine</h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor your travel costs, analyze category details, and prevent overspending.
        </p>
      </div>

      {loading ? (
        <div className="h-20 bg-slate-100 skeleton rounded-2xl" />
      ) : trips.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 shadow-none rounded-3xl bg-slate-50/50 p-16 text-center flex flex-col items-center max-w-xl mx-auto">
          <Wallet className="w-10 h-10 text-slate-300 animate-pulse-glow mb-4" />
          <CardTitle className="text-lg font-bold text-slate-800 mb-1">No budgets active</CardTitle>
          <CardDescription className="text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
            Create a trip with our AI planner first, and the budget breakdown will be generated automatically.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Trip Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Select Trip:</label>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="h-11 border border-slate-200 rounded-xl px-4 bg-white text-slate-800 font-bold text-sm focus:border-blue-500 outline-none max-w-xs"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.destination})
                </option>
              ))}
            </select>
          </div>

          {budget ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Budget Stats and Breakdown (2 Columns) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stats Summary Card */}
                <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-teal-500" />
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-bold text-slate-800">Budget Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Budget</span>
                        <div className="text-xl font-extrabold text-slate-800 mt-0.5">
                          {formatCurrency(parseFloat(budget.totalBudget), budget.currency)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Spent / Allocated</span>
                        <div className="text-xl font-extrabold text-blue-600 mt-0.5">
                          {formatCurrency(parseFloat(budget.spent), budget.currency)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Remaining</span>
                        <div className={`text-xl font-extrabold mt-0.5 ${
                          parseFloat(budget.totalBudget) - parseFloat(budget.spent) < 0
                            ? "text-rose-600"
                            : "text-emerald-600"
                        }`}>
                          {formatCurrency(parseFloat(budget.totalBudget) - parseFloat(budget.spent), budget.currency)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        <span>Total Spent Percentage</span>
                        <span>
                          {Math.round((parseFloat(budget.spent) / parseFloat(budget.totalBudget)) * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={(parseFloat(budget.spent) / parseFloat(budget.totalBudget)) * 100}
                        className={`h-2.5 bg-slate-100 rounded-full ${
                          parseFloat(budget.spent) > parseFloat(budget.totalBudget)
                            ? "[&>div]:bg-rose-500"
                            : "[&>div]:bg-blue-600"
                        }`}
                      />
                    </div>

                    {parseFloat(budget.spent) > parseFloat(budget.totalBudget) && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-500 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        Warning: Over-allocated! Reduce costs or increase budget limits.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Category breakdown visual bars */}
                <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-slate-800">Category Allocations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.keys(categorySummary).length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">No allocations found.</div>
                    ) : (
                      Object.entries(categorySummary).map(([cat, amount]) => {
                        const percent = Math.round((amount / parseFloat(budget.totalBudget)) * 100);
                        return (
                          <div key={cat} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-600 flex items-center gap-1.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(cat)}`} />
                                {cat}
                              </span>
                              <span className="text-slate-500">
                                {formatCurrency(amount, budget.currency)} ({percent}%)
                              </span>
                            </div>
                            <Progress value={percent} className="h-2 bg-slate-50 rounded-full" />
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Add Item and Items list (1 Column) */}
              <div className="space-y-6">
                {/* Add budget item */}
                <Card className="border-slate-200/60 shadow-sm bg-white rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-slate-800">Add Custom Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddBudgetItem} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full h-11 border border-slate-200 rounded-xl px-3 bg-white text-slate-800 text-sm focus:border-blue-500 outline-none"
                        >
                          <option value="FLIGHT">Flights</option>
                          <option value="HOTEL">Hotels</option>
                          <option value="TRANSPORT">Transport</option>
                          <option value="FOOD">Food & Dining</option>
                          <option value="SHOPPING">Shopping</option>
                          <option value="ACTIVITY">Activities</option>
                          <option value="INSURANCE">Insurance</option>
                          <option value="VISA">Visa & Docs</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Souvenirs, Sim Card"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full h-11 border border-slate-200 rounded-xl px-3 bg-white text-slate-800 text-sm focus:border-blue-500 outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cost (USD)</label>
                        <input
                          type="number"
                          min={0}
                          placeholder="e.g. 50"
                          value={cost}
                          onChange={(e) => setCost(e.target.value)}
                          className="w-full h-11 border border-slate-200 rounded-xl px-3 bg-white text-slate-800 text-sm focus:border-blue-500 outline-none"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">
                        Add Item
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Items List */}
                <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl max-h-[350px] overflow-y-auto">
                  <CardHeader className="sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-slate-50 pb-3">
                    <CardTitle className="text-base font-bold text-slate-800">Cost Items List</CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-slate-50 pt-3">
                    {budget.items.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">No items.</div>
                    ) : (
                      budget.items.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-700">{item.description}</div>
                            <Badge variant="secondary" className="font-bold text-[8px] uppercase tracking-wider px-1.5 py-0">
                              {item.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-800">
                              {formatCurrency(parseFloat(item.estimatedCost), budget.currency)}
                            </span>
                            <Button
                              onClick={() => handleDeleteItem(item.id)}
                              variant="ghost"
                              size="icon"
                              className="text-slate-400 hover:text-rose-600 h-7 w-7 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">No budget configured for this trip.</div>
          )}
        </div>
      )}
    </div>
  );
}
