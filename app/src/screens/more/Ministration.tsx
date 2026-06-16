import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArrangements, useCreateArrangement } from '../../hooks/useArrangements';
import { usePermissions } from '../../hooks/usePermissions';
import { Button, Card, ScreenHeader } from '../../components/ui/primitives';
import { Sheet } from '../../components/ui/Sheet';

export default function Ministration() {
  const nav = useNavigate();
  const { can } = usePermissions();
  const { data: arrangements } = useArrangements('ministration');
  const create = useCreateArrangement('ministration');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [title, setTitle] = useState('');

  async function save() {
    if (!title.trim()) return;
    const created = await create.mutateAsync(title);
    setTitle('');
    setSheetOpen(false);
    nav(`/more/ministration/${created.id}`);
  }

  return (
    <div className="pb-10">
      <ScreenHeader
        title="Ministration"
        onBack={() => nav(-1)}
        right={
          can('build_arrangement') && (
            <button onClick={() => setSheetOpen(true)} className="text-xs font-semibold text-indigo">
              New
            </button>
          )
        }
      />
      <div className="px-5 flex flex-col gap-2.5">
        {(arrangements ?? []).map((a) => (
          <button key={a.id} onClick={() => nav(`/more/ministration/${a.id}`)} className="w-full text-left">
            <Card className="p-4">
              <div className="font-semibold text-sm">{a.title}</div>
            </Card>
          </button>
        ))}
        {!arrangements?.length && <div className="text-sm text-ink3">No ministration sets yet.</div>}
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="New ministration set">
        <div className="flex flex-col gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <Button onClick={save}>Create</Button>
        </div>
      </Sheet>
    </div>
  );
}
