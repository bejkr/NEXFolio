import { Zap, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const ProblemSolution: React.FC = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        
        {/* Top: Text (Left) & Image (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          
          {/* Left Text */}
          <div className="flex flex-col items-start gap-6">
            <ScrollReveal delay={0.1} direction="right">
              <div className="px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Stop manual spreadsheet tracking
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2} direction="right">
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                NexFolio automates <br />
                <span className="text-[#00E599]">your entire vault.</span>
              </h2>
            </ScrollReveal>
            
            <ScrollReveal delay={0.3} direction="right">
              <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                Updating prices manually takes hours every week. NexFolio automatically syncs real-time market data so you never miss out on trends or lose sight of your portfolio's performance.
              </p>
            </ScrollReveal>
            
            <ScrollReveal delay={0.4} direction="right">
              <button className="px-8 py-4 rounded-full bg-white text-black font-bold mt-4 hover:bg-gray-200 transition-all flex items-center gap-2 group">
                Explore Platform
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </ScrollReveal>
          </div>

          {/* Right Image/Mockup */}
          <ScrollReveal delay={0.5} direction="left">
            <div className="relative w-full aspect-square md:aspect-video lg:aspect-square flex items-center justify-center">
              {/* Glowing background behind image */}
              <div className="absolute inset-x-10 inset-y-20 bg-gradient-to-tr from-[#00E599]/30 to-transparent blur-3xl rounded-full"></div>
              
              {/* Abstract Mobile UI Mockup */}
              <div className="relative w-[80%] max-w-[320px] h-[600px] bg-[#0A0A0A] border-[8px] border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl shadow-[#00E599]/20 flex flex-col justify-end rotate-6 hover:rotate-0 transition-all duration-700 ease-in-out group">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-zinc-800 rounded-b-3xl z-20"></div>
                
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-[#0A0A0A] p-6 flex flex-col gap-5 pt-12">
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-10 rounded-full bg-zinc-800/80"></div>
                    <div className="flex gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-zinc-800/80"></div>
                      <div className="w-4 h-4 rounded-full bg-zinc-800/80"></div>
                    </div>
                  </div>

                  <div className="w-full bg-zinc-800/30 rounded-2xl p-5 border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                    <div className="text-sm text-gray-500 mb-1">Total Vault Value</div>
                    <div className="text-3xl font-bold text-[#00E599]">$24,850.00</div>
                    <div className="text-sm text-[#00E599] mt-2 flex items-center gap-1">+2.4% this week</div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1 bg-zinc-800/30 rounded-2xl h-28 border border-white/5 p-4 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20"></div>
                      <div className="w-16 h-2 bg-zinc-700 rounded-full"></div>
                    </div>
                    <div className="flex-1 bg-zinc-800/30 rounded-2xl h-28 border border-white/5 p-4 flex flex-col justify-between">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20"></div>
                      <div className="w-12 h-2 bg-zinc-700 rounded-full"></div>
                    </div>
                  </div>

                  <div className="w-full flex-1 bg-zinc-800/20 rounded-t-3xl border-t border-white/5 mt-2 p-5 flex flex-col gap-3">
                    <div className="text-sm font-medium text-white mb-2">Recent activity</div>
                    <div className="w-full h-14 bg-zinc-800/40 rounded-xl"></div>
                    <div className="w-full h-14 bg-zinc-800/40 rounded-xl"></div>
                    <div className="w-full h-14 bg-zinc-800/40 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Bottom: 3 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#00E599]/10 text-[#00E599] flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Live Price Sync</h3>
            <p className="text-gray-400 leading-relaxed">
              Automated price feeds from Cardmarket, eBay, and TCGPlayer. Always know what your collection is worth right now.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Deep Analytics</h3>
            <p className="text-gray-400 leading-relaxed">
              Track ROI, volatility, and diversification across sealed, graded, and raw products. Professional tools for collectors.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Effortless Tracking</h3>
            <p className="text-gray-400 leading-relaxed">
              No more manual updates. Your entire portfolio managed in one place without the hassle of maintaining spreadsheets.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

