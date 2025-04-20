import { FC } from "react";
import { cn } from "@/lib/utils";

interface CreditCardPreviewProps {
  type: "standard" | "logo" | "design";
  className?: string;
  holderName?: string;
  secondLine?: string;
  uploadedLogo?: File | null;
}

export const CreditCardPreview: FC<CreditCardPreviewProps> = ({
  type,
  className,
  holderName,
  secondLine,
  uploadedLogo,
}) => {
  // Konstanten für die Kartendimensionen (Umrechnung von mm in viewBox-Einheiten)
  const CARD_WIDTH = 85.6;
  const CARD_HEIGHT = 54;
  const CHIP_WIDTH = 11.35;
  const CHIP_HEIGHT = 8.55;
  const CHIP_CENTER_TOP = 22.62;
  const CHIP_CENTER_LEFT = 15.06;
  const MC_LOGO_WIDTH = 22.4;
  const MC_LOGO_HEIGHT = 15.5;

  // Text Positionen (mm)
  const TEXT_LEFT_MARGIN = 7;
  const TEXT_BOTTOM_MARGIN = 3;
  const TEXT_TOTAL_HEIGHT = 7;
  const LINE_HEIGHT = TEXT_TOTAL_HEIGHT / 2;

  return (
    <div className={cn("relative aspect-[1.585] w-full", className)}>
      <svg
        viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
        className="h-full w-full rounded-lg shadow-lg"
      >
        {/* Kartenhintergrund */}
        <rect
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          fill={
            type === "logo"
              ? "#000000"
              : type === "standard"
                ? "#ffffff"
                : "url(#designPattern)"
          }
          rx="3.18"
          ry="3.18"
        />

        {/* StandardCard Design */}
        {type === "standard" && (
          <g>
            <path d="M0 0 h85.6 v54 h-85.6 Z" fill="#1F1F29" />
            <path
              d={`
              M0 0 
              h28.5 
              q-2 27, 0 54 
              h-28.5 Z`}
              fill="#45BFB7"
            />
            <path
              d={`
              M28.5 0 
              h28.5
              q-2 27, 0 54 
              h-28.5
              q-2 -27, 0 -54 
              Z`}
              fill="#FFD338"
            />
            <path
              d={`
              M57 0 
              h28.6
              v54 
              h-28.6
              q-2 -27, 0 -54 
              Z`}
              fill="#F5A623"
            />

            {/* givve Logo */}
            <g transform="translate(65, 5)">
              <rect width="6" height="6" fill="rgb(246,143,0)" />
              <text
                x="1"
                y="4.5"
                fill="white"
                fontSize="4"
                fontFamily="Arial Black"
              >
                Up
              </text>
              <text
                x="7"
                y="4.5"
                fill="rgb(246,143,0)"
                fontSize="4"
                fontFamily="Arial"
              >
                givve
              </text>
            </g>
          </g>
        )}

        {/* LogoCard Design mit diagonaler Linie */}
        {type === "logo" && (
          <>
            <path
              d={`M0 7 L${CARD_WIDTH / 2} ${CARD_HEIGHT / 2 + 7.75} L${CARD_WIDTH} ${CHIP_CENTER_TOP}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.5"
              transform="rotate(-13.7 0 7)"
            />
            <path
              d={`M0 0 L${CARD_WIDTH} 0 
                L${CARD_WIDTH} ${CHIP_CENTER_TOP}
                L${CARD_WIDTH / 2} ${CARD_HEIGHT / 2 + 7.75}
                L0 7 Z`}
              fill="#ffffff"
            />
          </>
        )}

        {/* Logo für LogoCard */}
        {type === "logo" && uploadedLogo && (
          <image
            x={CARD_WIDTH - 23}
            y={7}
            width={16}
            height={16}
            href={URL.createObjectURL(uploadedLogo)}
            preserveAspectRatio="xMidYMid slice"
          />
        )}

        {/* Platzhalter für Logo wenn keins hochgeladen ist */}
        {type === "logo" && !uploadedLogo && (
          <circle
            cx={CARD_WIDTH - 15}
            cy={15}
            r={8}
            fill="#e2e8f0"
            stroke="#64748b"
            strokeWidth="0.5"
          />
        )}

        {/* Chip */}
        <g
          transform={`translate(${CHIP_CENTER_LEFT - CHIP_WIDTH / 2} ${CHIP_CENTER_TOP - CHIP_HEIGHT / 2})`}
        >
          <rect
            width={CHIP_WIDTH}
            height={CHIP_HEIGHT}
            fill="#e2e8f0"
            rx="1"
            ry="1"
          />
          <path
            d={`M0 ${CHIP_HEIGHT / 3} h${CHIP_WIDTH} M0 ${(2 * CHIP_HEIGHT) / 3} h${CHIP_WIDTH}`}
            stroke="#d1d5db"
            strokeWidth="0.5"
          />
        </g>

        {/* Weißer Bereich für Mastercard Logo - nur links oben abgerundet */}
        <path
          d={`M${CARD_WIDTH - MC_LOGO_WIDTH} ${CARD_HEIGHT}
            h${MC_LOGO_WIDTH} v-${MC_LOGO_HEIGHT}
            h-${MC_LOGO_WIDTH} v${MC_LOGO_HEIGHT}
            M${CARD_WIDTH - MC_LOGO_WIDTH} ${CARD_HEIGHT - MC_LOGO_HEIGHT}
            q5 0 5 5`}
          fill="#FFFFFF"
        />

        {/* Mastercard Logo - überlappende Kreise */}
        <g
          transform={`translate(${CARD_WIDTH - MC_LOGO_WIDTH / 2} ${CARD_HEIGHT - MC_LOGO_HEIGHT / 2})`}
        >
          <circle cx="-3" cy="0" r="4.5" fill="#EB001B" opacity="0.9" />
          <circle cx="3" cy="0" r="4.5" fill="#F79E1B" opacity="0.9" />
        </g>

        {/* Blur-Effekt für Text */}
        <defs>
          <pattern id="designPattern" patternUnits="userSpaceOnUse" width="85.6" height="54">
            <image href="/assets/design-card-bg.jpg" width="85.6" height="54" preserveAspectRatio="xMidYMid slice"/>
          </pattern>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
          </filter>
        </defs>

        {/* Text-Hintergrund mit Blur */}
        <rect
          x={TEXT_LEFT_MARGIN - 1}
          y={CARD_HEIGHT - TEXT_BOTTOM_MARGIN - TEXT_TOTAL_HEIGHT - 1}
          width={CARD_WIDTH - TEXT_LEFT_MARGIN - MC_LOGO_WIDTH - 2}
          height={TEXT_TOTAL_HEIGHT + 2}
          fill={type === "standard" ? "#ffffff80" : "#00000080"}
          filter="url(#blur)"
        />

        {/* Kartenhalter Name und zweite Zeile */}
        <g
          transform={`translate(${TEXT_LEFT_MARGIN} ${CARD_HEIGHT - TEXT_BOTTOM_MARGIN - TEXT_TOTAL_HEIGHT})`}
        >
          {holderName && (
            <text
              y={LINE_HEIGHT}
              fontFamily="'OCR A Std', Monaco, monospace"
              fontSize="3.5"
              fill={type === "standard" ? "#000" : "#fff"}
              className="uppercase"
            >
              {holderName}
            </text>
          )}
          {secondLine && (
            <text
              y={TEXT_TOTAL_HEIGHT}
              fontFamily="'OCR A Std', Monaco, monospace"
              fontSize="3.5"
              fill={type === "standard" ? "#000" : "#fff"}
              className="uppercase"
            >
              {secondLine.slice(0, 21)}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
};