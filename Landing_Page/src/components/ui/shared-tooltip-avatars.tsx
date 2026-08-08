"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AvatarItem {
  id: string;
  name: string;
  image: string;
}

export interface SharedTooltipAvatarsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: AvatarItem[];
  avatarClassName?: string;
  imageClassName?: string;
}

export function SharedTooltipAvatars({ 
  items, 
  className, 
  avatarClassName,
  imageClassName,
  ...props 
}: SharedTooltipAvatarsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });
  const [activeName, setActiveName] = useState("");
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const avatarRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleMouseEnter = (index: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const avatar = avatarRefs.current[index];
    if (avatar) {
      const left = avatar.offsetLeft + avatar.offsetWidth / 2;
      const top = avatar.offsetTop;

      setTooltipPos({ left, top });
      setActiveName(items[index].name);
      setHoveredIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHoveredIndex(null);
    }, 150);
  };

  return (
    <div 
      className={cn("relative flex items-center justify-center", className)} 
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, x: "-50%", y: "-80%", scale: 0.95, left: tooltipPos.left, top: tooltipPos.top - 12 }}
            animate={{ 
              opacity: 1, 
              x: "-50%", 
              y: "-100%", 
              scale: 1,
              left: tooltipPos.left,
              top: tooltipPos.top - 12
            }}
            exit={{ opacity: 0, x: "-50%", y: "-80%", scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: 'absolute',
              zIndex: 99999,
              left: tooltipPos.left,
              top: tooltipPos.top - 12,
              transform: 'translate(-50%, -100%)',
              width: 'max-content',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              padding: '6px 14px',
              backgroundColor: '#0a0a0a',
              borderRadius: '8px',
              border: '1px solid #262626',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.5)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '600',
              lineHeight: '1.2',
              whiteSpace: 'nowrap',
              pointerEvents: 'none'
            }}
            role="tooltip"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={activeName}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#ffffff',
                  lineHeight: '1.2',
                  margin: 0,
                  padding: 0
                }}
              >
                {activeName || " "}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Stack */}
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={(el) => { avatarRefs.current[index] = el; }}
          style={{ 
            zIndex: hoveredIndex === index ? 50 : items.length - index,
            width: '32px',
            height: '32px',
            marginLeft: index === 0 ? '0px' : '-12px'
          }}
          className={cn(
            "avatar-stack-item relative cursor-pointer flex-shrink-0 transition-all duration-300 ease-out",
            avatarClassName
          )}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          onFocus={() => handleMouseEnter(index)}
          onBlur={handleMouseLeave}
          tabIndex={0}
          role="listitem"
        >
          <div className={cn("w-full h-full rounded-full flex items-center justify-center bg-black border-[1.5px] border-white/80 dark:border-white/85 shadow-sm transition-all duration-300", imageClassName)}>
            <img
              src={item.image}
              alt={item.name}
              className="w-[82%] h-[82%] object-contain"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default SharedTooltipAvatars;
