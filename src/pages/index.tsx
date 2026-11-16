import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ArrowRight, CheckCircle2, CircleHelp, Radio, ShieldAlert, Sparkles, ThumbsUp, Users } from 'lucide-react'
import { Seo } from '../components/Seo'
import { APP_NAME } from '../constants'
import { seo } from '../seo'

export default function Landing() {
  return (
    <>
      <Seo {...seo} path="/" />
      <div data-testid="static-landing" className="min-h-screen bg-background text-foreground">
        <nav className="border-b border-border/80">
          <div className="mx-auto flex h-16 max-w-7xl items-center px-5 sm:px-8">
            <div className="flex items-center gap-2.5 text-sm font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><Radio className="h-4 w-4" aria-hidden /></span>{APP_NAME}</div>
            <div className="flex-1" />
            <Link to="/home" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Open workspace <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
        </nav>

        <main>
          <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-28">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary"><Users className="h-3.5 w-3.5" aria-hidden /> A room for consequential choices</div>
              <h1 className="max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">Make the decision, not just the meeting.</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">SignalRoom gives a team one live place to gather evidence, surface uncertainty, measure confidence, and ask AI what the room is missing.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4"><Link to="/home" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Enter a decision room <ArrowRight className="h-4 w-4" aria-hidden /></Link><span className="text-sm text-muted-foreground">Read-only preview before sign-in</span></div>
            </div>

            <div className="relative">
              <div className="absolute -left-5 -top-5 h-24 w-24 rounded-full bg-accent/50 blur-2xl" />
              <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-[0_24px_70px_rgba(27,36,48,0.13)]">
                <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><div className="text-[10px] font-semibold uppercase tracking-[0.17em] text-primary">Open decision</div><div className="mt-1 font-semibold">Move the launch forward two weeks?</div></div><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /></div>
                <div className="grid gap-3 p-4 sm:grid-cols-3">
                  <MiniLane icon={<ThumbsUp />} label="Evidence for" color="text-emerald-700" copy="Pilot users completed the critical path." />
                  <MiniLane icon={<ShieldAlert />} label="Risk" color="text-red-700" copy="Rollback still needs a tested runbook." />
                  <MiniLane icon={<CircleHelp />} label="Question" color="text-amber-700" copy="Who covers the first 48 hours?" />
                </div>
                <div className="grid gap-4 border-t border-border bg-background/55 p-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex items-baseline gap-2"><span className="text-3xl font-semibold">3.5</span><span className="text-sm text-muted-foreground">team confidence</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-[63%] rounded-full bg-primary" /></div></div><div className="flex items-center gap-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary"><Sparkles className="h-4 w-4" aria-hidden /> Find the missing risk</div></div>
              </div>
            </div>
          </section>

          <section className="border-y border-border bg-card/65">
            <div className="mx-auto grid max-w-7xl gap-px bg-border sm:grid-cols-3">
              <Feature number="01" title="Evidence stays inspectable" copy="Separate supporting facts, risks, and unanswered questions instead of losing them in chat." />
              <Feature number="02" title="Confidence is a live signal" copy="Every person gets one changeable vote, enforced server-side rather than trusted to the interface." />
              <Feature number="03" title="AI reads the actual room" copy="Ask for a synthesis or decision memo using the same permission-aware records your team sees." />
            </div>
          </section>

          <section className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8"><CheckCircle2 className="mx-auto h-8 w-8 text-primary" aria-hidden /><h2 className="mt-5 text-3xl font-semibold tracking-[-0.035em]">Leave with a decision trail, not a fuzzy memory.</h2><p className="mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground">Focused by design: no generic chat channel, no sprawling project management, and no performative dashboards—just the evidence and signal needed to commit.</p><Link to="/home" className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Open SignalRoom <ArrowRight className="h-4 w-4" aria-hidden /></Link></section>
        </main>
      </div>
    </>
  )
}

function MiniLane({ icon, label, color, copy }: { icon: ReactNode; label: string; color: string; copy: string }) { return <div className="rounded-md border border-border bg-background/60 p-3"><div className={`flex items-center gap-2 text-xs font-semibold ${color}`}><span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>{label}</div><p className="mt-3 text-xs leading-5 text-muted-foreground">{copy}</p></div> }
function Feature({ number, title, copy }: { number: string; title: string; copy: string }) { return <article className="bg-card px-7 py-10 text-left"><div className="text-xs font-semibold tracking-[0.2em] text-primary">{number}</div><h2 className="mt-4 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></article> }
