"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { SYSTEMS, youtubeId, type Block, type OS, type Tool, type Workshop } from "@/lib/workshops";

type Text = Dictionary["workshops"];

// The visitor's system, guessed once in the browser. The server renders Windows.
function detectSystem(): OS {
  const agent = navigator.userAgent;
  if (/Mac OS X|Macintosh/.test(agent) && !/iPhone|iPad/.test(agent)) return "macos";
  if (/Linux/.test(agent) && !/Android/.test(agent)) return "linux";
  return "windows";
}
const noSubscribe = () => () => {};

function CodeBlock({ code, t }: { code: string; t: Text }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="code">
      <pre>
        <code>{code}</code>
      </pre>
      <button
        type="button"
        className="code__copy"
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? t.copied : t.copy}
      </button>
    </div>
  );
}

function BlockView({ block, t }: { block: Block; t: Text }) {
  if (typeof block === "string") return <p>{block}</p>;
  if ("code" in block) return <CodeBlock code={block.code} t={t} />;
  return (
    <p>
      <a className="text-link" href={block.href} target="_blank" rel="noopener noreferrer">
        {block.label}
      </a>
    </p>
  );
}

/** Each text starts a new step; the commands and links after it belong to that step. */
function toSteps(blocks: Block[]): Block[][] {
  const steps: Block[][] = [];
  for (const block of blocks) {
    if (typeof block === "string" || steps.length === 0) steps.push([block]);
    else steps[steps.length - 1].push(block);
  }
  return steps;
}

function Video({ video, t }: { video: { url: string; title: string; thumbnail?: string }; t: Text }) {
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(video.url);
  if (!id) return null;
  return (
    <div className="video">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={video.title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        // Nothing is loaded from YouTube until the visitor presses play.
        <button type="button" className="video__poster" onClick={() => setPlaying(true)} aria-label={`${t.playVideo}: ${video.title}`}>
          {video.thumbnail && <Image src={video.thumbnail} alt="" fill sizes="(max-width: 860px) 100vw, 820px" />}
          <span className="video__play" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28">
              <path d="M9 6v16l13-8z" fill="currentColor" />
            </svg>
          </span>
        </button>
      )}
      <p className="meta meta--muted">{video.title}</p>
    </div>
  );
}

function ToolSection({ tool, index, os, t }: { tool: Tool; index: number; os: OS; t: Text }) {
  const install = tool.install[os] ?? [];
  const video = tool.videos?.[os];
  const tips = tool.tips?.[os];
  const verify = typeof tool.verify === "string" ? tool.verify : tool.verify?.[os];
  const verifyBlocks: Block[] = verify === undefined ? [] : typeof verify === "string" ? [verify] : verify;

  return (
    <li className="ws-tool">
      <div className="ws-tool__head">
        <span className="ws-tool__num" aria-hidden="true">
          {index + 1}
        </span>
        {tool.icon && <Image className="ws-tool__icon" src={tool.icon} alt="" width={44} height={44} unoptimized />}
        <div className="ws-tool__title">
          <h2>{tool.name}</h2>
          <p>{tool.description}</p>
        </div>
      </div>

      {(tool.url || tool.extraLinks?.length) && (
        <div className="ws-tool__links">
          {tool.url && (
            <a className="btn btn--outline btn--small" href={tool.url} target="_blank" rel="noopener noreferrer">
              {tool.urlLabel ?? tool.name}
            </a>
          )}
          {tool.extraLinks?.map((link) => (
            <a key={link.url} className="text-link" href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      )}

      {install.length > 0 && (
        <div className="ws-tool__part">
          <h3 className="ws-tool__label">{t.install}</h3>
          <ol className="steps">
            {toSteps(install).map((step, i) => (
              <li key={i}>
                {step.map((block, j) => (
                  <BlockView key={j} block={block} t={t} />
                ))}
              </li>
            ))}
          </ol>
        </div>
      )}

      {video && <Video video={video} t={t} />}

      {tips && tips.length > 0 && (
        <div className="ws-tool__part ws-tool__note">
          <h3 className="ws-tool__label">{t.tip}</h3>
          {tips.map((block, i) => (
            <BlockView key={i} block={block} t={t} />
          ))}
        </div>
      )}

      {verifyBlocks.length > 0 && (
        <div className="ws-tool__part ws-tool__check">
          <h3 className="ws-tool__label">{t.verify}</h3>
          {verifyBlocks.map((block, i) => (
            <BlockView key={i} block={block} t={t} />
          ))}
        </div>
      )}
    </li>
  );
}

export function WorkshopGuide({ workshop, t }: { workshop: Workshop; t: Text }) {
  const detected = useSyncExternalStore(noSubscribe, detectSystem, () => "windows" as OS);
  const [picked, setPicked] = useState<OS | null>(null);
  const os = picked ?? detected;

  return (
    <div className="guide">
      <div className="guide__picker">
        <span className="meta meta--muted" id="os-label">
          {t.system}
        </span>
        <div className="segmented" role="group" aria-labelledby="os-label">
          {SYSTEMS.map((system) => (
            <button key={system.id} type="button" aria-pressed={system.id === os} onClick={() => setPicked(system.id)}>
              {system.label}
            </button>
          ))}
        </div>
      </div>
      <ol className="ws-tool-list" lang="tr">
        {workshop.tools.map((tool, index) => (
          <ToolSection key={tool.id} tool={tool} index={index} os={os} t={t} />
        ))}
      </ol>
    </div>
  );
}
