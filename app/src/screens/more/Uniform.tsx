import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUniformLooks, useSaveLook, useVoteLook } from '../../hooks/useUniform';
import { usePermissions } from '../../hooks/usePermissions';
import { Button, Card, ScreenHeader, SectionTitle } from '../../components/ui/primitives';
import type { UniformLook } from '../../types/domain';

const TOP_COLORS = ['#3F3795', '#1B1740', '#8E681F', '#3E7C53', '#BE463C'];
const ACCENT_COLORS = ['#D9B25E', '#F6F1E7', '#5C53C4', '#C07A24'];
const SKIN_TONES = ['#F2C9A0', '#D9A066', '#A9714C', '#6B4226'];
const BUILDS: UniformLook['build'][] = ['slim', 'regular', 'fuller'];

function UniformAvatar({ look }: { look: Pick<UniformLook, 'top_color' | 'accent_color' | 'skin_tone' | 'build'> }) {
  const width = look.build === 'slim' ? 64 : look.build === 'fuller' ? 92 : 78;
  return (
    <svg width={140} height={170} viewBox="0 0 140 170" style={{ animation: 'breathe 3.5s ease-in-out infinite' }}>
      <ellipse cx="70" cy="148" rx={width / 2 + 6} ry="14" fill="#000" opacity="0.08" />
      <rect x={70 - width / 2} y="58" width={width} height="92" rx="22" fill={look.top_color} />
      <rect x={70 - width / 2} y="58" width={width} height="20" rx="10" fill={look.accent_color} opacity="0.85" />
      <circle cx="70" cy="34" r="28" fill={look.skin_tone} />
    </svg>
  );
}

export default function Uniform() {
  const nav = useNavigate();
  const { can } = usePermissions();
  const { data: looks } = useUniformLooks();
  const save = useSaveLook();
  const vote = useVoteLook();

  const [name, setName] = useState('');
  const [topColor, setTopColor] = useState(TOP_COLORS[0]);
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [skinTone, setSkinTone] = useState(SKIN_TONES[0]);
  const [build, setBuild] = useState<UniformLook['build']>('regular');

  async function saveLook() {
    if (!name.trim()) return;
    await save.mutateAsync({ name, top_color: topColor, accent_color: accentColor, skin_tone: skinTone, build });
    setName('');
  }

  return (
    <div className="pb-10">
      <ScreenHeader title="Uniform" onBack={() => nav(-1)} />
      <div className="px-5">
        <Card className="p-5 flex flex-col items-center">
          <UniformAvatar look={{ top_color: topColor, accent_color: accentColor, skin_tone: skinTone, build }} />
        </Card>

        <div className="mt-5 flex flex-col gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[.1em] text-ink3 mb-2">Top color</div>
            <div className="flex gap-2">
              {TOP_COLORS.map((c) => (
                <button key={c} onClick={() => setTopColor(c)} className="w-9 h-9 rounded-full border-2" style={{ background: c, borderColor: topColor === c ? '#241F1A' : 'transparent' }} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[.1em] text-ink3 mb-2">Accent</div>
            <div className="flex gap-2">
              {ACCENT_COLORS.map((c) => (
                <button key={c} onClick={() => setAccentColor(c)} className="w-9 h-9 rounded-full border-2" style={{ background: c, borderColor: accentColor === c ? '#241F1A' : 'transparent' }} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[.1em] text-ink3 mb-2">Skin tone</div>
            <div className="flex gap-2">
              {SKIN_TONES.map((c) => (
                <button key={c} onClick={() => setSkinTone(c)} className="w-9 h-9 rounded-full border-2" style={{ background: c, borderColor: skinTone === c ? '#241F1A' : 'transparent' }} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[.1em] text-ink3 mb-2">Build</div>
            <div className="flex gap-2">
              {BUILDS.map((b) => (
                <button
                  key={b}
                  onClick={() => setBuild(b)}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold border capitalize ${build === b ? 'bg-indigo text-white border-indigo' : 'bg-surface text-ink2 border-line2'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {can('manage_members') && (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name this look" className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
              <Button onClick={saveLook}>Save look</Button>
            </>
          )}
        </div>

        <SectionTitle>Vote on submissions</SectionTitle>
        <div className="flex flex-col gap-2.5">
          {(looks ?? []).map((l) => (
            <Card key={l.id} className="p-3.5 flex items-center gap-3.5">
              <svg width="36" height="44" viewBox="0 0 140 170" className="shrink-0">
                <rect x="40" y="58" width="60" height="92" rx="18" fill={l.top_color} />
                <rect x="40" y="58" width="60" height="16" rx="8" fill={l.accent_color} opacity="0.85" />
                <circle cx="70" cy="34" r="26" fill={l.skin_tone} />
              </svg>
              <div className="flex-1">
                <div className="font-semibold text-sm">{l.name}</div>
                <div className="text-xs text-ink3 mt-0.5 capitalize">{l.build}</div>
              </div>
              <button onClick={() => vote.mutate(l.id)} className="text-xs font-semibold text-indigo px-3 py-1.5 rounded-full border border-indigo-soft bg-indigo-soft">
                Vote &middot; {(l as any).voteCount}
              </button>
            </Card>
          ))}
          {!looks?.length && <div className="text-sm text-ink3">No submissions yet.</div>}
        </div>
      </div>
    </div>
  );
}
