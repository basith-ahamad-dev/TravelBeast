/**
 * Sri Lankan heritage divider for the bottom edge of the hero:
 * hill-country ridges that fade into white, with a repeating skyline of
 * lotus, coconut palm and dagoba (stupa) silhouettes standing on the white ground.
 * Pure SVG, no client JS. Height: 62px of ground + 72px of motifs (ridges rise a bit higher).
 */
export function LankaDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 bottom-0 h-[190px] ${className}`}>
      {/* rolling hill-country ridges (translucent white, so the hero photo shows through) */}
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[62px] h-[120px] w-full">
        <path
          fill="#fff"
          fillOpacity=".22"
          d="M0 62C110 34 230 28 350 50S560 74 690 48 900 22 1040 46 1300 66 1440 36V120H0Z"
        />
        <path
          fill="#fff"
          fillOpacity=".5"
          d="M0 96C140 74 250 70 390 86S620 104 760 84 1000 72 1150 90 1360 82 1440 74V120H0Z"
        />
      </svg>

      {/* repeating motif row: lotus - coconut palm - dagoba */}
      <svg width="100%" height="72" className="absolute inset-x-0 bottom-[62px] [filter:drop-shadow(0_-1px_3px_rgba(7,54,90,0.28))]" preserveAspectRatio="none">
        <defs>
          <pattern id="lanka-motifs" width="360" height="72" patternUnits="userSpaceOnUse">
            {/* lotus */}
            <g fill="#fff">
              <path d="M60 72C47 54 51 34 60 20C69 34 73 54 60 72Z" />
              <path d="M58 72C40 66 28 52 26 38C44 42 56 54 58 72Z" />
              <path d="M62 72C80 66 92 52 94 38C76 42 64 54 62 72Z" />
              <path d="M56 72C32 72 16 62 8 52C28 51 48 58 56 72Z" />
              <path d="M64 72C88 72 104 62 112 52C92 51 72 58 64 72Z" />
            </g>
            {/* coconut palm */}
            <g fill="#fff">
              <path d="M177 72C180 56 186 42 192 30L196 32C191 44 187 58 186 72Z" />
              <path d="M194 31C180 22 164 24 152 40C166 33 180 32 194 34Z" />
              <path d="M194 31C184 16 168 10 154 16C170 18 182 24 194 33Z" />
              <path d="M194 31C196 14 206 6 220 8C208 12 200 20 195 33Z" />
              <path d="M194 31C208 22 224 24 236 40C222 33 208 32 194 34Z" />
              <path d="M194 31C206 18 222 14 234 22C220 22 206 26 194 33Z" />
            </g>
            {/* dagoba / stupa */}
            <g fill="#fff">
              <path d="M262 72V67H338V72Z" />
              <path d="M270 67V63H330V67Z" />
              <path d="M276 63C276 46 290 38 300 38S324 46 324 63Z" />
              <path d="M292 38V30H308V38Z" />
              <path d="M296 30L300 12L304 30Z" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="72" fill="url(#lanka-motifs)" />
      </svg>

      {/* white ground: the divider melts into the page below */}
      <div className="absolute inset-x-0 bottom-0 h-[63px] bg-white" />
    </div>
  );
}
