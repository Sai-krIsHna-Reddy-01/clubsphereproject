import React, { useState, useEffect } from "react";
import axios from "axios";
import { Certificate } from "../types";
import { Award, Eye, Download, ShieldCheck, Calendar, FileText, AlertCircle, Loader2 } from "lucide-react";

export const CertificatesView: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/certificates");
      setCertificates(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load certificates", err);
      setError("Failed to retrieve generated student certificates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-xl text-white">Verifiable Credentials</h2>
        <p className="text-xs text-slate-400">Official participation awards and certificates generated automatically from check-ins.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="h-48 flex justify-center items-center">
              <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center text-xs text-rose-400 font-mono">
              {error}
            </div>
          ) : certificates.length === 0 ? (
            <div className="p-12 bg-[#16191f] border border-slate-800 rounded-2xl text-center">
              <Award className="h-8 w-8 text-slate-600 mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-mono">No participation credentials issued yet. Attend events and ask organizers to generate check-in certificates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certificates.map(cert => (
                <div
                  key={cert.id}
                  onClick={() => setSelectedCert(cert)}
                  className={`p-4 bg-[#16191f] border rounded-2xl cursor-pointer hover:border-indigo-500/30 transition-all space-y-4 ${
                    selectedCert?.id === cert.id ? "border-indigo-600 ring-1 ring-indigo-500/20" : "border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <Award className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      ID: {cert.id}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-white text-xs line-clamp-1">{cert.eventTitle}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                      Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-850 text-[10px] font-mono">
                    <span className="text-indigo-400 font-bold">{cert.certificateCode}</span>
                    <span className="text-white hover:underline flex items-center gap-1">
                      Inspect Certificate →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Credentials Inspector Panel */}
        <div className="lg:col-span-1">
          {selectedCert ? (
            <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-5 space-y-6 sticky top-24 text-center">
              
              {/* Seal Header */}
              <div className="flex flex-col items-center">
                <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-full mb-3 shadow-lg shadow-indigo-600/10">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="font-display font-bold text-white text-base">Certificate Credentials</h3>
                <span className="text-[9px] font-mono text-emerald-400 mt-1 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 justify-center">
                  <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED CREDENTIAL
                </span>
              </div>

              {/* Certificate Details */}
              <div className="space-y-4 text-left p-4 bg-[#090a0c] border border-slate-800 rounded-xl font-mono text-[11px] text-slate-400">
                <div>
                  <p className="text-slate-500">RECIPIENT NAME</p>
                  <p className="text-white font-bold text-xs">{selectedCert.studentName}</p>
                </div>
                <div>
                  <p className="text-slate-500">EVENT COMPLETED</p>
                  <p className="text-white font-bold text-xs">{selectedCert.eventTitle}</p>
                </div>
                <div>
                  <p className="text-slate-500">VERIFICATION CODE</p>
                  <p className="text-indigo-400 font-bold text-xs">{selectedCert.certificateCode}</p>
                </div>
                <div>
                  <p className="text-slate-500">ISSUING SYSTEM AUTHORITY</p>
                  <p className="text-slate-300">ClubSphere Digital Ledger v2.1</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {/* Print action opening directly in new window */}
                <a
                  href={`/api/certificates/download/${selectedCert.certificateCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10"
                >
                  <Eye className="h-4 w-4" />
                  View & Download PDF
                </a>
                
                <p className="text-[8px] font-mono text-slate-500 leading-relaxed">
                  Cryptographically secure token verifies completion of all required check-in timestamps.
                </p>
              </div>

            </div>
          ) : (
            <div className="bg-[#16191f] border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500 font-mono py-12 sticky top-24">
              <Award className="h-8 w-8 text-slate-600 mx-auto mb-3" />
              Click any verifiable certificate card on the left to inspect detailed ledger credentials and download the printable PDF copy.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
