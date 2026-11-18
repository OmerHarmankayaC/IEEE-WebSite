"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { sortByName, terms, type CommitteeId, type Member } from "@/lib/team";

type TeamText = Dictionary["team"];

const COMMITTEES: CommitteeId[] = ["cs", "ras", "wie", "media"];

function MemberCard({ member, t, lead }: { member: Member; t: TeamText; lead?: boolean }) {
  const body = (
    <>
      <span className="photo">
        {member.photo && <Image src={member.photo} alt={member.name} fill sizes="(max-width: 720px) 45vw, 200px" />}
      </span>
      <span className="member__name">{member.name}</span>
      <span className={lead ? "member__role member__role--lead" : "member__role"}>{t.roles[member.role]}</span>
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

export function TeamSection({ t }: { t: TeamText }) {
  const firstAnnounced = terms.find((term) => term.board) ?? terms[0];
  const [termId, setTermId] = useState(firstAnnounced.id);
  const [committee, setCommittee] = useState<CommitteeId>("cs");

  const board = terms.find((term) => term.id === termId)?.board ?? null;
  const group = board?.committees[committee];

  return (
    <div className="stack">
      <div className="segmented" role="group" aria-label={t.termGroup}>
        {[...terms].reverse().map((term) => (
          <button key={term.id} type="button" aria-pressed={term.id === termId} onClick={() => setTermId(term.id)}>
            {term.id}
          </button>
        ))}
      </div>

      {board && group ? (
        <>
          <div className="president-grid">
            {board.presidential.map((member) => {
              const body = (
                <>
                  <span className="photo">
                    {member.photo && <Image src={member.photo} alt={member.name} fill sizes="176px" />}
                  </span>
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

          <div className="committee-tabs" role="group" aria-label={t.committeeGroup}>
            {COMMITTEES.map((id) => (
              <button key={id} type="button" className="chip" aria-pressed={id === committee} onClick={() => setCommittee(id)}>
                {t.tabs[id]}
              </button>
            ))}
          </div>

          <ul className="member-grid">
            <li>
              <MemberCard member={group.leader} t={t} lead />
            </li>
            {sortByName(group.members).map((member) => (
              <li key={member.name}>
                <MemberCard member={member} t={t} />
              </li>
            ))}
          </ul>
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
