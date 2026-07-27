import { Fragment, type ReactNode } from "react";

/**
 * Мини-рендер markdown для описаний задач: абзацы, списки,
 * `код`, ```блоки кода``` и **жирный**. Полноценная библиотека
 * тут была бы лишним весом — формат описаний мы задаём сами.
 */

function renderInline(text: string): ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  // Нечётные сегменты — содержимое ```-блоков
  const segments = text.split(/```(?:js|javascript|html)?\n?/);

  segments.forEach((segment, segmentIndex) => {
    if (segmentIndex % 2 === 1) {
      blocks.push(
        <pre key={`code-${segmentIndex}`}>
          <code>{segment.replace(/\n$/, "")}</code>
        </pre>,
      );
      return;
    }

    let paragraph: string[] = [];
    let listItems: string[] = [];
    let ordered = false;

    const flushParagraph = (key: string) => {
      if (paragraph.length === 0) return;
      blocks.push(<p key={key}>{renderInline(paragraph.join(" "))}</p>);
      paragraph = [];
    };

    const flushList = (key: string) => {
      if (listItems.length === 0) return;
      const items = listItems.map((item, index) => <li key={index}>{renderInline(item)}</li>);
      blocks.push(ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>);
      listItems = [];
    };

    segment.split("\n").forEach((rawLine, lineIndex) => {
      const line = rawLine.trim();
      const bullet = /^[-*]\s+(.*)$/.exec(line);
      const numbered = /^\d+\.\s+(.*)$/.exec(line);

      if (bullet || numbered) {
        flushParagraph(`p-${segmentIndex}-${lineIndex}`);
        if (listItems.length > 0 && ordered !== Boolean(numbered)) {
          flushList(`l-${segmentIndex}-${lineIndex}`);
        }
        ordered = Boolean(numbered);
        listItems.push((bullet ?? numbered)![1]);
        return;
      }

      if (line === "") {
        flushParagraph(`p-${segmentIndex}-${lineIndex}`);
        flushList(`l-${segmentIndex}-${lineIndex}`);
        return;
      }

      flushList(`l-${segmentIndex}-${lineIndex}`);
      paragraph.push(line);
    });

    flushParagraph(`p-${segmentIndex}-end`);
    flushList(`l-${segmentIndex}-end`);
  });

  return <div className="prose-task text-[13.5px] text-muted">{blocks}</div>;
}
