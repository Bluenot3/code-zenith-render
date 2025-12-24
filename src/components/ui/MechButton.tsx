import { cn } from "@/lib/utils";

interface MechButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const MechButton = ({ href, children, className }: MechButtonProps) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "btn-mech group outline-none touch-manipulation",
        "p-1.5 sm:p-2 rounded-lg",
        "bg-gradient-to-b from-[#f5f5f5] to-[#e0e0e0]",
        "shadow-[0_2px_5px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)]",
        className
      )}
    >
      <div
        className={cn(
          "btn-mech-inner",
          "px-3 py-2 sm:px-4 sm:py-2.5 rounded-md",
          "bg-gradient-to-br from-white to-[#f0f0f0]",
          "border-2 border-[#d0d0d0]",
          "shadow-[inset_2px_2px_5px_#d0d0d0,inset_-2px_-2px_5px_#ffffff]",
          "flex items-center justify-center",
          "text-[#333] font-code text-[10px] sm:text-xs font-semibold tracking-wide",
          "transition-all duration-200 ease-out",
          "group-hover:border-[#3b82f6]",
          "group-hover:shadow-[inset_2px_2px_5px_#d0d0d0,inset_-2px_-2px_5px_#ffffff,0_0_15px_rgba(59,130,246,0.3),0_0_30px_rgba(59,130,246,0.15)]",
          "group-hover:text-[#3b82f6]",
          "group-active:bg-[#e8e8e8]",
          "group-active:shadow-[inset_0_0_10px_#c0c0c0]",
          "group-active:scale-[0.97]"
        )}
      >
        {children}
      </div>
    </a>
  );
};
