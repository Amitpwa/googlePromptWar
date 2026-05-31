"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  MessageCircle,
  Plus,
  TrendingUp,
  Copy,
  Share2,
  Send,
  CheckCircle2,
  DollarSign,
  Calendar,
  MapPin,
  Flame,
  Activity,
  User,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  status: "active" | "idle" | "offline";
  role: string;
  email: string;
}

interface ItineraryItem {
  id: string;
  day: number;
  title: string;
  type: "sightseeing" | "food" | "transit" | "hotel";
  cost: number;
  votes: number;
  votedBy: string[]; // ids of voters
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // collaborator id
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
}

export default function CollaboratePage() {
  // CollaboratorsPresence
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: "you", name: "You (traveler)", avatar: "TR", color: "bg-blue-500", status: "active", role: "Owner", email: "traveler@hackathon.com" },
    { id: "sarah", name: "Sarah Miller", avatar: "SM", color: "bg-emerald-500", status: "active", role: "Editor", email: "sarah.miller@collab.com" },
    { id: "alex", name: "Alex Rivera", avatar: "AR", color: "bg-amber-500", status: "active", role: "Editor", email: "alex.rivera@collab.com" },
  ]);

  // Telemetry status tracker
  const [telemetry, setTelemetry] = useState<string>("All collaborators synchronized.");
  const [activeCursorUser, setActiveCursorUser] = useState<string | null>(null);

  // Itinerary items
  const [activities, setActivities] = useState<ItineraryItem[]>([
    { id: "act-1", day: 1, title: "Explore Jodhpur Old Town & Spice Markets", type: "sightseeing", cost: 15, votes: 2, votedBy: ["sarah", "alex"] },
    { id: "act-2", day: 1, title: "Traditional Rajasthani Thali Lunch", type: "food", cost: 25, votes: 1, votedBy: ["sarah"] },
    { id: "act-3", day: 2, title: "Mehrangarh Fort Guided Tour", type: "sightseeing", cost: 45, votes: 3, votedBy: ["you", "sarah", "alex"] },
    { id: "act-4", day: 2, title: "Sunset Ziplining Adventure", type: "transit", cost: 35, votes: 1, votedBy: ["alex"] },
    { id: "act-5", day: 3, title: "Check-out & Cab to Airport", type: "transit", cost: 20, votes: 2, votedBy: ["you", "sarah"] },
  ]);

  // Add Itinerary form state
  const [newTitle, setNewTitle] = useState("");
  const [newDay, setNewDay] = useState<number>(1);
  const [newType, setNewType] = useState<"sightseeing" | "food" | "transit" | "hotel">("sightseeing");
  const [newCost, setNewCost] = useState("");

  // Shared Expenses state
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "exp-1", description: "Boutique Hotel Booking", amount: 480, paidBy: "sarah" },
    { id: "exp-2", description: "SUV Cab Rental & Fuel", amount: 150, paidBy: "alex" },
    { id: "exp-3", description: "Fort Entry & Adventure Fees", amount: 120, paidBy: "you" },
  ]);

  // Add Expense form state
  const [expDesc, setExpDesc] = useState("");
  const [expAmt, setExpAmt] = useState("");
  const [expPaidBy, setExpPaidBy] = useState("you");

  // Chat room state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "msg-1", senderId: "alex", senderName: "Alex Rivera", text: "Hey guys! I paid for the SUV cab rental. Added it to the Split Ledger.", time: "4:05 PM" },
    { id: "msg-2", senderId: "sarah", senderName: "Sarah Miller", text: "Awesome, thanks Alex! I booked the Boutique Heritage Hotel. The courtyard looks incredible.", time: "4:08 PM" },
    { id: "msg-3", senderId: "alex", senderName: "Alex Rivera", text: "Sunset Ziplining sounds epic. Upvoted that tour on Day 2!", time: "4:10 PM" },
  ]);
  const [typedMessage, setTypedMessage] = useState("");
  const [partnerTyping, setPartnerTyping] = useState<string | null>(null);

  // Invite Modal
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Editor");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, partnerTyping]);

  // Simulated live cursor / telemetry events
  useEffect(() => {
    const telemetryEvents = [
      "Sarah Miller is reviewing Day 1 itinerary activities...",
      "Alex Rivera is calculating split expenses...",
      "Sarah Miller is typing in the team chat...",
      "Alex Rivera just upvoted 'Mehrangarh Fort Guided Tour'.",
      "Sarah Miller is idle (watching screen)...",
      "Alex Rivera is editing Day 2 schedules...",
    ];

    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * telemetryEvents.length);
      setTelemetry(telemetryEvents[idx]);

      // Set active indicator cursor user
      if (telemetryEvents[idx].includes("Sarah")) {
        setActiveCursorUser("sarah");
      } else if (telemetryEvents[idx].includes("Alex")) {
        setActiveCursorUser("alex");
      } else {
        setActiveCursorUser(null);
      }

      // Briefly clear cursor active highlight
      setTimeout(() => setActiveCursorUser(null), 3000);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  // Upvote Consensus Toggle
  const handleVote = (itemId: string) => {
    setActivities(
      activities.map((act) => {
        if (act.id === itemId) {
          const hasVoted = act.votedBy.includes("you");
          const nextVotedBy = hasVoted
            ? act.votedBy.filter((v) => v !== "you")
            : [...act.votedBy, "you"];
          const nextVotes = nextVotedBy.length;
          
          if (!hasVoted) {
            toast.success(`Consensus upvote added for "${act.title}"!`);
          }
          return {
            ...act,
            votes: nextVotes,
            votedBy: nextVotedBy,
          };
        }
        return act;
      })
    );
  };

  // Add shared timeline activity
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const costNum = parseFloat(newCost) || 0;
    const newAct: ItineraryItem = {
      id: `act-${Date.now()}`,
      day: newDay,
      title: newTitle,
      type: newType,
      cost: costNum,
      votes: 1,
      votedBy: ["you"],
    };

    setActivities([...activities, newAct]);
    setNewTitle("");
    setNewCost("");
    toast.success(`Shared activity "${newTitle}" added to Day ${newDay}!`);

    // Simulate partner response in chat after 3 seconds
    simulatePartnerReaction(`Hey, love that you added '${newTitle}'! Just reviewed it.`);
  };

  // Split budget calculator variables
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const perPersonCost = Math.round((totalExpenses / collaborators.length) * 100) / 100;

  // Recalculate what each person spent
  const collaboratorSpendingMap: Record<string, number> = {};
  collaborators.forEach((c) => {
    collaboratorSpendingMap[c.id] = expenses
      .filter((exp) => exp.paidBy === c.id)
      .reduce((sum, exp) => sum + exp.amount, 0);
  });

  // Calculate net balances (Spent - Split Share)
  // Positive = owes money, Negative = gets refunded
  const netBalances = collaborators.map((c) => {
    const spent = collaboratorSpendingMap[c.id] || 0;
    const balance = perPersonCost - spent;
    return {
      ...c,
      spent,
      balance: Math.round(balance * 100) / 100, // positive means they spent less than split share, so they OWE balance
    };
  });

  // Add Shared Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc || !expAmt) return;

    const amtNum = parseFloat(expAmt) || 0;
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      description: expDesc,
      amount: amtNum,
      paidBy: expPaidBy,
    };

    setExpenses([...expenses, newExp]);
    setExpDesc("");
    setExpAmt("");
    
    const paidByName = collaborators.find((c) => c.id === expPaidBy)?.name || "A collaborator";
    toast.success(`Expense "${expDesc}" ($${amtNum}) paid by ${paidByName} recorded!`);

    // Simulate chat reaction
    simulatePartnerReaction(`Thanks for documenting "${expDesc}"! Just recalculated the Split Ledger.`);
  };

  // Chat Submit
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "you",
      senderName: "You",
      text: typedMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setTypedMessage("");

    // Simulate active partner typing back in a few seconds
    const isBotReplying = Math.random() > 0.1;
    if (isBotReplying) {
      const activeBots = ["sarah", "alex"];
      const botId = activeBots[Math.floor(Math.random() * activeBots.length)];
      const botName = collaborators.find((c) => c.id === botId)?.name || "Partner";

      setTimeout(() => {
        setPartnerTyping(botName);
      }, 1500);

      const botReplies = [
        "That sounds perfect, let's keep planning along this route!",
        "Just saw your message. I'm down for whatever the group decides!",
        "Upvoted! Should we add that to the shared ledger as well?",
        "Sounds spectacular! Can we check the local weather on the Explore tab before lock-in?",
        "Indeed. I will add some travel notes to our shared Wallet files.",
      ];

      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          senderId: botId,
          senderName: botName,
          text: botReplies[Math.floor(Math.random() * botReplies.length)],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, botMsg]);
        setPartnerTyping(null);
      }, 3500);
    }
  };

  // Helper reaction simulator
  const simulatePartnerReaction = (msgText: string) => {
    const activeBots = ["sarah", "alex"];
    const botId = activeBots[Math.floor(Math.random() * activeBots.length)];
    const botName = collaborators.find((c) => c.id === botId)?.name || "Partner";

    setTimeout(() => {
      setPartnerTyping(botName);
    }, 1000);

    setTimeout(() => {
      const reactionMsg: ChatMessage = {
        id: `msg-reaction-${Date.now()}`,
        senderId: botId,
        senderName: botName,
        text: msgText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, reactionMsg]);
      setPartnerTyping(null);
    }, 2800);
  };

  // Generate Invite link
  const handleGenerateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    toast.loading("Generating invite tokens...", { id: "invite-token" });
    
    setTimeout(() => {
      toast.success(`Invite invitation successfully sent to ${inviteEmail}!`, { id: "invite-token" });
      setShowInviteModal(false);
      setInviteEmail("");

      // Push partner notification in chat
      const systemMsg: ChatMessage = {
        id: `msg-system-${Date.now()}`,
        senderId: "system",
        senderName: "TravelEngine System",
        text: `New collaborator invite token generated for ${inviteEmail} as [${inviteRole}].`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, systemMsg]);
    }, 1200);
  };

  const copyInviteLink = () => {
    const fakeLink = `https://travelengine.app/dashboard/collaborate/join-token-${Math.random().toString(36).substring(2, 9)}`;
    navigator.clipboard.writeText(fakeLink);
    toast.success("Shareable invite link copied to clipboard!");
  };

  const getActivityTypeBadge = (type: string) => {
    switch (type) {
      case "sightseeing":
        return <Badge className="bg-blue-100 text-blue-800 border-none font-bold text-[9px] uppercase tracking-wider">Attraction</Badge>;
      case "food":
        return <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[9px] uppercase tracking-wider">Dining</Badge>;
      case "transit":
        return <Badge className="bg-purple-100 text-purple-800 border-none font-bold text-[9px] uppercase tracking-wider">Transit</Badge>;
      case "hotel":
        return <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[9px] uppercase tracking-wider">Hotel</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 border-none font-bold text-[9px] uppercase tracking-wider">Other</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Glow Banner Header */}
      <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/15 to-teal-900/10 border border-blue-200/50 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-sm">
        <div className="absolute top-0 right-0 p-4 flex gap-2">
          <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold border-none animate-pulse px-2 py-0.5 rounded text-[9px] uppercase tracking-widest">
            BETA MODULE
          </Badge>
          <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold border-none px-2 py-0.5 rounded text-[9px] uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3 h-3 animate-spin-slow text-teal-300" /> Live Sync Active
          </Badge>
        </div>

        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Co-Pilot Workspace
          </h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Collaboratively plan your travel timelines, vote on top sights, chat with your travel team, and manage expense sharing ledger dynamically in one consolidated dashboard view.
          </p>

          {/* Telemetry telemetry bar */}
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white/50 w-max px-3.5 py-1.5 rounded-full border border-slate-200/60 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
            <span className="text-slate-600">Team Status:</span>
            <span className="text-slate-700 font-extrabold animate-pulse">{telemetry}</span>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Workspace timelines (2 Columns) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Active Presence Roster */}
          <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl relative">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Active Co-Planners Presence ({collaborators.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Hover over collaborators to review roles, perm level, or invite additional friends to the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex gap-4 items-center">
                {collaborators.map((collab) => {
                  const isActiveCursor = activeCursorUser === collab.id;
                  return (
                    <div
                      key={collab.id}
                      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                        isActiveCursor
                          ? "bg-blue-50 border-blue-500 scale-105 shadow-sm"
                          : "bg-white/50 border-slate-200/60"
                      }`}
                      title={`${collab.name} (${collab.email}) - Role: ${collab.role}`}
                    >
                      <div className="relative">
                        <Avatar className="w-8 h-8 rounded-full">
                          <AvatarFallback className={`${collab.color} text-white font-extrabold flex items-center justify-center text-xs w-full h-full rounded-full`}>
                            {collab.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          collab.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
                        }`} />
                      </div>
                      <div className="text-left leading-none">
                        <div className="text-xs font-bold text-slate-800">{collab.name}</div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">{collab.role}</span>
                      </div>
                      {isActiveCursor && (
                        <span className="absolute -top-2.5 -right-1 px-1 bg-blue-600 text-white text-[8px] font-extrabold rounded uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={() => setShowInviteModal(true)}
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Invite Co-Planner
              </Button>
            </CardContent>
          </Card>

          {/* Shared Interactive Timeline */}
          <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Shared Travel Timeline Consensus
              </CardTitle>
              <CardDescription className="text-xs">
                Vote on activities together. Items with 2+ votes highlight consensus selection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3].map((dayNum) => {
                const dayActs = activities.filter((act) => act.day === dayNum);
                return (
                  <div key={dayNum} className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" /> Day {dayNum} Schedule
                    </h3>
                    <div className="space-y-2.5">
                      {dayActs.length === 0 ? (
                        <p className="text-slate-400 text-xs font-medium italic pl-4">No activities proposed for Day {dayNum}. Add one below!</p>
                      ) : (
                        dayActs.map((item) => {
                          const userHasVoted = item.votedBy.includes("you");
                          const isHighConsensus = item.votes >= 2;
                          return (
                            <div
                              key={item.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-all hover:bg-slate-50/50 ${
                                isHighConsensus
                                  ? "bg-indigo-50/20 border-indigo-200/60 shadow-sm"
                                  : "bg-white/40 border-slate-200/60"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleVote(item.id)}
                                  className={`flex flex-col items-center justify-center w-11 h-11 rounded-lg border transition-all cursor-pointer ${
                                    userHasVoted
                                      ? "bg-blue-600 border-blue-600 text-white font-extrabold"
                                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                                  }`}
                                >
                                  <Flame className={`w-4 h-4 ${userHasVoted ? "animate-pulse" : ""}`} />
                                  <span className="text-[10px] font-extrabold mt-0.5">{item.votes}</span>
                                </button>

                                <div className="space-y-0.5 text-left">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-extrabold text-slate-800 leading-tight">{item.title}</span>
                                    {getActivityTypeBadge(item.type)}
                                    {isHighConsensus && (
                                      <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white font-bold border-none text-[8px] uppercase tracking-wider flex items-center gap-0.5">
                                        Consensus Match
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-2 flex-wrap">
                                    <span className="flex items-center text-slate-600"><DollarSign className="w-3.5 h-3.5" />{item.cost} est. cost</span>
                                    <span>•</span>
                                    <span className="text-slate-400">Voted by: {item.votedBy.map((v) => v === "you" ? "You" : collaborators.find(c => c.id === v)?.name || v).join(", ")}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add Activity Form */}
              <form onSubmit={handleAddActivity} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-500" /> Propose New Activity
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Title */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Activity Title</label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Camel Ride in desert dunes"
                      className="h-9 border-slate-200 rounded-lg bg-white"
                      required
                    />
                  </div>

                  {/* Day selection */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Target Day</label>
                    <select
                      value={newDay}
                      onChange={(e) => setNewDay(parseInt(e.target.value))}
                      className="w-full h-9 border border-slate-200 rounded-lg bg-white px-2.5 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500"
                    >
                      <option value={1}>Day 1</option>
                      <option value={2}>Day 2</option>
                      <option value={3}>Day 3</option>
                    </select>
                  </div>

                  {/* Type */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Activity Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full h-9 border border-slate-200 rounded-lg bg-white px-2.5 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500"
                    >
                      <option value="sightseeing">Attraction</option>
                      <option value="food">Dining</option>
                      <option value="transit">Transit</option>
                      <option value="hotel">Hotel</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Est. Cost ($)</span>
                    <Input
                      value={newCost}
                      onChange={(e) => setNewCost(e.target.value)}
                      placeholder="15"
                      type="number"
                      className="w-20 h-8 text-xs text-left"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Propose & Vote
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Collaborative Split Expenses */}
          <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-500" />
                Dynamic Split Expenses Ledger
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time ledger split calculations. Keep track of group bookings, taxi bills, and hotel costs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Ledger Totals */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 text-white p-4 rounded-2xl shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <TrendingUp className="w-20 h-20 text-white" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider">Total Expenses Pool</span>
                  <div className="text-xl font-extrabold text-white mt-0.5">${totalExpenses}</div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider">Travelers Split</span>
                  <div className="text-xl font-extrabold text-white mt-0.5">{collaborators.length} Members</div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider">Equal Share Per Traveler</span>
                  <div className="text-xl font-extrabold text-teal-300 mt-0.5">${perPersonCost}</div>
                </div>
              </div>

              {/* Settlement Balances */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Net Ledger Balances</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {netBalances.map((item) => {
                    const owesMoney = item.balance > 0;
                    const isSettled = item.balance === 0;
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                          isSettled
                            ? "bg-slate-50/50 border-slate-200"
                            : owesMoney
                            ? "bg-rose-50/20 border-rose-200"
                            : "bg-emerald-50/20 border-emerald-200"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold text-slate-800">{item.name}</span>
                          <Badge className={`border-none font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5 ${
                            isSettled
                              ? "bg-slate-100 text-slate-600"
                              : owesMoney
                              ? "bg-rose-100 text-rose-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {isSettled ? "Settled" : owesMoney ? "Owes Balance" : "Gets Refund"}
                          </Badge>
                        </div>

                        <div className="mt-3.5 flex justify-between items-end">
                          <div>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Total Spent</span>
                            <div className="text-xs font-extrabold text-slate-700">${item.spent}</div>
                          </div>

                          <div className="text-right">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Balance Diff</span>
                            <div className={`text-xs font-extrabold ${
                              isSettled ? "text-slate-500" : owesMoney ? "text-rose-600" : "text-emerald-600"
                            }`}>
                              {isSettled ? "$0.00" : owesMoney ? `+$${item.balance}` : `-$${Math.abs(item.balance)}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Expense Form */}
              <form onSubmit={handleAddExpense} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-teal-500" /> Document Shared Expenditure
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Desc */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Expense Item / Bill</label>
                    <Input
                      value={expDesc}
                      onChange={(e) => setExpDesc(e.target.value)}
                      placeholder="e.g. Dinner at Lalaji Bistro"
                      className="h-9 border-slate-200 rounded-lg bg-white"
                      required
                    />
                  </div>

                  {/* Amount */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Amount Paid ($)</label>
                    <Input
                      value={expAmt}
                      onChange={(e) => setExpAmt(e.target.value)}
                      placeholder="60"
                      type="number"
                      className="h-9 border-slate-200 rounded-lg bg-white"
                      required
                    />
                  </div>

                  {/* Paid By */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Paid By</label>
                    <select
                      value={expPaidBy}
                      onChange={(e) => setExpPaidBy(e.target.value)}
                      className="w-full h-9 border border-slate-200 rounded-lg bg-white px-2.5 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500"
                    >
                      {collaborators.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="h-9 px-5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add to Shared Ledger
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Live Workspace Chat Console (1 Column) */}
        <div className="space-y-6">
          <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-md rounded-2xl h-[650px] flex flex-col justify-between overflow-hidden relative">
            
            {/* Chat header */}
            <CardHeader className="pb-3 border-b border-slate-100 bg-white/50 backdrop-blur-sm relative z-10 flex-shrink-0">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                Team Planning Chat
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time coordination room for travel debates and consensus logs.
              </CardDescription>
            </CardHeader>

            {/* Message screen */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[460px] bg-slate-50/50">
              {chatMessages.map((msg) => {
                const isYou = msg.senderId === "you";
                const isSystem = msg.senderId === "system";
                
                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-1.5">
                      <div className="px-3.5 py-1 bg-blue-50 border border-blue-100 text-[10px] font-extrabold text-blue-700 rounded-full flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" />
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex flex-col ${isYou ? "items-end text-right" : "items-start text-left"}`}>
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">
                      {msg.senderName} • {msg.time}
                    </div>
                    <div className={`px-3.5 py-2.5 text-xs font-semibold leading-relaxed max-w-[85%] rounded-2xl ${
                      isYou
                        ? "bg-blue-600 text-white rounded-tr-none shadow-sm shadow-blue-500/10"
                        : "bg-white text-slate-700 border border-slate-200/60 rounded-tl-none"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {/* Typing bubble */}
              {partnerTyping && (
                <div className="flex flex-col items-start text-left animate-pulse">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">
                    {partnerTyping} is typing...
                  </div>
                  <div className="px-3.5 py-2 bg-slate-100 border border-slate-200/40 text-slate-400 text-xs font-semibold rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </CardContent>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2 items-center flex-shrink-0">
              <Input
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Debate suggestions or coordinate expenses..."
                className="h-10 border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
                disabled={partnerTyping !== null}
              />
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0 cursor-pointer"
                disabled={!typedMessage.trim() || partnerTyping !== null}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </Card>
          
          {/* Quick tips panel */}
          <Card className="border-slate-200/60 shadow-sm bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl overflow-hidden relative">
            <CardHeader className="pb-2">
              <Badge className="bg-teal-400 hover:bg-teal-500 text-slate-900 border-none font-bold text-[9px] uppercase tracking-wider w-max mb-1">
                Workspace Help
              </Badge>
              <CardTitle className="text-sm font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" /> Real-Time Collaboration Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-slate-300 font-semibold space-y-2 pb-4 leading-normal">
              <div className="flex gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                <span>Proposed actions require consensus validation. Check timelines for active consensus badges.</span>
              </div>
              <div className="flex gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                <span>The Split Ledger is computed instantly for equal group divisions. Add currency tags on Settings.</span>
              </div>
              <div className="flex gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                <span>Documents updated inside your secure Travel Wallet will trigger real-time chat logging alerts for team awareness.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invite Friends Modal overlay */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="w-full max-w-md border-slate-200 shadow-2xl rounded-3xl overflow-hidden animate-slide-up">
            <CardHeader className="bg-slate-900 text-white relative">
              <div className="absolute top-0 right-0 p-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold bg-white/10 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                <Share2 className="w-5 h-5 text-teal-300 animate-pulse" />
                Invite Travel Co-Pilot
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs mt-1">
                Add teammates by email to coordinate and plan together, or share a workspace sync link.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleGenerateInvite}>
              <CardContent className="p-6 space-y-4 text-left">
                {/* Email address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Teammate Email Address</label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g. wanderer@travels.com"
                    className="h-10 border-slate-200 rounded-lg"
                    required
                  />
                </div>

                {/* Role selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Workspace Permissions</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full h-10 border border-slate-200 rounded-lg bg-white px-2.5 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Editor">Editor (Can edit, vote, chat, split budget)</option>
                    <option value="Viewer">Viewer (Read-only access to timeline & ledger)</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100 flex gap-2.5">
                  <Button
                    type="button"
                    onClick={copyInviteLink}
                    variant="outline"
                    className="flex-1 h-10 rounded-xl text-xs font-bold border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-slate-500" /> Copy Sync Link
                  </Button>

                  <Button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> Send Invite
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
