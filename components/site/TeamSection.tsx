"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { sortByName, terms, type CommitteeId, type Member } from "@/lib/team";

type TeamText = Dictionary["team"];

const COMMITTEES: CommitteeId[] = ["cs", "ras", "wie", "media"];

function MemberCard({ member, t, accent }: { member: Member; t: TeamText; accent?: boolean }) {
  const body = (
    <>
      <span className="photo">
        {member.photo && <Image src={member.photo} alt={member.name} fill sizes="(max-width: 720px) 45vw, 200px" />}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="member__name">{member.name}</span>
        <span className={accent ? "mono mono--accent" : "mono mono--muted"}>{t.roles[member.role]}</span>
      </span>
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
    <div className="stack" style={{ gap: 40 }}>
      <div className="title-row">
        <h2 className="section-title">{t.title}</h2>
        <div className="term-switch" role="group" aria-label={t.termGroup}>
          {[...terms].reverse().map((term) => (
            <button key={term.id} type="button" className="chip" aria-pressed={term.id === termId} onClick={() => setTermId(term.id)}>
              {term.id}
            </button>
          ))}
        </div>
      </div>

      {board && group ? (
        <div className="stack" style={{ gap: 40 }}>
          <div className="president-grid">
            {board.presidential.map((member) => (
              <a key={member.name} className="president-card" href={member.linkedin} target="_blank" rel="noopener noreferrer">
                <span className="photo">
                  {member.photo && <Image src={member.photo} alt={member.name} fill sizes="112px" />}
                </span>
                <span className="president-card__text">
                  <span className="mono mono--muted">{t.roles[member.role]}</span>
                  <span className="president-card__name">{member.name}</span>
                  {member.linkedin && <span className="mono mono--accent">{t.linkedin}</span>}
                </span>
              </a>
            ))}
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
              <MemberCard member={group.leader} t={t} accent />
            </li>
            {sortByName(group.members).map((member) => (
              <li key={member.name}>
                <MemberCard member={member} t={t} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="tba hatch">
          <div className="tba__card">
            <span className="mono mono--muted">
              {termId} {t.tbaTerm}
            </span>
            <strong>{t.tba}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
