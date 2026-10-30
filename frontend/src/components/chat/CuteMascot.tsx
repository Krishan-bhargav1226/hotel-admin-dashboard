import { useEffect, useState, useRef } from "react";

interface CuteMascotProps {
  emotion?: "happy" | "thinking" | "waving" | "sparkle" | "sleepy" | "wink";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  isFloating?: boolean;
  interactive?: boolean;
}

const SIZES = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 60,
  xl: 76,
};

export default function CuteMascot({
  emotion = "happy",
  size = "md",
  className = "",
  isFloating = false,
  interactive = true,
}: CuteMascotProps) {
  const pixelSize = SIZES[size] || 48;
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Natural blinking effect every 3.2 - 5 seconds
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const scheduleBlink = () => {
      const delay = Math.random() * 2500 + 3000;
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 180);
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Subtle eye tracking on mouse movement near mascot
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const diffX = e.clientX - centerX;
      const diffY = e.clientY - centerY;
      const dist = Math.sqrt(diffX * diffX + diffY * diffY);

      // Only track when cursor is within 400px
      if (dist < 400) {
        const factor = Math.min(dist / 400, 1);
        const maxOffset = 2.2;
        const normX = (diffX / (dist || 1)) * maxOffset * factor;
        const normY = (diffY / (dist || 1)) * (maxOffset * 0.7) * factor;
        setEyeOffset({ x: normX, y: normY });
      } else {
        setEyeOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive]);

  const currentEmotion = isHovered && emotion === "happy" ? "wink" : emotion;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative select-none inline-flex items-center justify-center transition-transform duration-300 ${
        isFloating ? "animate-bounce-gentle" : ""
      } ${isHovered ? "scale-105" : ""} ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg
        viewBox="0 0 100 100"
        width={pixelSize}
        height={pixelSize}
        className="overflow-visible drop-shadow-md transition-all duration-300"
      >
        <defs>
          {/* Plush Body Gradient - Golden Honey / Warm Yellow */}
          <radialGradient id="dotPlush" cx="35%" cy="28%" r="75%">
            <stop offset="0%" stopColor="#FFF4BD" />
            <stop offset="35%" stopColor="#FFCC38" />
            <stop offset="85%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </radialGradient>

          {/* Inner Ear Soft Pink */}
          <radialGradient id="dotInnerEar" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFF1F2" />
            <stop offset="65%" stopColor="#FDA4AF" />
            <stop offset="100%" stopColor="#F43F5E" />
          </radialGradient>

          {/* Bellhop Concierge Hat */}
          <linearGradient id="dotHat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#9F1239" />
          </linearGradient>

          {/* Gold Trim */}
          <linearGradient id="dotGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Glow Shadow */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* --- Ears (Perky Bunny Ears that twitch on hover) --- */}
        <g
          className="transition-transform duration-300 origin-bottom"
          style={{
            transform: isHovered ? "scale(1.06) translateY(-1px)" : "scale(1)",
          }}
        >
          {/* Left Ear */}
          <ellipse
            cx="32"
            cy="19"
            rx="8.8"
            ry="18.5"
            fill="url(#dotPlush)"
            transform="rotate(-16 32 19)"
            filter="url(#softGlow)"
          />
          <ellipse
            cx="32"
            cy="20"
            rx="4.8"
            ry="12.5"
            fill="url(#dotInnerEar)"
            transform="rotate(-16 32 20)"
            opacity="0.88"
          />

          {/* Right Ear */}
          <ellipse
            cx="68"
            cy="19"
            rx="8.8"
            ry="18.5"
            fill="url(#dotPlush)"
            transform="rotate(16 68 19)"
            filter="url(#softGlow)"
          />
          <ellipse
            cx="68"
            cy="20"
            rx="4.8"
            ry="12.5"
            fill="url(#dotInnerEar)"
            transform="rotate(16 68 20)"
            opacity="0.88"
          />
        </g>

        {/* --- Main Round Plush Body --- */}
        <ellipse
          cx="50"
          cy="58"
          rx="38"
          ry="34"
          fill="url(#dotPlush)"
          filter="url(#softGlow)"
        />

        {/* Soft 3D Highlight on top of head */}
        <ellipse
          cx="42"
          cy="37"
          rx="18"
          ry="8"
          fill="#FFFFFF"
          opacity="0.45"
          transform="rotate(-15 42 37)"
        />

        {/* --- Bellhop Concierge Hat --- */}
        <g
          transform="translate(42, 21) rotate(6)"
          className="transition-transform duration-300"
          style={{ transform: isHovered ? "translate(42px, 19px) rotate(8deg)" : "translate(42px, 21px) rotate(6deg)" }}
        >
          <path
            d="M -12 6 C -12 0, 16 0, 16 6 L 14 14 C 14 16, -10 16, -10 14 Z"
            fill="url(#dotHat)"
          />
          {/* Hat Gold Band */}
          <path
            d="M -11 11 L 15 11 L 14 14 L -10 14 Z"
            fill="url(#dotGold)"
          />
          {/* Hat Star Button */}
          <circle cx="2" cy="7" r="2.5" fill="#FEF08A" />
        </g>

        {/* --- Cute Blushing Cheeks --- */}
        <g opacity="0.7">
          <ellipse cx="26" cy="65" rx="6.8" ry="4.2" fill="#FB7185" />
          <ellipse cx="74" cy="65" rx="6.8" ry="4.2" fill="#FB7185" />
        </g>

        {/* --- Interactive Eyes --- */}
        {isBlinking ? (
          // Blinking: Sleek closed curves
          <g>
            <path
              d="M 31 54 Q 36 58 41 54"
              fill="none"
              stroke="#1C1917"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M 59 54 Q 64 58 69 54"
              fill="none"
              stroke="#1C1917"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </g>
        ) : currentEmotion === "thinking" ? (
          // Thinking / curious expression
          <g transform={`translate(${eyeOffset.x * 0.5}, ${eyeOffset.y * 0.5})`}>
            <circle cx="36" cy="54" r="4.6" fill="#1C1917" />
            <ellipse cx="64" cy="51" rx="4.8" ry="6.2" fill="#1C1917" />
            <circle cx="38" cy="52" r="1.6" fill="#FFFFFF" />
            <circle cx="66" cy="49" r="2.2" fill="#FFFFFF" />
          </g>
        ) : currentEmotion === "wink" || currentEmotion === "waving" ? (
          // Joyful wink
          <g>
            <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
              <circle cx="36" cy="53" r="5.2" fill="#1C1917" />
              <circle cx="38" cy="51" r="2.2" fill="#FFFFFF" />
              <circle cx="34" cy="55" r="1" fill="#FFFFFF" />
            </g>
            {/* Wink on right eye */}
            <path
              d="M 60 55 Q 65 48 70 55"
              fill="none"
              stroke="#1C1917"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
          </g>
        ) : currentEmotion === "sleepy" ? (
          // Closed smiling eyes
          <g>
            <path
              d="M 31 54 Q 36 60 41 54"
              fill="none"
              stroke="#1C1917"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M 59 54 Q 64 60 69 54"
              fill="none"
              stroke="#1C1917"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </g>
        ) : (
          // Happy Sparkling Anime Eyes with interactive gaze offset
          <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
            {/* Left Eye */}
            <circle cx="36" cy="53" r="5.3" fill="#1C1917" />
            <circle cx="38.2" cy="50.8" r="2.2" fill="#FFFFFF" />
            <circle cx="34.5" cy="55" r="1" fill="#FFFFFF" />

            {/* Right Eye */}
            <circle cx="64" cy="53" r="5.3" fill="#1C1917" />
            <circle cx="66.2" cy="50.8" r="2.2" fill="#FFFFFF" />
            <circle cx="62.5" cy="55" r="1" fill="#FFFFFF" />
          </g>
        )}

        {/* --- Cute Little Nose --- */}
        <ellipse cx="50" cy="57" rx="2" ry="1.4" fill="#C2410C" opacity="0.85" />

        {/* --- Cute Mouth --- */}
        {currentEmotion === "thinking" ? (
          // Tiny curious 'o' mouth
          <circle cx="50" cy="62" r="1.8" fill="#1C1917" />
        ) : currentEmotion === "wink" || currentEmotion === "waving" ? (
          // Playful open smile
          <path
            d="M 46 60 Q 50 66 54 60 Z"
            fill="#E11D48"
            stroke="#1C1917"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        ) : (
          // Cute 'w' mouth
          <path
            d="M 45 61 Q 48 64 50 61 Q 52 64 55 61"
            fill="none"
            stroke="#1C1917"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}

        {/* --- Cute Concierge Collar & Golden Bell --- */}
        <g transform="translate(50, 78)">
          {/* Red Ribbon Collar */}
          <path
            d="M -9 -3 L 9 -3 L 7 3 L -7 3 Z"
            fill="#E11D48"
          />
          {/* Golden Bell Center */}
          <circle cx="0" cy="0" r="3.4" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
          <circle cx="-0.8" cy="-0.8" r="0.9" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}
