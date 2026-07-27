/**
 * Проигрывание видео прямо на странице урока.
 * Поддержаны ссылки YouTube, Vimeo, RuTube, VK и прямые файлы (.mp4/.webm/.ogg).
 */

type Embed =
  | { kind: "iframe"; src: string }
  | { kind: "file"; src: string }
  | { kind: "link"; href: string };

export function toEmbed(rawUrl: string): Embed | null {
  const url = rawUrl.trim();
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1);
    return id ? { kind: "iframe", src: `https://www.youtube.com/embed/${id}` } : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const id = parsed.searchParams.get("v");
    if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}` };
    const embedMatch = /^\/(?:embed|shorts|live)\/([\w-]+)/.exec(parsed.pathname);
    if (embedMatch) return { kind: "iframe", src: `https://www.youtube.com/embed/${embedMatch[1]}` };
    return null;
  }

  if (host === "vimeo.com") {
    const id = /^\/(\d+)/.exec(parsed.pathname)?.[1];
    return id ? { kind: "iframe", src: `https://player.vimeo.com/video/${id}` } : null;
  }

  if (host === "rutube.ru") {
    const id = /^\/(?:video|play\/embed)\/([\w-]+)/.exec(parsed.pathname)?.[1];
    return id ? { kind: "iframe", src: `https://rutube.ru/play/embed/${id}` } : null;
  }

  if (host === "vk.com" || host === "vkvideo.ru") {
    const match = /^\/video(-?\d+)_(\d+)/.exec(parsed.pathname);
    if (match) {
      return {
        kind: "iframe",
        src: `https://vk.com/video_ext.php?oid=${match[1]}&id=${match[2]}`,
      };
    }
    return null;
  }

  if (/\.(mp4|webm|ogg|ogv|mov)$/i.test(parsed.pathname)) {
    return { kind: "file", src: url };
  }

  return { kind: "link", href: url };
}

type Props = {
  url: string;
  title?: string;
  note?: string;
};

export function VideoEmbed({ url, title, note }: Props) {
  const embed = toEmbed(url);

  if (!embed) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface-2 p-5 text-center">
        <p className="text-[13.5px] font-medium text-muted">{title ?? "Видео"}</p>
        <p className="mt-1 text-[12.5px] text-faint">
          {note ?? "Ссылка на видео не задана или её формат не распознан."}
        </p>
      </div>
    );
  }

  if (embed.kind === "link") {
    return (
      <a
        href={embed.href}
        target="_blank"
        rel="noreferrer noopener"
        className="block rounded-lg border border-border bg-surface-2 p-4 transition-colors hover:border-accent"
      >
        <p className="text-[14px] font-medium text-text">{title ?? "Смотреть видео"}</p>
        <p className="mt-0.5 truncate text-[12.5px] text-faint">{embed.href}</p>
      </a>
    );
  }

  return (
    <figure className="space-y-2">
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
        {embed.kind === "iframe" ? (
          <iframe
            src={embed.src}
            title={title ?? "Видео"}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={embed.src} controls className="h-full w-full" preload="metadata" />
        )}
      </div>
      {(title || note) && (
        <figcaption className="text-[12.5px] text-faint">
          {title}
          {title && note ? " — " : ""}
          {note}
        </figcaption>
      )}
    </figure>
  );
}
