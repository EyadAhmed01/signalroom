/* home pattern: data-forward — live decision workspace and confidence signal above the fold */

import { useEffect, useState } from 'react'
import { ArrowRight, Bot, CheckCircle2, CircleHelp, Plus, Radio, Scale, ShieldAlert, Sparkles, ThumbsUp, Users } from 'lucide-react'
import { useAuth, useMutations, usePresenceRoom, useQuery } from 'deepspace'
import { ChatPanel } from '../../components/ChatPanel'
import { Badge, Button, EmptyState, Input, Label, Modal, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, useToast } from '../../components/ui'
import { cn } from '../../lib/utils'

type DecisionRoom = { title: string; context: string; status: 'open' | 'decided' }
type EvidenceCard = { roomId: string; stance: 'support' | 'risk' | 'question'; title: string; detail: string }
type ConfidenceVote = { roomId: string; userId: string; score: number }
type RoomView = { recordId: string; data: DecisionRoom; createdBy?: string; preview?: boolean }

const PREVIEW_ROOM: RoomView = {
  recordId: 'preview-room', preview: true,
  data: { title: 'Should we move the launch forward by two weeks?', context: 'A labeled example of the workspace. Sign in to create a real room and invite your team into the evidence.', status: 'open' },
}

const PREVIEW_EVIDENCE: Array<{ recordId: string; data: EvidenceCard }> = [
  { recordId: 'preview-support', data: { roomId: 'preview-room', stance: 'support', title: 'Pilot users are ready', detail: 'Six of eight design partners completed the core workflow without support.' } },
  { recordId: 'preview-risk', data: { roomId: 'preview-room', stance: 'risk', title: 'Rollback is still manual', detail: 'The on-call runbook needs a tested one-command rollback before the date moves.' } },
  { recordId: 'preview-question', data: { roomId: 'preview-room', stance: 'question', title: 'What changes for support?', detail: 'Confirm coverage for the first 48 hours and name the escalation owner.' } },
]

const LANES = [
  { id: 'support' as const, label: 'Evidence for', icon: ThumbsUp, color: 'text-emerald-700', stripe: 'bg-emerald-500' },
  { id: 'risk' as const, label: 'Risks', icon: ShieldAlert, color: 'text-red-700', stripe: 'bg-red-500' },
  { id: 'question' as const, label: 'Open questions', icon: CircleHelp, color: 'text-amber-700', stripe: 'bg-amber-500' },
]

export default function HomePage() {
  const { isSignedIn, userId } = useAuth()
  const { records: roomRecords, status: roomsStatus } = useQuery<DecisionRoom>('decision_rooms', { orderBy: 'createdAt', orderDir: 'desc' })
  const { records: evidenceRecords } = useQuery<EvidenceCard>('evidence_cards', { orderBy: 'createdAt', orderDir: 'desc' })
  const { records: voteRecords } = useQuery<ConfidenceVote>('confidence_votes')
  const roomMutations = useMutations<DecisionRoom>('decision_rooms')
  const evidenceMutations = useMutations<EvidenceCard>('evidence_cards')
  const voteMutations = useMutations<ConfidenceVote>('confidence_votes')
  const { success, error } = useToast()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [roomModalOpen, setRoomModalOpen] = useState(false)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [savingVote, setSavingVote] = useState<number | null>(null)

  useEffect(() => { if (!selectedId && roomRecords[0]) setSelectedId(roomRecords[0].recordId) }, [roomRecords, selectedId])

  const rooms: RoomView[] = roomRecords.length ? roomRecords : !isSignedIn && roomsStatus === 'ready' ? [PREVIEW_ROOM] : []
  const selected = rooms.find((room) => room.recordId === selectedId) ?? rooms[0] ?? null
  const { peers, connected, updateState } = usePresenceRoom(`signalroom:${selected?.recordId ?? 'lobby'}`)
  useEffect(() => { updateState({ viewing: selected?.data.title ?? 'Lobby' }) }, [selected?.data.title, updateState])

  const selectedEvidence = selected?.preview ? PREVIEW_EVIDENCE : evidenceRecords.filter((card) => card.data.roomId === selected?.recordId)
  const selectedVotes = selected?.preview
    ? [{ recordId: 'preview-vote-a', data: { roomId: 'preview-room', userId: 'a', score: 4 } }, { recordId: 'preview-vote-b', data: { roomId: 'preview-room', userId: 'b', score: 3 } }]
    : voteRecords.filter((vote) => vote.data.roomId === selected?.recordId)
  const average = selectedVotes.length ? selectedVotes.reduce((sum, vote) => sum + vote.data.score, 0) / selectedVotes.length : null
  const myVote = voteRecords.find((vote) => vote.data.roomId === selected?.recordId && vote.data.userId === userId)

  async function saveVote(score: number) {
    if (!selected || !userId || selected.preview) return
    setSavingVote(score)
    try {
      if (myVote) await voteMutations.putConfirmed(myVote.recordId, { score })
      else await voteMutations.createConfirmed({ roomId: selected.recordId, userId, score })
      success('Confidence saved', `Your signal is now ${score} out of 5.`)
    } catch (caught) { error('Could not save confidence', errorMessage(caught)) }
    finally { setSavingVote(null) }
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="border-b border-border bg-card/55">
        <div className="mx-auto grid max-w-[1500px] gap-6 px-5 py-7 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><Radio className="h-3.5 w-3.5" aria-hidden /> Live decision workspace</div>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Make the decision, not just the meeting.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Put evidence, uncertainty, and team confidence in one shared room—then use AI to find the argument you may have missed.</p>
          </div>
          <div className="flex items-end gap-2">{isSignedIn && <Button onClick={() => setRoomModalOpen(true)} disabled={!roomMutations.ready}><Plus className="h-4 w-4" aria-hidden /> New decision</Button>}</div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-5 px-5 py-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-4">
          <div className="grid grid-cols-2 gap-2"><Metric label="Open rooms" value={String(roomRecords.filter((room) => room.data.status === 'open').length)} /><Metric label="Evidence" value={String(evidenceRecords.length)} /></div>
          <section className="overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between border-b border-border px-4 py-3"><h2 className="text-sm font-semibold">Decision rooms</h2><Badge variant="secondary">{rooms.length}</Badge></div>
            {roomsStatus === 'loading' ? <div className="space-y-2 p-3" aria-label="Loading decision rooms">{[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />)}</div>
              : rooms.length ? <div className="p-2">{rooms.map((room) => <button key={room.recordId} onClick={() => setSelectedId(room.recordId)} className={cn('mb-1 w-full rounded-md px-3 py-3 text-left transition-colors last:mb-0', selected?.recordId === room.recordId ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}><div className="flex items-start gap-2"><span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', room.data.status === 'open' ? 'bg-amber-400' : 'bg-emerald-400')} /><span className="line-clamp-2 text-sm font-medium leading-5">{room.data.title}</span></div>{room.preview && <span className="ml-4 mt-2 block text-[10px] font-semibold uppercase tracking-wider opacity-70">Example room</span>}</button>)}</div>
              : <div className="p-4 text-sm text-muted-foreground">No rooms yet.</div>}
          </section>
          <PresenceCard peers={peers} connected={connected} isSignedIn={isSignedIn} />
        </aside>

        <main>
          {selected ? <div className="space-y-4">
            <section className="rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl"><div className="mb-3 flex flex-wrap items-center gap-2"><Badge variant={selected.data.status === 'open' ? 'default' : 'secondary'}>{selected.data.status === 'open' ? 'Open decision' : 'Decision recorded'}</Badge>{selected.preview && <Badge variant="outline">Labeled example</Badge>}</div><h2 className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">{selected.data.title}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{selected.data.context}</p></div>
                <div className="flex shrink-0 flex-wrap gap-2">{isSignedIn && !selected.preview && <><Button variant="outline" onClick={() => setEvidenceModalOpen(true)} disabled={!evidenceMutations.ready}><Plus className="h-4 w-4" aria-hidden /> Add evidence</Button><Button onClick={() => setAiOpen(true)}><Sparkles className="h-4 w-4" aria-hidden /> Ask analyst</Button></>}</div>
              </div>
              <div className="mt-6 grid gap-4 border-t border-border pt-5 md:grid-cols-[1fr_260px]"><ConfidenceSummary average={average} count={selectedVotes.length} /><ConfidencePicker signedIn={isSignedIn} preview={!!selected.preview} value={myVote?.data.score ?? null} saving={savingVote} onPick={saveVote} /></div>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">{LANES.map((lane) => { const cards = selectedEvidence.filter((card) => card.data.stance === lane.id); const Icon = lane.icon; return <div key={lane.id} className="overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-card)]"><div className={cn('h-1', lane.stripe)} /><div className="flex items-center justify-between border-b border-border px-4 py-3"><h3 className={cn('flex items-center gap-2 text-sm font-semibold', lane.color)}><Icon className="h-4 w-4" aria-hidden /> {lane.label}</h3><span className="text-xs tabular-nums text-muted-foreground">{cards.length}</span></div><div className="min-h-52 space-y-2 p-3">{cards.length ? cards.map((card) => <article key={card.recordId} className="rounded-md border border-border bg-background/65 p-3.5"><h4 className="text-sm font-semibold leading-5">{card.data.title}</h4><p className="mt-1.5 text-sm leading-5 text-muted-foreground">{card.data.detail}</p></article>) : <div className="flex min-h-44 items-center justify-center rounded-md border border-dashed border-border px-5 text-center text-sm text-muted-foreground">No {lane.label.toLowerCase()} yet.</div>}</div></div> })}</section>
          </div>
          : roomsStatus === 'ready' ? <div className="rounded-lg border border-border bg-card p-8"><EmptyState icon={<Scale />} title="Frame your first decision" description="Name the choice and give your team enough context to add useful evidence." action={isSignedIn ? { label: 'New decision', onClick: () => setRoomModalOpen(true) } : undefined} /></div> : null}
        </main>
      </div>

      <NewRoomModal open={roomModalOpen} onClose={() => setRoomModalOpen(false)} create={roomMutations.createConfirmed} onCreated={(id) => { setSelectedId(id); setRoomModalOpen(false); success('Decision room created', 'Your team can contribute as soon as they open the app.') }} onError={(message) => error('Could not create room', message)} />
      {selected && <NewEvidenceModal open={evidenceModalOpen} onClose={() => setEvidenceModalOpen(false)} roomId={selected.recordId} create={evidenceMutations.createConfirmed} onCreated={() => { setEvidenceModalOpen(false); success('Evidence added', 'The room updated for everyone in real time.') }} onError={(message) => error('Could not add evidence', message)} />}
      {selected && userId && <Modal open={aiOpen} onClose={() => setAiOpen(false)} size="xl"><Modal.Header><div><div className="flex items-center gap-2 text-sm font-semibold"><Bot className="h-4 w-4 text-primary" aria-hidden /> Decision analyst</div><p className="mt-1 text-xs font-normal text-muted-foreground">Private chat history; the assistant reads live room records through server-enforced tools.</p></div></Modal.Header><Modal.Body className="h-[68vh] p-0"><ChatPanel chatId={null} userId={userId} compact className="h-full" emptyStatePrompts={[`Synthesize the strongest case for and against: ${selected.data.title}`, `What unresolved risk could change this decision: ${selected.data.title}`, `Draft a concise decision memo for: ${selected.data.title}`]} /></Modal.Body></Modal>}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-border bg-card px-3 py-3"><div className="text-xl font-semibold tabular-nums">{value}</div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div></div> }

function PresenceCard({ peers, connected, isSignedIn }: { peers: Array<{ userId: string; userName: string; state: Record<string, unknown> }>; connected: boolean; isSignedIn: boolean }) {
  return <section className="rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card)]"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-primary" aria-hidden /> In this room</h2><span className={cn('h-2 w-2 rounded-full', connected ? 'bg-emerald-500' : 'bg-muted-foreground')} aria-label={connected ? 'Live connection' : 'Reconnecting'} /></div><p className="mt-2 text-xs leading-5 text-muted-foreground">{peers.length ? `${peers.length} ${peers.length === 1 ? 'teammate' : 'teammates'} here with you.` : isSignedIn ? 'You are the only person here right now.' : 'Sign in to contribute your signal.'}</p>{peers.slice(0, 3).map((peer) => <div key={peer.userId} className="mt-2 flex items-center gap-2 text-xs"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">{peer.userName?.[0]?.toUpperCase() ?? '?'}</span><span className="truncate">{peer.userName || 'Teammate'}</span></div>)}</section>
}

function ConfidenceSummary({ average, count }: { average: number | null; count: number }) {
  const percent = average ? ((average - 1) / 4) * 100 : 0
  return <div><div className="flex items-end justify-between gap-4"><div><div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team confidence</div><div className="mt-1 flex items-baseline gap-2"><span className="text-3xl font-semibold tabular-nums">{average ? average.toFixed(1) : '—'}</span><span className="text-sm text-muted-foreground">/ 5 · {count} {count === 1 ? 'signal' : 'signals'}</span></div></div><CheckCircle2 className="h-5 w-5 text-primary" aria-hidden /></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} /></div><div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground"><span>Not ready</span><span>Ready</span></div></div>
}

function ConfidencePicker({ signedIn, preview, value, saving, onPick }: { signedIn: boolean; preview: boolean; value: number | null; saving: number | null; onPick: (score: number) => void }) {
  return <div><div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your confidence</div><div className="mt-2 flex gap-1.5">{[1, 2, 3, 4, 5].map((score) => <button key={score} type="button" disabled={!signedIn || preview || saving !== null} onClick={() => onPick(score)} className={cn('flex h-9 w-9 items-center justify-center rounded-md border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50', value === score ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary hover:text-primary')} aria-label={`Set confidence to ${score}`}>{saving === score ? '·' : score}</button>)}</div><p className="mt-2 text-xs text-muted-foreground">{preview ? 'Example signals are read-only.' : signedIn ? 'One live signal per person. Change it anytime.' : 'Sign in to add your signal.'}</p></div>
}

function NewRoomModal({ open, onClose, create, onCreated, onError }: { open: boolean; onClose: () => void; create: (data: DecisionRoom) => Promise<string>; onCreated: (id: string) => void; onError: (message: string) => void }) {
  const [title, setTitle] = useState(''); const [context, setContext] = useState(''); const [saving, setSaving] = useState(false); const valid = title.trim().length >= 8 && context.trim().length >= 20
  async function submit() { if (!valid) return; setSaving(true); try { const id = await create({ title: title.trim(), context: context.trim(), status: 'open' }); setTitle(''); setContext(''); onCreated(id) } catch (caught) { onError(errorMessage(caught)) } finally { setSaving(false) } }
  return <Modal open={open} onClose={onClose}><Modal.Header><div><h2 className="font-semibold">Frame a decision</h2><p className="mt-1 text-sm font-normal text-muted-foreground">A precise question produces better evidence.</p></div></Modal.Header><Modal.Body className="space-y-4"><div><Label htmlFor="decision-title">Decision question</Label><Input id="decision-title" maxLength={180} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Should we…?" className="mt-1.5" /><p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p></div><div><Label htmlFor="decision-context">Context</Label><Textarea id="decision-context" maxLength={2000} value={context} onChange={(e) => setContext(e.target.value)} placeholder="What changed, what is constrained, and when must the team decide?" className="mt-1.5 min-h-28" /><p className="mt-1 text-xs text-muted-foreground">Give collaborators enough context to challenge the decision.</p></div></Modal.Body><Modal.Footer><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={!valid} loading={saving}>Create room <ArrowRight className="h-4 w-4" aria-hidden /></Button></Modal.Footer></Modal>
}

function NewEvidenceModal({ open, onClose, roomId, create, onCreated, onError }: { open: boolean; onClose: () => void; roomId: string; create: (data: EvidenceCard) => Promise<string>; onCreated: () => void; onError: (message: string) => void }) {
  const [stance, setStance] = useState<EvidenceCard['stance']>('support'); const [title, setTitle] = useState(''); const [detail, setDetail] = useState(''); const [saving, setSaving] = useState(false); const valid = title.trim().length >= 4 && detail.trim().length >= 12
  async function submit() { if (!valid) return; setSaving(true); try { await create({ roomId, stance, title: title.trim(), detail: detail.trim() }); setTitle(''); setDetail(''); onCreated() } catch (caught) { onError(errorMessage(caught)) } finally { setSaving(false) } }
  return <Modal open={open} onClose={onClose}><Modal.Header><div><h2 className="font-semibold">Add evidence</h2><p className="mt-1 text-sm font-normal text-muted-foreground">Make one specific, inspectable claim.</p></div></Modal.Header><Modal.Body className="space-y-4"><div><Label>Signal type</Label><Select value={stance} onValueChange={(value) => setStance(value as EvidenceCard['stance'])}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="support">Evidence for</SelectItem><SelectItem value="risk">Risk</SelectItem><SelectItem value="question">Open question</SelectItem></SelectContent></Select></div><div><Label htmlFor="evidence-title">Headline</Label><Input id="evidence-title" maxLength={140} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What should the team notice?" className="mt-1.5" /></div><div><Label htmlFor="evidence-detail">Detail</Label><Textarea id="evidence-detail" maxLength={1500} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Add the observation, source, or consequence." className="mt-1.5 min-h-24" /></div></Modal.Body><Modal.Footer><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={!valid} loading={saving}>Add to room</Button></Modal.Footer></Modal>
}

function errorMessage(error: unknown) { return error instanceof Error ? error.message : String(error) }
