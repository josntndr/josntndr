import { readFile, writeFile } from "node:fs/promises";

const username = process.env.PROFILE_USERNAME || "josntndr";
const readmePath = new URL("../README.md", import.meta.url);
const pulsePath = new URL("../assets/project-pulse.svg", import.meta.url);
const startMarker = "<!-- PROJECT-PULSE:START -->";
const endMarker = "<!-- PROJECT-PULSE:END -->";

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": `${username}-project-pulse`,
  "X-GitHub-Api-Version": "2022-11-28",
};

if (process.env.GH_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GH_TOKEN}`;
}

async function getJson(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API request failed (${response.status}): ${path}`);
  }

  return response.json();
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function truncate(value, maximumLength) {
  if (value.length <= maximumLength) {
    return value;
  }

  return `${value.slice(0, maximumLength - 1)}...`;
}

function languageColor(language) {
  const colors = {
    "C++": "#60A5FA",
    CSS: "#38BDF8",
    JavaScript: "#FACC15",
    PHP: "#A78BFA",
    Python: "#5EEAD4",
    TypeScript: "#60A5FA",
  };

  return colors[language] || "#94A3B8";
}

function buildRecentTrail(repositories) {
  return repositories
    .map((repository, index) => {
      const y = 77 + index * 53;
      const language = repository.language || "Project";
      const color = languageColor(repository.language);
      const name = truncate(repository.name, 26);

      return [
        `    <g transform="translate(0 ${y})">`,
        `      <circle cx="30" cy="0" r="5" fill="${color}">`,
        `        <animate attributeName="r" values="4;7;4" dur="2.4s" begin="${index * 0.4}s" repeatCount="indefinite"/>`,
        "      </circle>",
        `      <text x="54" y="-2" fill="#F8FAFC" font-family="Arial, sans-serif" font-size="17" font-weight="700">${escapeXml(name)}</text>`,
        `      <text x="54" y="19" fill="#94A3B8" font-family="Consolas, monospace" font-size="12">${escapeXml(language)} &#183; ${formatDate(repository.pushed_at)}</text>`,
        "    </g>",
      ].join("\n");
    })
    .join("\n");
}

function buildProjectPulse(repositories) {
  const latest = repositories[0];
  const recent = repositories.slice(1, 4);
  const language = latest.language || "Project";
  const color = languageColor(latest.language);
  const latestName = truncate(latest.name, 30);
  const latestNameSize = latestName.length > 22 ? 31 : 38;
  const pillWidth = Math.max(90, language.length * 8 + 34);
  const lastSync = formatDate(new Date()).toUpperCase();

  return `<svg width="1200" height="310" viewBox="0 0 1200 310" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" text-rendering="geometricPrecision">
  <title id="title">Josephine&apos;s current project pulse</title>
  <desc id="desc">The latest repository and three recently updated projects, curated automatically from GitHub.</desc>
  <defs>
    <linearGradient id="background" x1="22" y1="18" x2="1178" y2="292" gradientUnits="userSpaceOnUse">
      <stop stop-color="#08111F"/>
      <stop offset="0.55" stop-color="#10152A"/>
      <stop offset="1" stop-color="#1B1025"/>
    </linearGradient>
    <linearGradient id="signal" x1="30" y1="170" x2="638" y2="170" gradientUnits="userSpaceOnUse">
      <stop stop-color="#5EEAD4"/>
      <stop offset="0.5" stop-color="#A78BFA"/>
      <stop offset="1" stop-color="#FB7185"/>
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1034 26) rotate(139) scale(300 390)">
      <stop stop-color="#8B5CF6" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#8B5CF6" stop-opacity="0"/>
    </radialGradient>
    <style>text { opacity: 0.999; }</style>
  </defs>

  <rect x="1" y="1" width="1198" height="308" rx="24" fill="url(#background)" stroke="#334155" stroke-opacity="0.76" stroke-width="2"/>
  <rect x="1" y="1" width="1198" height="308" rx="24" fill="url(#glow)"/>
  <text x="40" y="49" fill="#F8FAFC" font-family="Arial, sans-serif" font-size="20" font-weight="800" letter-spacing="0.4">PROJECT PULSE</text>
  <text x="1160" y="48" fill="#94A3B8" font-family="Consolas, monospace" font-size="12" text-anchor="end">SYNCED ${lastSync} UTC</text>

  <g transform="translate(36 72)">
    <rect width="670" height="210" rx="19" fill="#080D19" stroke="#5EEAD4" stroke-opacity="0.24"/>
    <circle cx="31" cy="31" r="5" fill="${color}"/>
    <circle cx="31" cy="31" r="8" fill="none" stroke="${color}" stroke-width="1.5">
      <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
    </circle>
    <text x="55" y="36" fill="#94A3B8" font-family="Consolas, monospace" font-size="12" font-weight="700" letter-spacing="1.2">CURRENT SIGNAL</text>
    <text x="30" y="94" fill="#F8FAFC" font-family="Arial, sans-serif" font-size="${latestNameSize}" font-weight="800" letter-spacing="-0.6">${escapeXml(latestName)}</text>
    <rect x="30" y="112" width="${pillWidth}" height="29" rx="14.5" fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-opacity="0.45"/>
    <text x="${30 + pillWidth / 2}" y="131" fill="${color}" font-family="Arial, sans-serif" font-size="12" font-weight="700" text-anchor="middle">${escapeXml(language.toUpperCase())}</text>
    <text x="${48 + pillWidth}" y="131" fill="#CBD5E1" font-family="Consolas, monospace" font-size="12">UPDATED ${formatDate(latest.pushed_at).toUpperCase()}</text>
    <path d="M30 169H70L83 157L97 182L113 148L129 174L143 164H187L201 154L215 178L231 151L247 169H638" stroke="#1E293B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M30 169H70L83 157L97 182L113 148L129 174L143 164H187L201 154L215 178L231 151L247 169H638" stroke="url(#signal)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 12">
      <animate attributeName="stroke-dashoffset" from="0" to="-44" dur="1.6s" repeatCount="indefinite"/>
    </path>
    <text x="30" y="198" fill="#64748B" font-family="Consolas, monospace" font-size="11" letter-spacing="0.8">SELECT TO OPEN THE LATEST REPOSITORY &#8599;</text>
  </g>

  <g transform="translate(730 72)">
    <rect width="434" height="210" rx="19" fill="#080D19" stroke="#A78BFA" stroke-opacity="0.25"/>
    <text x="28" y="36" fill="#C4B5FD" font-family="Consolas, monospace" font-size="12" font-weight="700" letter-spacing="1.2">RECENT TRAIL</text>
    <path d="M30 77V183" stroke="#334155" stroke-width="2" stroke-dasharray="3 7"/>
${buildRecentTrail(recent)}
  </g>
</svg>
`;
}

function buildReadmeFeature(latestRepository) {
  return [
    startMarker,
    `<a href="${escapeXml(latestRepository.html_url)}">`,
    '  <img src="./assets/project-pulse.svg" alt="Latest project spotlight and recent GitHub project trail" width="100%" />',
    "</a>",
    "",
    '<p align="center"><sub>Automatically curated from my latest public builds. Select the pulse to open the newest repository.</sub></p>',
    endMarker,
  ].join("\n");
}

const [repositories, readme, currentPulse] = await Promise.all([
  getJson(`/users/${username}/repos?type=owner&sort=pushed&direction=desc&per_page=100`),
  readFile(readmePath, "utf8"),
  readFile(pulsePath, "utf8").catch((error) => {
    if (error.code === "ENOENT") {
      return "";
    }

    throw error;
  }),
]);

const activeRepositories = repositories
  .filter((repository) => !repository.fork && !repository.archived && repository.name !== username)
  .sort((first, second) => new Date(second.pushed_at) - new Date(first.pushed_at));

if (activeRepositories.length < 4) {
  throw new Error("Project Pulse requires at least four active public repositories.");
}

const startIndex = readme.indexOf(startMarker);
const endIndex = readme.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
  throw new Error("Project Pulse markers are missing or out of order.");
}

const feature = buildReadmeFeature(activeRepositories[0]);
const pulse = buildProjectPulse(activeRepositories);
const updatedReadme = `${readme.slice(0, startIndex)}${feature}${readme.slice(endIndex + endMarker.length)}`;
const readmeIsCurrent = updatedReadme === readme;
const pulseIsCurrent = pulse === currentPulse;

if (process.argv.includes("--check")) {
  if (!readmeIsCurrent || !pulseIsCurrent) {
    throw new Error("Project Pulse is not current. Run: node scripts/update-profile.mjs");
  }

  console.log("Project Pulse is current.");
} else if (readmeIsCurrent && pulseIsCurrent) {
  console.log("Project Pulse is already current.");
} else {
  const writes = [];

  if (!readmeIsCurrent) {
    writes.push(writeFile(readmePath, updatedReadme));
  }

  if (!pulseIsCurrent) {
    writes.push(writeFile(pulsePath, pulse));
  }

  await Promise.all(writes);
  console.log("Project Pulse updated.");
}
