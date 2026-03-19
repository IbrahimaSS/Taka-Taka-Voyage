import React from 'react';
import { ShieldCheck, DownloadCloud, Play, MapPin, ChevronRight, Download, Smartphone, Bell, Activity, Target, Home, Navigation2, FileText, User, ChevronLeft, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

const DownloadApp = () => {
  const navigate = useNavigate();
  const currentOrigin = window.location.origin;
  // Si on est sur localhost, on utilise l'IP locale pour que le QR Code fonctionne sur mobile (même réseau)
  const localIp = "192.168.1.199";
  const apkDownloadUrl = (currentOrigin.includes('localhost') ? `http://${localIp}:3000` : currentOrigin) + "/downloads/TakaTakaApp-V1.apk";

  return (
    <div className="min-h-screen bg-[#12161E] text-white font-sans flex flex-col items-center pt-24 pb-12 relative overflow-hidden">
      
      {/* Bouton Retour */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 group z-50"
      >
        <ArrowLeft className="w-5 h-5 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold text-slate-300">Retour</span>
      </button>

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#12161E] to-[#12161E] -z-10"></div>

      <div className="w-full max-w-6xl px-6 z-10">

        {/* Top Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-12 min-h-[550px]">

          {/* Left Side: Call to Action */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">

            <div className="flex items-center gap-4 mb-6">
              <img src="/LogoTT.jpeg" alt="Taka Taka Logo" className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-slate-800" />
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[64px] font-extrabold text-white mb-2 leading-[1.1] tracking-tight">
              Télécharger l'application
            </h1>
            <h2 className="text-6xl sm:text-7xl lg:text-[80px] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 mb-10 pb-2">
              Taka Taka
            </h2>

            {/* Premium Button */}
            <a
              href={apkDownloadUrl}
              download
              className="group relative flex items-center justify-center gap-3 w-[260px] h-[64px] rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] border border-white/10 hover:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.7)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mb-12 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out"></div>
              <Download className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-lg tracking-wide relative z-10">
                Télécharger l'APK
              </span>
            </a>

            {/* QR Code Section */}
            <div className="flex flex-col items-center lg:items-start">
              <span className="text-slate-400 text-xs tracking-[0.2em] font-bold uppercase mb-4">
                Scanner pour installer
              </span>
              <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200">
                <QRCodeSVG
                  value={apkDownloadUrl}
                  size={120}
                  level="H"
                  fgColor="#0E1525"
                />
              </div>
            </div>
          </div>

          {/* Right Side: High-End Phone Mockup (Driver Dashboard Style) */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative">

              {/* iPhone Mockup Frame */}
              <div className="relative w-[320px] h-[660px] bg-black rounded-[50px] border-[10px] border-slate-800 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col ring-1 ring-slate-700/50">

                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-7 w-[130px] bg-black rounded-b-[20px] mx-auto z-40 flex items-center justify-center pt-1 shadow-sm">
                  <div className="w-14 h-1.5 rounded-full bg-[#121212]"></div>
                </div>

                {/* Driver App UI Recreation */}
                <div className="flex-1 bg-white relative overflow-hidden flex flex-col font-sans select-none">

                  {/* Top Gradient Area (Driver Header) */}
                  <div className="bg-gradient-to-b from-blue-600 to-emerald-400 rounded-b-[30px] px-4 pt-10 pb-6 shadow-md z-20 relative">

                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white/20 overflow-hidden flex items-center justify-center">
                          <User className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-white/80 text-[10px] font-semibold tracking-wide">Bonjour,</p>
                          <h3 className="text-white text-[15px] font-bold leading-tight">Halimatou Barry</h3>
                          <p className="text-white/90 text-[10px] font-medium mt-0.5 flex items-center gap-1">
                            <span className="text-yellow-400">★</span> 4.3 • Mazda Benz
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Bell className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-2 mb-6">
                      <div className="px-3 py-1 bg-white/20 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                        <span className="text-white font-bold text-[10px] tracking-wider">EN LIGNE</span>
                      </div>
                      <div className="px-2 py-1 bg-white/20 rounded-full backdrop-blur-md">
                        <span className="text-white font-bold text-[9px] tracking-wider">SIMULER</span>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5 opacity-90">
                        <div className="w-7 h-4 bg-white rounded-full flex items-center px-0.5">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        </div>
                        <span className="text-white font-semibold text-[10px]">En service</span>
                      </div>
                    </div>

                    {/* Earnings Focus */}
                    <div>
                      <h4 className="text-white/80 font-semibold text-xs mb-1 drop-shadow-sm">Gains du jour</h4>
                      <h2 className="text-white font-bold text-[32px] tracking-tight drop-shadow-md leading-none mb-4">
                        0 GNF
                      </h2>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex justify-between items-center px-2 pt-2 border-t border-white/20">
                      <div className="text-center flex-1 border-r border-white/20">
                        <p className="text-white font-bold text-[15px]">12</p>
                        <p className="text-white/80 text-[10px] font-medium">Courses</p>
                      </div>
                      <div className="text-center flex-1 border-r border-white/20">
                        <p className="text-white font-bold text-[15px]">4.3</p>
                        <p className="text-white/80 text-[10px] font-medium">Note</p>
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-white font-bold text-[15px]">0%</p>
                        <p className="text-white/80 text-[10px] font-medium">Acceptation</p>
                      </div>
                    </div>
                  </div>

                  {/* Middle Content: Map Zone */}
                  <div className="flex-1 bg-[#F5F7FA] relative flex flex-col pt-3 pb-[60px]">
                    <div className="px-5 mb-2 flex justify-between items-center z-10">
                      <h4 className="text-slate-800 font-bold text-sm">Zone d'activité</h4>
                      <Target className="w-4 h-4 text-emerald-500" />
                    </div>

                    <div className="flex-1 relative mx-4 mb-2 rounded-[20px] overflow-hidden bg-[#E2E8F0] border border-slate-200 shadow-inner">
                      {/* Map Graphics */}
                      <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>

                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 400" fill="none">
                        <path d="M-50,150 L100,100 L150,250 L350,200" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M50,-50 L100,250 L150,450" stroke="white" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M220,100 L150,250 L200,450" stroke="white" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>

                      {/* Fake Location Label */}
                      <div className="absolute top-10 right-4 text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide bg-white/80 px-2 py-0.5 rounded backdrop-blur">Bataillon Autonome<br />de Madina</p>
                      </div>

                      {/* Driver Blue Pulse Ring & Icon */}
                      <div className="absolute bottom-16 inset-x-0 w-full flex justify-center">
                        <div className="relative flex items-center justify-center">
                          <div className="w-24 h-24 bg-blue-500/10 rounded-full animate-ping absolute"></div>
                          <div className="w-16 h-16 bg-blue-500/20 rounded-full border border-blue-500/30 absolute"></div>
                          <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center relative z-10">
                            <Navigation2 className="w-4 h-4 text-white fill-white" />
                          </div>
                        </div>
                      </div>

                      {/* Map Tools */}
                      <div className="absolute right-3 top-[30%] flex flex-col rounded-xl bg-white shadow-md overflow-hidden">
                        <div className="w-8 h-8 flex items-center justify-center border-b border-slate-100 text-slate-600 font-bold text-lg">+</div>
                        <div className="w-8 h-8 flex items-center justify-center text-slate-600 font-bold text-lg">-</div>
                      </div>

                      {/* Floating Robot Icon */}
                      <div className="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-emerald-500 shadow-lg flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-sm relative">
                          <div className="absolute top-[-4px] left-1 w-2 h-1 bg-white"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom App Navbar */}
                  <div className="absolute bottom-0 inset-x-0 h-[65px] bg-white border-t border-slate-100 flex items-center justify-between px-6 z-20 pb-2 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
                    <div className="flex flex-col items-center gap-1">
                      <Home className="w-5 h-5 text-blue-500" />
                      <span className="text-[9px] font-bold text-blue-500">Accueil</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100">
                      <Activity className="w-5 h-5 text-slate-600" />
                      <span className="text-[9px] font-bold text-slate-600">Courses</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100">
                      <FileText className="w-5 h-5 text-slate-600" />
                      <span className="text-[9px] font-bold text-slate-600">Gains</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100">
                      <User className="w-5 h-5 text-slate-600" />
                      <span className="text-[9px] font-bold text-slate-600">Profil</span>
                    </div>
                  </div>

                  {/* Fake Android Nav Bar */}
                  <div className="absolute bottom-0 inset-x-0 h-4 bg-white flex justify-center items-center gap-12 border-t border-slate-50">
                    <div className="w-4 h-[1px] bg-slate-400 rotate-90 scale-y-[1.5]"></div>
                    <div className="w-[18px] h-[18px] rounded border-[1.5px] border-slate-400 mix-blend-multiply"></div>
                    <ChevronLeft className="w-4 h-4 text-slate-400 scale-[1.3]" />
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Section - Taka Taka Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2 mt-20 mb-12">

          {/* Step 1 */}
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <DownloadCloud className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-slate-900 text-slate-300 text-xs tracking-widest font-bold uppercase mb-1">
                Étape <span className="text-emerald-400">1</span>
              </div>
              <span className="text-sm font-bold text-white uppercase tracking-wider">Télécharger l'APK</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-slate-900 text-slate-300 text-xs tracking-widest font-bold uppercase mb-1">
                Étape <span className="text-emerald-400">2</span>
              </div>
              <span className="text-sm font-bold text-white uppercase tracking-wider">Autoriser Sources</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Smartphone className="w-7 h-7 text-blue-400" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-slate-900 text-slate-300 text-xs tracking-widest font-bold uppercase mb-1">
                Étape <span className="text-blue-400">3</span>
              </div>
              <span className="text-sm font-bold text-white uppercase tracking-wider">Installer l'app</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 text-blue-400 ml-1" fill="currentColor" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-slate-900 text-slate-300 text-xs tracking-widest font-bold uppercase mb-1">
                Étape <span className="text-blue-400">4</span>
              </div>
              <span className="text-sm font-bold text-white uppercase tracking-wider">Commencer !</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DownloadApp;

