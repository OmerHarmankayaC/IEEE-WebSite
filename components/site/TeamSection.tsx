"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { COMMITTEES, sortByName, type CommitteeId, type Member, type Term } from "@/lib/team";

type TeamText = Dictionary["team"];

function MemberCard({ member, t, lead }: { member: Member; t: TeamText; lead?: boolean }) {
  const body = (
    <>
      <span className="photo">
        {member.photo && <Image src={member.photo} alt={member.name} fill sizes="(max-width: 720px) 45vw, 210px" />}
      </span>
      <span className="member__name">{member.name}</span>
      {lead ? <span className="badge-sun">{t.roles[member.role]}</span> : <span className="member__role">{t.roles[member.role]}</span>}
    </>
  );
  return member.linkedin ? (
    <a className="member" href={member.linkedin} target="_blank" rel="noopener noreferrer">
      {body}
    </a>
  ) : (
    <div className="member">{body}</div>
  );
}

/** One row of members that scrolls sideways, so a short last row never happens. */
function MemberStrip({ leader, members, t, label }: { leader: Member | null; members: Member[]; t: TeamText; label: string }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () =>
      setEdges({ start: list.scrollLeft <= 4, end: list.scrollLeft + list.clientWidth >= list.scrollWidth - 4 });
    // The observer also reports once right away, which sets the first state.
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    list.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      list.removeEventListener("scroll", measure);
    };
  }, [leader, members]);

  const move = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({ left: direction * list.clientWidth * 0.8, behavior: smooth ? "smooth" : "auto" });
  };

  const scrolls = !(edges.start && edges.end);

  return (
    <div className="member-strip">
      <ul className="member-strip__list" ref={listRef} aria-label={label}>
        {leader && (
          <li>
            <MemberCard member={leader} t={t} lead />
          </li>
        )}
        {sortByName(members).map((member) => (
          <li key={member.name}>
            <MemberCard member={member} t={t} />
          </li>
        ))}
      </ul>
      {scrolls && (
        <div className="member-strip__nav">
          <button type="button" aria-label={t.previous} disabled={edges.start} onClick={() => move(-1)}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <button type="button" aria-label={t.next} disabled={edges.end} onClick={() => move(1)}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export function TeamSection({ t, terms }: { t: TeamText; terms: Term[] }) {
  const firstAnnounced = terms.find((term) => term.board) ?? terms[0];
  const [termId, setTermId] = useState(firstAnnounced?.id ?? "");
  const [chosen, setChosen] = useState<CommitteeId>("cs");

  if (!firstAnnounced) return null;

  const board = terms.find((term) => term.id === termId)?.board ?? null;
  const tabs = board ? COMMITTEES.filter((id) => board.committees[id].leader || board.committees[id].members.length > 0) : [];
  const committee = tabs.includes(chosen) ? chosen : tabs[0];
  const group = board && committee ? board.committees[committee] : null;

  return (
    <div className="stack">
      <div className="segmented" role="group" aria-label={t.termGroup}>
        {[...terms].reverse().map((term) => (
          <button key={term.id} type="button" aria-pressed={term.id === termId} onClick={() => setTermId(term.id)}>
            {term.id}
          </button>
        ))}
      </div>

      {board ? (
        <>
          <div className="president-grid">
            {board.presidential.map((member) => {
              const body = (
                <>
                  <span className="photo">{member.photo && <Image src={member.photo} alt={member.name} fill sizes="176px" />}</span>
                  <span className="president-card__text">
                    <span className="meta meta--accent">{t.roles[member.role]}</span>
                    <span className="president-card__name">{member.name}</span>
                  </span>
                </>
              );
              return member.linkedin ? (
                <a key={member.name} className="president-card" href={member.linkedin} target="_blank" rel="noopener noreferrer">
                  {body}
                </a>
              ) : (
                <div key={member.name} className="president-card">
                  {body}
                </div>
              );
            })}
          </div>

          {group && committee && (
            <>
              <div className="committee-tabs" role="group" aria-label={t.committeeGroup}>
                {tabs.map((id) => (
                  <button key={id} type="button" className="chip" aria-pressed={id === committee} onClick={() => setChosen(id)}>
                    {t.tabs[id]}
                  </button>
                ))}
              </div>
              <MemberStrip key={`${termId}-${committee}`} leader={group.leader} members={group.members} t={t} label={t.tabs[committee]} />
            </>
          )}
        </>
      ) : (
        <div className="tba">
          <span className="meta meta--muted">
            {termId} {t.tbaTerm}
          </span>
          <strong>{t.tba}</strong>
        </div>
      )}
    </div>
  );
}
