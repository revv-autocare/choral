import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnnouncements, usePublishAnnouncement, useLikeAnnouncement } from '../../hooks/useBoard';
import { usePermissions } from '../../hooks/usePermissions';
import { Button, Card, Chip, ScreenHeader } from '../../components/ui/primitives';
import { Sheet } from '../../components/ui/Sheet';
import type { AudienceScope } from '../../types/domain';

const AUDIENCES: AudienceScope[] = ['everyone', 'soprano', 'alto', 'tenor', 'bass', 'leads'];

export default function Noticeboard() {
  const nav = useNavigate();
  const { can } = usePermissions();
  const { data: announcements } = useAnnouncements();
  const publish = usePublishAnnouncement();
  const like = useLikeAnnouncement();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<AudienceScope>('everyone');
  const [pinned, setPinned] = useState(false);

  async function post() {
    if (!title.trim() || !body.trim()) return;
    await publish.mutateAsync({ title, body, audience, pinned });
    setTitle('');
    setBody('');
    setAudience('everyone');
    setPinned(false);
    setSheetOpen(false);
  }

  return (
    <div className="pb-10">
      <ScreenHeader
        title="Noticeboard"
        onBack={() => nav(-1)}
        right={
          can('announce') && (
            <button onClick={() => setSheetOpen(true)} className="text-xs font-semibold text-indigo">
              New
            </button>
          )
        }
      />
      <div className="px-5 flex flex-col gap-3">
        {(announcements ?? []).map((a) => (
          <Card key={a.id} className="p-4">
            <div className="flex items-center gap-2">
              {a.pinned && <span className="text-[10px] font-bold uppercase tracking-[.1em] text-gold">Pinned</span>}
              <span className="text-[10px] font-semibold uppercase tracking-[.1em] text-ink3 capitalize">{a.audience}</span>
            </div>
            <div className="font-semibold text-sm mt-1.5">{a.title}</div>
            <div className="text-sm text-ink2 mt-1">{a.body}</div>
            <div className="flex items-center gap-4 mt-3">
              <button onClick={() => like.mutate(a.id)} className="text-xs font-semibold text-ink3 flex items-center gap-1">
                &hearts; {a.likeCount}
              </button>
              <div className="text-xs font-semibold text-ink3">{a.commentCount} comments</div>
            </div>
          </Card>
        ))}
        {!announcements?.length && <div className="text-sm text-ink3">No announcements yet.</div>}
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="New announcement">
        <div className="flex flex-col gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message" rows={4} className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface resize-none" />
          <div className="flex gap-2 flex-wrap">
            {AUDIENCES.map((a) => (
              <Chip key={a} active={audience === a} onClick={() => setAudience(a)}>
                {a}
              </Chip>
            ))}
          </div>
          <button onClick={() => setPinned((p) => !p)} className="text-xs font-semibold text-left text-indigo">
            {pinned ? 'Unpin' : 'Pin to top'}
          </button>
          <Button onClick={post}>Publish</Button>
        </div>
      </Sheet>
    </div>
  );
}
