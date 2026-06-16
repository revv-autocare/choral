import { useState } from 'react';
import { useMembers, useAddMember, useUpdateMember } from '../../hooks/useMembers';
import { usePermissions } from '../../hooks/usePermissions';
import { Avatar, Button, Card, ScreenHeader, SectionTitle } from '../../components/ui/primitives';
import { Sheet } from '../../components/ui/Sheet';
import { useToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import type { MemberRole, VoicePart } from '../../types/domain';
import { ROLE_LABEL } from '../../lib/permissions';

const PARTS: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];
const ROLES: MemberRole[] = ['director', 'section_lead', 'musician', 'chorister'];

function initialsOf(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function Members() {
  const nav = useNavigate();
  const { show } = useToast();
  const { can } = usePermissions();
  const { data: members } = useMembers();
  const add = useAddMember();
  const update = useUpdateMember();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [managing, setManaging] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [part, setPart] = useState<VoicePart>('soprano');
  const [role, setRole] = useState<MemberRole>('chorister');

  const active = (members ?? []).filter((m) => m.active);
  const inactive = (members ?? []).filter((m) => !m.active);
  const grouped = PARTS.map((p) => ({ part: p, list: active.filter((m) => m.part === p) }));
  const managed = members?.find((m) => m.id === managing);

  async function saveMember() {
    if (!name.trim() || !contact.trim()) return;
    await add.mutateAsync({ name, contact, part, role, sendInvite: true });
    setName('');
    setContact('');
    setPart('soprano');
    setRole('chorister');
    setSheetOpen(false);
    show('Invite sent');
  }

  return (
    <div className="pb-10">
      <ScreenHeader title="Members" onBack={() => nav(-1)} />
      <div className="px-5">
        {can('manage_members') && (
          <Button className="w-full mb-2" onClick={() => setSheetOpen(true)}>
            Add member
          </Button>
        )}

        {grouped.map(({ part, list }) =>
          list.length ? (
            <div key={part}>
              <SectionTitle>{part[0].toUpperCase() + part.slice(1)}</SectionTitle>
              <Card className="p-1">
                {list.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => can('manage_members') && setManaging(m.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 text-left ${i > 0 ? 'border-t border-line' : ''}`}
                  >
                    <Avatar initials={initialsOf(m.name)} color={m.color} size={34} />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{m.name}</div>
                      <div className="text-xs text-ink3 mt-0.5">{ROLE_LABEL[m.role]}</div>
                    </div>
                    {m.avail === 'invited' && <div className="text-xs font-semibold text-amber">Invited</div>}
                  </button>
                ))}
              </Card>
            </div>
          ) : null
        )}

        {!!inactive.length && (
          <>
            <SectionTitle>Inactive</SectionTitle>
            <Card className="p-1">
              {inactive.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => can('manage_members') && setManaging(m.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 text-left ${i > 0 ? 'border-t border-line' : ''}`}
                >
                  <Avatar initials={initialsOf(m.name)} color={m.color} size={34} />
                  <div className="flex-1 text-sm font-semibold text-ink3">{m.name}</div>
                </button>
              ))}
            </Card>
          </>
        )}
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add member">
        <div className="flex flex-col gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email" className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <div className="flex gap-2 flex-wrap">
            {PARTS.map((p) => (
              <button
                key={p}
                onClick={() => setPart(p)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold border capitalize ${part === p ? 'bg-indigo text-white border-indigo' : 'bg-surface text-ink2 border-line2'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold border ${role === r ? 'bg-indigo text-white border-indigo' : 'bg-surface text-ink2 border-line2'}`}
              >
                {ROLE_LABEL[r]}
              </button>
            ))}
          </div>
          <Button onClick={saveMember}>Send invite</Button>
        </div>
      </Sheet>

      <Sheet open={!!managing} onClose={() => setManaging(null)} title={managed?.name ?? ''}>
        {managed && (
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold uppercase tracking-[.1em] text-ink3">Role</div>
            <div className="flex gap-2 flex-wrap">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => update.mutate({ id: managed.id, role: r })}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold border ${managed.role === r ? 'bg-indigo text-white border-indigo' : 'bg-surface text-ink2 border-line2'}`}
                >
                  {ROLE_LABEL[r]}
                </button>
              ))}
            </div>
            <Button
              variant={managed.active ? 'danger' : 'secondary'}
              onClick={() => {
                update.mutate({ id: managed.id, active: !managed.active });
                setManaging(null);
              }}
            >
              {managed.active ? 'Deactivate' : 'Reactivate'}
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
