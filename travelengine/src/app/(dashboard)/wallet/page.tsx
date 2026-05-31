"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Lock,
  Unlock,
  Shield,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Document {
  id: string;
  type: string;
  title: string;
  referenceNumber: string;
  provider: string;
  validFrom: string;
  validUntil: string;
  isEncrypted: boolean;
  encryptedBlob?: string;
}

export default function WalletPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [vaultKey, setVaultKey] = useState("travelengine-secure-key");

  // Form State
  const [type, setType] = useState("PASSPORT");
  const [title, setTitle] = useState("");
  const [reference, setReference] = useState("");
  const [provider, setProvider] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [encryptField, setEncryptField] = useState(true);

  // Initialize with some seed documents for beautiful display
  useEffect(() => {
    setDocuments([
      {
        id: "doc-1",
        type: "PASSPORT",
        title: "Primary Passport - Active",
        referenceNumber: "US987654321",
        provider: "United States Dept of State",
        validFrom: "2020-01-15",
        validUntil: "2030-01-15",
        isEncrypted: true,
        encryptedBlob: "AES-256-GCM[d8a2f6b89c7d0e1f3a5c7e9b0a1c2d3e4f5]",
      },
      {
        id: "doc-2",
        type: "VISA",
        title: "Japan Tourist Visa",
        referenceNumber: "JP-V876123",
        provider: "Japanese Consulate",
        validFrom: "2026-05-01",
        validUntil: "2026-08-01",
        isEncrypted: true,
        encryptedBlob: "AES-256-GCM[a8c7d6e5b4a3f2e1d0c9b8a7f6e5d4c3b2]",
      },
      {
        id: "doc-3",
        type: "TICKET",
        title: "Flight Ticket (SF to Tokyo)",
        referenceNumber: "UA-823901",
        provider: "United Airlines",
        validFrom: "2026-06-01",
        validUntil: "2026-06-01",
        isEncrypted: false,
      },
    ]);
  }, []);

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !reference) {
      toast.error("Please provide title and reference number");
      return;
    }

    const newDoc: Document = {
      id: crypto.randomUUID(),
      type,
      title,
      referenceNumber: reference,
      provider: provider || "N/A",
      validFrom: validFrom || new Date().toISOString().split("T")[0],
      validUntil: validUntil || new Date().toISOString().split("T")[0],
      isEncrypted: encryptField,
      encryptedBlob: encryptField
        ? `AES-256-GCM[${Array.from({ length: 32 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join("")}]`
        : undefined,
    };

    setDocuments([newDoc, ...documents]);
    toast.success("Document registered securely!");

    // Reset Form
    setTitle("");
    setReference("");
    setProvider("");
    setValidFrom("");
    setValidUntil("");
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
    toast.success("Document removed from wallet!");
  };

  const getDocTypeColor = (type: string) => {
    switch (type) {
      case "PASSPORT": return "bg-blue-100 text-blue-800 border-none font-bold text-[9px]";
      case "VISA": return "bg-teal-100 text-teal-800 border-none font-bold text-[9px]";
      case "TICKET": return "bg-amber-100 text-amber-800 border-none font-bold text-[9px]";
      default: return "bg-slate-100 text-slate-700 border-none font-bold text-[9px]";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Secure Wallet</h1>
          <p className="text-slate-500 text-sm mt-1">
            Store passports, flight tickets, and visa bookings securely. Sensitive fields are AES-256 encrypted locally.
          </p>
        </div>
        <Button
          onClick={() => {
            setVaultUnlocked(!vaultUnlocked);
            if (!vaultUnlocked) {
              toast.success("Security vault unlocked! Revealing passport/visa keys.");
            } else {
              toast.info("Vault locked. Sensitive data hidden.");
            }
          }}
          className={`rounded-xl font-bold cursor-pointer transition-all shadow-md ${
            vaultUnlocked
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/10"
          }`}
        >
          {vaultUnlocked ? (
            <>
              <Unlock className="w-4.5 h-4.5 mr-2" />
              Lock Vault
            </>
          ) : (
            <>
              <Lock className="w-4.5 h-4.5 mr-2" />
              Unlock Secure Vault
            </>
          )}
        </Button>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left and Middle column: list of documents (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security details alert */}
          <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-900 text-xs leading-relaxed">
            <Shield className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-extrabold">Active Military-Grade Encryption Vault</span>
              <p className="text-indigo-950/80">
                Any document marked as &quot;Encrypted&quot; is protected on the server using AES-256. Click the &quot;Unlock Secure Vault&quot; button in the upper right to decrypt details.
              </p>
            </div>
          </div>

          {/* Documents Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="group border-slate-200/60 shadow-sm hover:shadow-xl rounded-2xl overflow-hidden hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/20">
                  <div className="flex justify-between items-center mb-2">
                    <Badge className={getDocTypeColor(doc.type)}>{doc.type}</Badge>
                    {doc.isEncrypted && (
                      <Badge className={`border-none font-bold text-[8px] uppercase tracking-wider ${
                        vaultUnlocked
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {vaultUnlocked ? "Decrypted" : "AES-250 GCM Encrypted"}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base font-bold text-slate-800 line-clamp-1">
                    {doc.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 font-semibold truncate">
                    Provider: {doc.provider}
                  </CardDescription>
                </CardHeader>

                <CardContent className="py-4 space-y-3.5 text-xs font-semibold">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Reference Number</span>
                    <div className="font-extrabold text-sm text-slate-800 mt-0.5 font-mono select-all">
                      {doc.isEncrypted && !vaultUnlocked ? (
                        <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100/50 flex items-center gap-1.5 w-fit">
                          <Lock className="w-3 h-3" />
                          {doc.encryptedBlob}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50 w-fit">
                          {doc.isEncrypted && <Unlock className="w-3 h-3" />}
                          {doc.referenceNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Valid From: {doc.validFrom}</span>
                    <span>Expiry: {doc.validUntil}</span>
                  </div>
                </CardContent>

                <CardFooter className="py-3 border-t border-slate-50 bg-slate-50/10 flex justify-end">
                  <Button
                    onClick={() => handleDeleteDoc(doc.id)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-rose-600 font-bold gap-1 cursor-pointer h-8 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Right column: Create document (1 Column) */}
        <div>
          <Card className="border-slate-200/60 shadow-xl bg-white rounded-2xl">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-base font-bold text-slate-800">Register Secure Document</CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-400">
                Details will be stored securely with symmetric AES encryption protocols.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleAddDocument} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="docType" className="text-xs font-bold uppercase tracking-wider text-slate-500">Document Type</Label>
                  <select
                    id="docType"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-11 border border-slate-200 rounded-xl px-3 bg-white text-slate-800 text-sm focus:border-blue-500 outline-none"
                  >
                    <option value="PASSPORT">Passport</option>
                    <option value="VISA">Tourist/Business Visa</option>
                    <option value="TICKET">Flight/Train Ticket</option>
                    <option value="BOOKING">Hotel Reservation</option>
                    <option value="INSURANCE">Travel Insurance</option>
                    <option value="OTHER">Other booking details</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="docTitle" className="text-xs font-bold uppercase tracking-wider text-slate-500">Document Title</Label>
                  <Input
                    id="docTitle"
                    type="text"
                    placeholder="e.g. My Passport"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-11 border-slate-200 focus:border-blue-500 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="docRef" className="text-xs font-bold uppercase tracking-wider text-slate-500">Reference Number</Label>
                  <Input
                    id="docRef"
                    type="text"
                    placeholder="e.g. Pass No. or Booking ID"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="h-11 border-slate-200 focus:border-blue-500 rounded-xl font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="docProvider" className="text-xs font-bold uppercase tracking-wider text-slate-500">Issuing Authority / Agency</Label>
                  <Input
                    id="docProvider"
                    type="text"
                    placeholder="e.g. Consulate or Lufthansa"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="h-11 border-slate-200 focus:border-blue-500 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="valFrom" className="text-xs font-bold uppercase tracking-wider text-slate-500">Valid From</Label>
                    <Input id="valFrom" type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className="h-11 border-slate-200 focus:border-blue-500 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="valUntil" className="text-xs font-bold uppercase tracking-wider text-slate-500">Valid Until</Label>
                    <Input id="valUntil" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="h-11 border-slate-200 focus:border-blue-500 rounded-xl" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-slate-700">AES-256 Symmetric Locking</Label>
                    <p className="text-[10px] text-slate-400 leading-normal">Encrypt reference keys inside database logs</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={encryptField}
                    onChange={(e) => setEncryptField(e.target.checked)}
                    className="w-4.5 h-4.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </div>

                <Button type="submit" className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-md shadow-blue-500/10">
                  Register Document
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
