import { readFile, writeFile } from "node:fs/promises";

const readmePath = new URL("../README.md", import.meta.url);
const compassPath = new URL("../assets/creative-compass.svg", import.meta.url);
const startMarker = "<!-- CREATIVE-COMPASS:START -->";
const endMarker = "<!-- CREATIVE-COMPASS:END -->";
const timeZone = "Asia/Manila";

const dailyDirections = {
  Monday: {
    mode: "EXPLORE",
    note: "Notice patterns and gather fresh inspiration.",
  },
  Tuesday: {
    mode: "IMAGINE",
    note: "Turn good questions into possible directions.",
  },
  Wednesday: {
    mode: "SHAPE",
    note: "Give promising ideas a clear and useful form.",
  },
  Thursday: {
    mode: "REFINE",
    note: "Make the useful feel simple and effortless.",
  },
  Friday: {
    mode: "POLISH",
    note: "Strengthen the details that people can feel.",
  },
  Saturday: {
    mode: "LEARN",
    note: "Follow curiosity into something new today.",
  },
  Sunday: {
    mode: "RESET",
    note: "Create space for the next meaningful idea.",
  },
};

function manilaDateParts(value = new Date()) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone,
  }).format(value);
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone,
  })
    .format(value)
    .toUpperCase();

  return { date, weekday };
}

function buildCreativeCompass() {
  const { date, weekday } = manilaDateParts();
  const direction = dailyDirections[weekday];

  return `<svg width="1200" height="310" viewBox="0 0 1200 310" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" text-rendering="geometricPrecision">
  <title id="title">Josephine&apos;s creative compass</title>
  <desc id="desc">A daily creative direction and three principles: clarity, empathy, and curiosity.</desc>
  <defs>
    <linearGradient id="background" x1="20" y1="14" x2="1180" y2="296" gradientUnits="userSpaceOnUse">
      <stop stop-color="#08111F"/>
      <stop offset="0.54" stop-color="#10152A"/>
      <stop offset="1" stop-color="#1A1026"/>
    </linearGradient>
    <linearGradient id="orbit" x1="130" y1="117" x2="290" y2="117" gradientUnits="userSpaceOnUse">
      <stop stop-color="#5EEAD4"/>
      <stop offset="0.52" stop-color="#A78BFA"/>
      <stop offset="1" stop-color="#FB7185"/>
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1048 20) rotate(143) scale(310 410)">
      <stop stop-color="#8B5CF6" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#8B5CF6" stop-opacity="0"/>
    </radialGradient>
    <filter id="dotGlow" x="-300%" y="-300%" width="700%" height="700%" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <style>text { opacity: 0.999; }</style>
  </defs>

  <rect x="1" y="1" width="1198" height="308" rx="24" fill="url(#background)" stroke="#334155" stroke-opacity="0.76" stroke-width="2"/>
  <rect x="1" y="1" width="1198" height="308" rx="24" fill="url(#glow)"/>
  <text x="40" y="49" fill="#F8FAFC" font-family="Arial, sans-serif" font-size="20" font-weight="800" letter-spacing="0.4">DAILY CREATIVE RHYTHM</text>
  <text x="1160" y="48" fill="#94A3B8" font-family="Consolas, monospace" font-size="12" text-anchor="end">${weekday.toUpperCase()} &#183; ${date} &#183; MANILA</text>

  <g transform="translate(36 72)">
    <rect width="420" height="210" rx="19" fill="#080D19" stroke="#5EEAD4" stroke-opacity="0.24"/>
    <text x="28" y="35" fill="#99F6E4" font-family="Consolas, monospace" font-size="12" font-weight="700" letter-spacing="1.2">TODAY&apos;S DIRECTION</text>
    <circle cx="210" cy="116" r="66" fill="#0D1525" stroke="url(#orbit)" stroke-opacity="0.65" stroke-width="2"/>
    <circle cx="210" cy="116" r="52" fill="none" stroke="#334155" stroke-dasharray="3 8"/>
    <path d="M210 45V60M210 172V187M139 116H154M266 116H281" stroke="#64748B" stroke-width="2" stroke-linecap="round"/>
    <g>
      <circle cx="210" cy="50" r="5" fill="#5EEAD4" filter="url(#dotGlow)"/>
      <animateTransform attributeName="transform" type="rotate" from="0 210 116" to="360 210 116" dur="9s" repeatCount="indefinite"/>
    </g>
    <circle cx="210" cy="116" r="7" fill="#A78BFA" fill-opacity="0.2">
      <animate attributeName="r" values="7;17;7" dur="2.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;0;0.8" dur="2.4s" repeatCount="indefinite"/>
    </circle>
    <text x="210" y="122" fill="#F8FAFC" font-family="Arial, sans-serif" font-size="29" font-weight="800" text-anchor="middle" letter-spacing="1">${direction.mode}</text>
    <text x="210" y="196" fill="#94A3B8" font-family="Arial, sans-serif" font-size="13" text-anchor="middle">${direction.note}</text>
  </g>

  <g transform="translate(480 72)">
    <rect width="684" height="210" rx="19" fill="#080D19" stroke="#A78BFA" stroke-opacity="0.25"/>
    <text x="28" y="35" fill="#C4B5FD" font-family="Consolas, monospace" font-size="12" font-weight="700" letter-spacing="1.2">WHAT GUIDES ME</text>

    <g transform="translate(28 58)">
      <rect width="194" height="124" rx="15" fill="#0B1421" stroke="#5EEAD4" stroke-opacity="0.24"/>
      <circle cx="28" cy="28" r="10" fill="#5EEAD4" fill-opacity="0.13" stroke="#5EEAD4"/>
      <path d="M23 28L27 32L34 24" stroke="#99F6E4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="48" y="33" fill="#F8FAFC" font-family="Arial, sans-serif" font-size="17" font-weight="700">Clarity</text>
      <text x="20" y="74" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12">Make every interaction</text>
      <text x="20" y="94" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12">easy to understand.</text>
    </g>

    <g transform="translate(245 58)">
      <rect width="194" height="124" rx="15" fill="#111024" stroke="#A78BFA" stroke-opacity="0.27"/>
      <circle cx="28" cy="28" r="10" fill="#A78BFA" fill-opacity="0.13" stroke="#A78BFA"/>
      <path d="M28 34C22 30 20 27 20 24C20 19 26 18 28 22C30 18 36 19 36 24C36 27 34 30 28 34Z" stroke="#C4B5FD" stroke-width="1.8" stroke-linejoin="round"/>
      <text x="48" y="33" fill="#F8FAFC" font-family="Arial, sans-serif" font-size="17" font-weight="700">Empathy</text>
      <text x="20" y="74" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12">Design around people</text>
      <text x="20" y="94" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12">and their real needs.</text>
    </g>

    <g transform="translate(462 58)">
      <rect width="194" height="124" rx="15" fill="#1B0F1B" stroke="#FB7185" stroke-opacity="0.25"/>
      <circle cx="28" cy="28" r="10" fill="#FB7185" fill-opacity="0.12" stroke="#FB7185"/>
      <path d="M28 19L30.2 25.8L37 28L30.2 30.2L28 37L25.8 30.2L19 28L25.8 25.8L28 19Z" stroke="#FDA4AF" stroke-width="1.8" stroke-linejoin="round"/>
      <text x="48" y="33" fill="#F8FAFC" font-family="Arial, sans-serif" font-size="17" font-weight="700">Curiosity</text>
      <text x="20" y="74" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12">Keep exploring better</text>
      <text x="20" y="94" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12">ways to create.</text>
    </g>
  </g>
</svg>
`;
}

function buildReadmeFeature() {
  return [
    startMarker,
    '<img src="./assets/creative-compass.svg" alt="Daily creative direction guided by clarity, empathy, and curiosity" width="100%" />',
    "",
    '<p align="center"><sub>A daily creative direction, refreshed in Manila time.</sub></p>',
    endMarker,
  ].join("\n");
}

const [readme, currentCompass] = await Promise.all([
  readFile(readmePath, "utf8"),
  readFile(compassPath, "utf8").catch((error) => {
    if (error.code === "ENOENT") {
      return "";
    }

    throw error;
  }),
]);

const startIndex = readme.indexOf(startMarker);
const endIndex = readme.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
  throw new Error("Creative Compass markers are missing or out of order.");
}

const feature = buildReadmeFeature();
const compass = buildCreativeCompass();
const updatedReadme = `${readme.slice(0, startIndex)}${feature}${readme.slice(endIndex + endMarker.length)}`;
const readmeIsCurrent = updatedReadme === readme;
const compassIsCurrent = compass === currentCompass;

if (process.argv.includes("--check")) {
  if (!readmeIsCurrent || !compassIsCurrent) {
    throw new Error("Creative Compass is not current. Run: node scripts/update-profile.mjs");
  }

  console.log("Creative Compass is current.");
} else if (readmeIsCurrent && compassIsCurrent) {
  console.log("Creative Compass is already current.");
} else {
  const writes = [];

  if (!readmeIsCurrent) {
    writes.push(writeFile(readmePath, updatedReadme));
  }

  if (!compassIsCurrent) {
    writes.push(writeFile(compassPath, compass));
  }

  await Promise.all(writes);
  console.log("Creative Compass updated.");
}
