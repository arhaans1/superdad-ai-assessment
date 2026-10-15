export type AssessmentVideo = { kind: "embed" | "file"; src: string };

/** Resolve public video links to players that stay on the results page. */
export function assessmentVideo(rawUrl: string): AssessmentVideo | null {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const parts = url.pathname.split("/").filter(Boolean);

    if (host === "drive.google.com") {
      const id = parts[0] === "file" && parts[1] === "d"
        ? parts[2]
        : url.searchParams.get("id");
      if (!id || !/^[\w-]+$/.test(id)) return null;
      const preview = new URL(`https://drive.google.com/file/d/${id}/preview`);
      const resourceKey = url.searchParams.get("resourcekey");
      if (resourceKey) preview.searchParams.set("resourcekey", resourceKey);
      return { kind: "embed", src: preview.toString() };
    }

    if (["youtu.be", "youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
      const id = host === "youtu.be" ? parts[0]
        : url.searchParams.get("v") || (["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : null);
      return id && /^[\w-]+$/.test(id)
        ? { kind: "embed", src: `https://www.youtube.com/embed/${id}` }
        : null;
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const idIndex = parts.findIndex((part) => /^\d+$/.test(part));
      if (idIndex === -1) return null;
      const embed = new URL(`https://player.vimeo.com/video/${parts[idIndex]}`);
      const hash = url.searchParams.get("h") || parts[idIndex + 1];
      if (hash) embed.searchParams.set("h", hash);
      return { kind: "embed", src: embed.toString() };
    }

    if (host === "loom.com" && ["share", "embed"].includes(parts[0]) && /^[\w-]+$/.test(parts[1] || "")) {
      return { kind: "embed", src: `https://www.loom.com/embed/${parts[1]}` };
    }

    if (/\.mp4$/i.test(url.pathname)) return { kind: "file", src: url.toString() };
    return null;
  } catch {
    return null;
  }
}
