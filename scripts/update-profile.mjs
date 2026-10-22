import { readFile, writeFile } from "node:fs/promises";

const username = process.env.PROFILE_USERNAME || "josntndr";
const readmePath = new URL("../README.md", import.meta.url);
const startMarker = "<!-- PROFILE-DASHBOARD:START -->";
const endMarker = "<!-- PROFILE-DASHBOARD:END -->";

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": `${username}-profile-dashboard`,
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function projectDescription(repository) {
  if (repository.description) {
    return escapeHtml(repository.description);
  }

  const technology = repository.language ? `${repository.language} project` : "project";
  return `A ${escapeHtml(technology)} by Josephine.`;
}

function projectCell(repository) {
  const language = repository.language || "Project";
  const liveLink = repository.homepage
    ? ` · <a href="${escapeHtml(repository.homepage)}">Live demo</a>`
    : "";

  return [
    '    <td width="50%" valign="top">',
    `      <h3><a href="${escapeHtml(repository.html_url)}">${escapeHtml(repository.name)} ↗</a></h3>`,
    `      <p>${projectDescription(repository)}</p>`,
    `      <p><code>${escapeHtml(language)}</code> · Updated ${formatDate(repository.pushed_at)}${liveLink}</p>`,
    "    </td>",
  ].join("\n");
}

function projectTable(repositories) {
  const rows = [];

  for (let index = 0; index < repositories.length; index += 2) {
    const cells = repositories.slice(index, index + 2).map(projectCell);

    if (cells.length === 1) {
      cells.push('    <td width="50%"></td>');
    }

    rows.push(["  <tr>", ...cells, "  </tr>"].join("\n"));
  }

  return ["<table>", ...rows, "</table>"].join("\n");
}

function buildDashboard(profile, repositories) {
  const activeRepositories = repositories
    .filter((repository) => !repository.fork && !repository.archived && repository.name !== username)
    .sort((first, second) => new Date(second.pushed_at) - new Date(first.pushed_at));
  const latestRepositories = activeRepositories.slice(0, 4);
  const technologies = new Set(activeRepositories.map((repository) => repository.language).filter(Boolean));
  const latestPush = activeRepositories[0]?.pushed_at;
  const lastSync = formatDate(new Date());

  return [
    startMarker,
    `<p align="right"><sub>Auto-refreshed daily · Last sync: <strong>${lastSync} UTC</strong></sub></p>`,
    "",
    "<table>",
    "  <tr>",
    `    <td align="center" width="25%"><strong>${profile.public_repos}</strong><br /><sub>public repositories</sub></td>`,
    `    <td align="center" width="25%"><strong>${activeRepositories.length}</strong><br /><sub>active projects</sub></td>`,
    `    <td align="center" width="25%"><strong>${technologies.size}</strong><br /><sub>technologies</sub></td>`,
    `    <td align="center" width="25%"><strong>${latestPush ? formatDate(latestPush) : "—"}</strong><br /><sub>latest project push</sub></td>`,
    "  </tr>",
    "</table>",
    "",
    "### Recently Updated",
    "",
    projectTable(latestRepositories),
    endMarker,
  ].join("\n");
}

const [profile, repositories, readme] = await Promise.all([
  getJson(`/users/${username}`),
  getJson(`/users/${username}/repos?type=owner&sort=pushed&direction=desc&per_page=100`),
  readFile(readmePath, "utf8"),
]);

const startIndex = readme.indexOf(startMarker);
const endIndex = readme.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
  throw new Error("Profile dashboard markers are missing or out of order.");
}

const dashboard = buildDashboard(profile, repositories);
const updatedReadme = `${readme.slice(0, startIndex)}${dashboard}${readme.slice(endIndex + endMarker.length)}`;

if (process.argv.includes("--check")) {
  if (updatedReadme !== readme) {
    throw new Error("README dashboard is not current. Run: node scripts/update-profile.mjs");
  }

  console.log("Profile dashboard is current.");
} else if (updatedReadme === readme) {
  console.log("Profile dashboard is already current.");
} else {
  await writeFile(readmePath, updatedReadme);
  console.log("Profile dashboard updated.");
}
