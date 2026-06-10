const HOME_DARK = "#161c43";

const CLUB_COLORS: Record<string, { letter: string; background: string }> = {
  Ajax: { letter: "#D2122E", background: "#FFFFFF" },
  PSV: { letter: "#ED1C24", background: "#FFFFFF" },
  Feyenoord: { letter: "#D8232A", background: "#FFFFFF" },
  AZ: { letter: "#DB0021", background: "#FFFFFF" },
  "FC Twente": { letter: "#E6001A", background: "#FFFFFF" },
  "FC Utrecht": { letter: "#ED1A2F", background: "#FFFFFF" },
  Vitesse: { letter: "#000000", background: "#FCD205" },
  "SC Heerenveen": { letter: "#004F9F", background: "#FFFFFF" },
  Groningen: { letter: "#018F59", background: "#FFFFFF" },
  "FC Groningen": { letter: "#018F59", background: "#FFFFFF" },
  "Sparta Rotterdam": { letter: "#DE1C39", background: "#FFFFFF" },
  NEC: { letter: "#007A3D", background: "#E30613" },
  "Willem II": { letter: "#BC1919", background: "#242C51" },
  "NAC Breda": { letter: "#000000", background: "#FFD200" },
  "ADO Den Haag": { letter: "#006D2D", background: "#FFED00" },
  "Heracles Almelo": { letter: "#FFFFFF", background: "#000000" },
  "PEC Zwolle": { letter: "#0154A1", background: "#FFFFFF" },
  "Go Ahead Eagles": { letter: "#FFED00", background: "#D71920" },
  "Roda JC": { letter: "#000000", background: "#FFD200" },
  "Fortuna Sittard": { letter: "#00684C", background: "#FFE500" },
  Telstar: { letter: "#005BAC", background: "#FFFFFF" },
  "FC Volendam": { letter: "#F58220", background: "#FFFFFF" },
  Excelsior: { letter: "#000000", background: "#E30613" },
  "SC Cambuur": { letter: "#0057A8", background: "#FFD100" },
  "De Graafschap": { letter: "#005BAC", background: "#FFFFFF" },
  "RKC Waalwijk": { letter: "#2B63B7", background: "#FEE816" },
  "VVV-Venlo": { letter: "#12100B", background: "#FEE000" },
  "FC Emmen": { letter: "#E33A3A", background: "#FFFFFF" },
};

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const fullHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;

  const value = Number.parseInt(fullHex, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function toRgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isVeryLight(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.85;
}

export function getRolledTeamCardTheme(club?: string | null) {
  const colors = club ? CLUB_COLORS[club] : null;

  if (!colors) {
    return {
      cardStyle: undefined,
      eyebrowStyle: undefined,
      noteStyle: undefined,
    };
  }

  const primaryColor = isVeryLight(colors.background) ? colors.letter : colors.background;
  const accentColor = colors.letter === "#FFFFFF" ? colors.background : colors.letter;

  return {
    cardStyle: {
      borderColor: toRgba(accentColor, 0.34),
      backgroundImage: [
        `radial-gradient(circle at top right, ${toRgba(accentColor, 0.22)} 0%, transparent 42%)`,
        `linear-gradient(135deg, ${toRgba(primaryColor, 0.76)} 0%, ${toRgba(primaryColor, 0.58)} 48%, ${toRgba(HOME_DARK, 0.92)} 100%)`,
        "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
      ].join(", "),
      boxShadow: `inset 0 1px 0 ${toRgba("#FFFFFF", 0.08)}`,
    } as const,
    eyebrowStyle: {
      color: toRgba("#FFFFFF", 0.74),
    } as const,
    noteStyle: {
      color: toRgba("#FFFFFF", 0.88),
    } as const,
  };
}
