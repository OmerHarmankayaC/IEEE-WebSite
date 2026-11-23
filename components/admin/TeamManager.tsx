"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition, type KeyboardEvent } from "react";
import { createTerm, deleteMember, deleteTerm, saveMember, setTermPublished, type MemberInput } from "@/app/admin/panel-actions";
import { PlusIcon } from "@/components/icons";
import { TEAM_BUCKET, teamPhotoUrl } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { ROLES_BY_GROUP, searchKey, type KnownPerson, type MemberRow, type RoleKey, type TeamGroup } from "@/lib/team";
import { uploadImage } from "@/lib/upload";
import { ConfirmDialog } from "./ConfirmDialog";

export type AdminTerm = { id: string; published: boolean };
export type AdminMember = MemberRow & { photo_url: string | null };

const ROLE_LABELS = getDictionary("tr").team.roles;
const GROUPS: { id: TeamGroup; label: string }[] = [
  { id: "board", label: "Başkanlık" },
  { id: "cs", label: "Computer Society" },
  { id: "ras", label: "Robotics and Automation Society" },
  { id: "wie", label: "Women in Engineering" },
  { id: "media", label: "Medya ve tasarım" },
];

/** Short group names for the "last role" line under each person. */
const GROUP_SHORT: Record<TeamGroup, string> = { board: "Başkanlık", cs: "CS", ras: "RAS", wie: "WIE", media: "Medya ve tasarım" };

type Draft = { id: string | null; team: TeamGroup; role: RoleKey; name: string; linkedin: string; photoPath: string | null };

function removeUploads(paths: string[]) {
  const uploaded = paths.filter((path) => !path.startsWith("/"));
  if (uploaded.length) void createBrowserSupabase().storage.from(TEAM_BUCKET).remove(uploaded);
}

/** "CS başkanı, 2025-2026": the person's role in their latest term. */
function lastRole(person: KnownPerson): string {
  const role = person.role === "leader" ? `${GROUP_SHORT[person.team]} başkanı` : ROLE_LABELS[person.role];
  return `${role}, ${person.termId}`;
}

/** Name field that lists the people of earlier terms while typing. Picking one fills the form. */
function PersonField({
  value,
  termId,
  people,
  inTerm,
  onType,
  onPick,
}: {
  value: string;
  termId: string;
  people: KnownPerson[];
  inTerm: Set<string>;
  onType: (name: string) => void;
  onPick: (person: KnownPerson) => void;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const query = searchKey(value);
  const matches = query ? people.filter((person) => searchKey(person.name).includes(query)) : people;
  const shown = open && matches.length > 0;
  const current = Math.min(active, matches.length - 1);

  const pick = (person: KnownPerson) => {
    onPick(person);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!shown) {
      if (event.key === "ArrowDown" && matches.length > 0) {
        event.preventDefault();
        setOpen(true);
        setActive(0);
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      pick(matches[current]);
    } else if (event.key === "Escape") {
      // Close the list, not the whole dialog.
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <>
      <input
        id="member-name"
        className="input"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={shown}
        aria-controls={listId}
        aria-activedescendant={shown ? `${listId}-${current}` : undefined}
        autoComplete="off"
        value={value}
        maxLength={100}
        onChange={(event) => {
          onType(event.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        autoFocus
      />
      {shown && (
        // Keep focus in the input while choosing with the mouse.
        <ul id={listId} role="listbox" aria-label="Önceki dönemlerdeki kişiler" className="person-list" onMouseDown={(event) => event.preventDefault()}>
          {matches.map((person, index) => {
            const photo = teamPhotoUrl(person.photoPath);
            return (
              <li
                key={searchKey(person.name)}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === current}
                className="person-list__item"
                onClick={() => pick(person)}
                onMouseEnter={() => setActive(index)}
              >
                <span className="person-list__photo">{photo && <Image src={photo} alt="" fill sizes="40px" unoptimized />}</span>
                <span className="person-list__text">
                  <strong>{person.name}</strong>
                  <span className="mono mono--muted">
                    {lastRole(person)}
                    {person.termId !== termId && inTerm.has(searchKey(person.name)) && ". Bu dönemde de ekli"}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function MemberDialog({
  draft,
  termId,
  people,
  inTerm,
  onClose,
  onSaved,
}: {
  draft: Draft;
  termId: string;
  people: KnownPerson[];
  inTerm: Set<string>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(draft);
  const [picked, setPicked] = useState<KnownPerson | null>(null);
  const [uploads, setUploads] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  const cancel = () => {
    removeUploads(uploads);
    onClose();
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { path } = await uploadImage(file, "team");
      setUploads((list) => [...list, path]);
      setForm((value) => ({ ...value, photoPath: path }));
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Fotoğraf yüklenemedi.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = () =>
    startSaving(async () => {
      setError(null);
      const input: MemberInput = { ...form, termId };
      const result = await saveMember(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Drop the photos that were uploaded and then replaced in this dialog.
      removeUploads(uploads.filter((path) => path !== form.photoPath));
      onSaved();
    });

  const photo = teamPhotoUrl(form.photoPath);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="member-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        cancel();
      }}
    >
      <div className="dialog__bar" style={{ color: "var(--navy)" }}>
        <h2 id="member-dialog-title" style={{ margin: 0, fontSize: "inherit" }}>
          {draft.id ? "Üyeyi düzenle" : "Üye ekle"}: {GROUPS.find((group) => group.id === form.team)?.label}
        </h2>
      </div>
      <div className="panel__body" style={{ gap: 18 }}>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="field">
          <label className="field__label" htmlFor="member-name">
            Ad soyad
          </label>
          {draft.id || people.length === 0 ? (
            <input
              id="member-name"
              className="input"
              value={form.name}
              maxLength={100}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              autoFocus
            />
          ) : (
            <>
              <PersonField
                value={form.name}
                termId={termId}
                people={people}
                inTerm={inTerm}
                onType={(name) => {
                  setForm((value) => ({ ...value, name }));
                  if (picked && name !== picked.name) setPicked(null);
                }}
                onPick={(person) => {
                  setForm((value) => ({ ...value, name: person.name, linkedin: person.linkedin ?? "", photoPath: person.photoPath }));
                  setPicked(person);
                }}
              />
              <p className="help-text">
                {picked
                  ? `LinkedIn adresi ve fotoğraf ${picked.termId} döneminden geldi. Şimdi yeni görevini seç.`
                  : "Önceki dönemlerden birini listeden seçersen LinkedIn adresi ve fotoğrafı da gelir. Yeni biriyse adını yazman yeterli."}
              </p>
            </>
          )}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="member-role">
            Görev
          </label>
          <select id="member-role" className="input" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as RoleKey })}>
            {ROLES_BY_GROUP[form.team].map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="member-linkedin">
            LinkedIn adresi (isteğe bağlı)
          </label>
          <input
            id="member-linkedin"
            className="input"
            type="url"
            placeholder="https://www.linkedin.com/in/..."
            value={form.linkedin}
            onChange={(event) => setForm({ ...form, linkedin: event.target.value })}
          />
        </div>
        <div className="field">
          <span className="field__label">Fotoğraf</span>
          <div className="member-photo">
            <span className="member-photo__frame">
              {photo ? <Image src={photo} alt="" fill sizes="96px" unoptimized /> : <span className="mono mono--muted">Yok</span>}
            </span>
            <div className="stack" style={{ gap: 8 }}>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => onFile(event.target.files?.[0])} />
              <button type="button" className="btn btn--outline btn--small" disabled={uploading} onClick={() => fileRef.current?.click()}>
                {uploading ? "Yükleniyor…" : photo ? "Fotoğrafı değiştir" : "Fotoğraf yükle"}
              </button>
              {photo && (
                <button type="button" className="text-link" style={{ background: "none", border: 0, padding: 0, cursor: "pointer", fontSize: 14 }} onClick={() => setForm({ ...form, photoPath: null })}>
                  Fotoğrafı kaldır
                </button>
              )}
            </div>
          </div>
          <p className="help-text">Kare ya da dikey bir portre en iyi sonucu verir. Yüklenirken otomatik küçültülür.</p>
        </div>
      </div>
      <div className="dialog__actions">
        <button type="button" className="btn btn--outline btn--small" onClick={cancel} disabled={saving}>
          Vazgeç
        </button>
        <button type="button" className="btn btn--sun btn--small" onClick={save} disabled={saving || uploading || !form.name.trim()}>
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </dialog>
  );
}

export function TeamManager({
  terms,
  selected,
  members,
  people,
}: {
  terms: AdminTerm[];
  selected: AdminTerm | null;
  members: AdminMember[];
  people: KnownPerson[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [removing, setRemoving] = useState<AdminMember | null>(null);
  const [removingTerm, setRemovingTerm] = useState(false);
  const [newTerm, setNewTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (task: () => Promise<{ ok: true } | { ok: false; error: string }>, after?: () => void) =>
    startTransition(async () => {
      setError(null);
      const result = await task();
      if (!result.ok) setError(result.error);
      else after?.();
    });

  const addTerm = () =>
    startTransition(async () => {
      setError(null);
      const result = await createTerm(newTerm);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNewTerm("");
      router.push(`/admin/ekip?donem=${result.data.id}`);
    });

  return (
    <>
      <div className="team-admin__terms">
        <div className="chip-row" role="group" aria-label="Dönem seçimi">
          {terms.map((term) => (
            <Link key={term.id} href={`/admin/ekip?donem=${term.id}`} className="chip" aria-current={term.id === selected?.id ? "page" : undefined}>
              {term.id}
              {!term.published && " (gizli)"}
            </Link>
          ))}
        </div>
        <form
          className="team-admin__new"
          onSubmit={(event) => {
            event.preventDefault();
            addTerm();
          }}
        >
          <label className="visually-hidden" htmlFor="new-term">
            Yeni dönem
          </label>
          <input id="new-term" className="input" placeholder="Örn. 2027-2028" value={newTerm} onChange={(event) => setNewTerm(event.target.value)} />
          <button type="submit" className="btn btn--outline btn--small" disabled={pending || !newTerm.trim()}>
            <PlusIcon />
            Dönem ekle
          </button>
        </form>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {!selected ? (
        <div className="info-box">Henüz dönem yok. Yukarıdan bir dönem ekle.</div>
      ) : (
        <>
          <div className="team-admin__status">
            <span className={selected.published ? "badge badge--published" : "badge badge--draft"}>{selected.published ? "Sitede görünüyor" : "Gizli"}</span>
            <span className="mono mono--muted">
              {selected.published
                ? members.length === 0
                  ? "Üye eklenmediği için sitede “yakında açıklanacak” yazıyor."
                  : "Bu dönem sitede gösteriliyor."
                : "Bu dönemi hazırlarken gizli tutabilir, hazır olunca yayınlayabilirsin."}
            </span>
            <div className="team-admin__status-actions">
              <button type="button" className={selected.published ? "btn btn--outline btn--small" : "btn btn--sun btn--small"} disabled={pending} onClick={() => run(() => setTermPublished(selected.id, !selected.published))}>
                {selected.published ? "Sitede gizle" : "Sitede yayınla"}
              </button>
              <button type="button" className="btn btn--outline btn--small btn--danger-outline" disabled={pending} onClick={() => setRemovingTerm(true)}>
                Dönemi sil
              </button>
            </div>
          </div>

          {GROUPS.map((group) => {
            const rows = members.filter((member) => member.team === group.id);
            const leaders = rows.filter((member) => member.role === "leader" || group.id === "board");
            const others = rows.filter((member) => !leaders.includes(member)).sort((a, b) => a.name.localeCompare(b.name, "tr"));
            const ordered = [...leaders, ...others];
            return (
              <section key={group.id} className="panel" aria-labelledby={`group-${group.id}`}>
                <div className="team-admin__group-bar">
                  <h2 className="panel__bar" id={`group-${group.id}`} style={{ border: 0 }}>
                    {group.label}
                  </h2>
                  <button
                    type="button"
                    className="btn btn--outline btn--small"
                    onClick={() =>
                      setDraft({ id: null, team: group.id, role: ROLES_BY_GROUP[group.id][group.id === "board" ? 0 : rows.some((m) => m.role === "leader") ? 1 : 0], name: "", linkedin: "", photoPath: null })
                    }
                  >
                    <PlusIcon />
                    Üye ekle
                  </button>
                </div>
                {ordered.length === 0 ? (
                  <p className="team-admin__empty mono mono--muted">Bu grupta henüz kimse yok.</p>
                ) : (
                  <ul className="team-admin__list">
                    {ordered.map((member) => (
                      <li key={member.id}>
                        <span className="team-admin__photo">
                          {member.photo_url ? <Image src={member.photo_url} alt="" fill sizes="56px" unoptimized={!member.photo_url.startsWith("/")} /> : null}
                        </span>
                        <span className="team-admin__name">
                          <strong>{member.name}</strong>
                          <span className="mono mono--muted">
                            {ROLE_LABELS[member.role]}
                            {member.linkedin ? "" : ", LinkedIn yok"}
                          </span>
                        </span>
                        <span className="team-admin__actions">
                          <button
                            type="button"
                            className="btn btn--outline btn--small"
                            onClick={() =>
                              setDraft({ id: member.id, team: member.team, role: member.role, name: member.name, linkedin: member.linkedin ?? "", photoPath: member.photo_path })
                            }
                          >
                            Düzenle
                          </button>
                          <button type="button" className="btn btn--outline btn--small btn--danger-outline" onClick={() => setRemoving(member)} aria-label={`${member.name} adlı üyeyi sil`}>
                            Sil
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </>
      )}

      {draft && selected && (
        <MemberDialog
          draft={draft}
          termId={selected.id}
          people={people}
          inTerm={new Set(members.map((member) => searchKey(member.name)))}
          onClose={() => setDraft(null)}
          onSaved={() => {
            setDraft(null);
            router.refresh();
          }}
        />
      )}

      {removing && (
        <ConfirmDialog
          title="Üyeyi sil"
          body={`${removing.name} bu dönemin listesinden çıkarılacak. Bu işlem geri alınamaz.`}
          confirmLabel="Üyeyi sil"
          busy={pending}
          onCancel={() => setRemoving(null)}
          onConfirm={() => run(() => deleteMember(removing.id), () => setRemoving(null))}
        />
      )}

      {removingTerm && selected && (
        <ConfirmDialog
          title="Dönemi sil"
          body={`${selected.id} dönemi ve içindeki ${members.length} üye kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
          confirmLabel="Dönemi sil"
          busy={pending}
          onCancel={() => setRemovingTerm(false)}
          onConfirm={() =>
            run(
              () => deleteTerm(selected.id),
              () => {
                setRemovingTerm(false);
                router.push("/admin/ekip");
              },
            )
          }
        />
      )}
    </>
  );
}
