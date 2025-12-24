import { GraduationCap, Globe, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const AeroPodNav = () => {
  return (
    <div className="flex flex-col items-center scale-[0.65] sm:scale-75 origin-bottom">
      {/* Main Container - Fused Aero Pod */}
      <div
        className={cn(
          "relative bg-gradient-to-b from-[#f8f9fa] to-[#e8eaed]",
          "rounded-[20px] p-[3px]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]"
        )}
      >
        {/* Inner Container */}
        <div className="bg-gradient-to-b from-white to-[#f5f6f7] rounded-[18px] overflow-hidden">
          
          {/* Top Section - AI Pioneer Program */}
          <a
            href="https://aipioneer.zen.ai"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group block px-8 py-4 text-center",
              "bg-gradient-to-r from-[#e8f5e9]/60 via-[#f1f8e9]/40 to-[#fff8e1]/60",
              "border-b border-[#e0e0e0]/50",
              "transition-all duration-300 ease-out",
              "hover:from-[#c8e6c9]/80 hover:via-[#dcedc8]/60 hover:to-[#fff59d]/60",
              "hover:shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
            )}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <GraduationCap 
                className={cn(
                  "w-5 h-5 text-[#4a5568]",
                  "transition-all duration-300",
                  "group-hover:text-[#3b82f6] group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                )} 
              />
              <span 
                className={cn(
                  "font-bold text-sm tracking-wide text-[#2d3748]",
                  "transition-all duration-300",
                  "group-hover:text-[#3b82f6]"
                )}
              >
                AI PIONEER
              </span>
            </div>
            <span 
              className={cn(
                "text-[10px] uppercase tracking-[0.2em] text-[#6b7a3d] font-medium",
                "transition-all duration-300",
                "group-hover:text-[#3b82f6]/80"
              )}
            >
              Program
            </span>
          </a>

          {/* Bottom Section - Two Buttons */}
          <div className="flex">
            {/* ZEN AI World */}
            <a
              href="https://zen.ai"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group flex-1 px-6 py-4 text-center",
                "border-r border-[#e0e0e0]/50",
                "transition-all duration-300 ease-out",
                "hover:bg-[#f0f7ff]",
                "hover:shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <Globe 
                  className={cn(
                    "w-5 h-5 text-[#6b7280] mb-1",
                    "transition-all duration-300",
                    "group-hover:text-[#3b82f6] group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  )} 
                />
                <span 
                  className={cn(
                    "font-bold text-xs text-[#374151]",
                    "transition-all duration-300",
                    "group-hover:text-[#3b82f6]"
                  )}
                >
                  ZENAI
                </span>
                <span 
                  className={cn(
                    "text-[9px] uppercase tracking-[0.15em] text-[#9ca3af] font-medium",
                    "transition-all duration-300",
                    "group-hover:text-[#3b82f6]/70"
                  )}
                >
                  World
                </span>
              </div>
            </a>

            {/* Arena */}
            <a
              href="https://zenarena.ai"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group flex-1 px-6 py-4 text-center",
                "transition-all duration-300 ease-out",
                "hover:bg-[#f0f7ff]",
                "hover:shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <Gamepad2 
                  className={cn(
                    "w-5 h-5 text-[#6b7280] mb-1",
                    "transition-all duration-300",
                    "group-hover:text-[#3b82f6] group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  )} 
                />
                <span 
                  className={cn(
                    "font-bold text-xs text-[#374151]",
                    "transition-all duration-300",
                    "group-hover:text-[#3b82f6]"
                  )}
                >
                  ARENA
                </span>
                <span 
                  className={cn(
                    "text-[9px] uppercase tracking-[0.15em] text-[#9ca3af] font-medium",
                    "transition-all duration-300",
                    "group-hover:text-[#3b82f6]/70"
                  )}
                >
                  Enter
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
