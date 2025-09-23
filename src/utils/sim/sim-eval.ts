// utils/sim/sim-eval.ts
export type Persona = {
  background: string;
  info: Record<string, string>;
  goals: string[];
};

export type AgendaStep = {
  template: string;
  slots?: Record<string, string>;
  waitFor?: RegExp; // agent text must match before sending next user turn
};

export type TurnRecord = {
  turn: number;
  user: string;
  agent: string;
  latencyMs: number;
};

export type TurnMetrics = {
  requiredHit?: boolean;
  forbiddenHit?: boolean;
  askedCount?: number;
  confirmedCount?: number;
  latencyStatus: 'ok'|'warn'|'fail';
};

export type ConversationMetrics = {
  goalsCompleted: number;
  allGoalsCompleted: boolean;
  allSlotsConfirmed: boolean;
};

export interface BotPort {
  reset(): Promise<void>;
  sendAndWaitForReply(text: string): Promise<{ reply: string; latencyMs: number }>;
}

export class AgendaPolicy {
  private agenda: AgendaStep[];
  private idx = 0;
  private waiting: RegExp | null = null;

  constructor(agenda: AgendaStep[]) { this.agenda = agenda; }

  reset() { this.idx = 0; this.waiting = null; }

  nextUserUtterance(history: TurnRecord[]): string | null {
    if (this.idx >= this.agenda.length) return null;
    if (this.waiting) {
      const last = history.at(-1);
      if (!last || !this.waiting.test(last.agent)) return null;
      this.waiting = null;
    }
    const step = this.agenda[this.idx++];
    const text = (step.template || '').replace(/\{(\w+)\}/g, (_, k) => step.slots?.[k] ?? '');
    if (step.waitFor) this.waiting = step.waitFor;
    return text;
  }
}

// ------------ Evaluators (simple, fast, explainable) ------------
export class RegexEvaluator {
  constructor(private required: RegExp[] = [], private forbidden: RegExp[] = []) {}
  evaluate(agent: string): Pick<TurnMetrics,'requiredHit'|'forbiddenHit'> {
    const hitReq = this.required.length ? this.required.every(r => r.test(agent)) : undefined;
    const hitForb = this.forbidden.length ? this.forbidden.some(r => r.test(agent)) : undefined;
    return { requiredHit: hitReq, forbiddenHit: hitForb };
  }
}

export class SlotEvaluator {
  private asked = new Set<string>();
  private confirmed = new Set<string>();
  constructor(private slots: Record<string,string>) {}
  evaluate(agent: string): Pick<TurnMetrics,'askedCount'|'confirmedCount'> {
    const a = agent.toLowerCase();
    for (const [k,v] of Object.entries(this.slots)) {
      const kRe = new RegExp(`\\b${k}\\b`, 'i');
      const vRe = new RegExp(`${escapeRegExp(v)}`, 'i');
      if (kRe.test(a) || vRe.test(a)) this.asked.add(k);
      if (/(confirm|updated|set to|changed)/i.test(a) && (kRe.test(a) || vRe.test(a))) this.confirmed.add(k);
    }
    return { askedCount: this.asked.size, confirmedCount: this.confirmed.size };
  }
  conversation(): ConversationMetrics {
    const allSlotsConfirmed = Object.keys(this.slots).every(k => this.confirmed.has(k));
    return { goalsCompleted: 0, allGoalsCompleted: false, allSlotsConfirmed };
  }
}

export class GoalEvaluator {
  private hits: boolean[];
  constructor(private goals: string[]) { this.hits = new Array(goals.length).fill(false); }
  evaluate(agent: string): void {
    const t = agent.toLowerCase();
    this.goals.forEach((g,i) => {
      const tok = g.toLowerCase().split(/\W+/).filter(Boolean);
      if (tok.some(w => t.includes(w))) this.hits[i] = true;
    });
  }
  conversation(): ConversationMetrics {
    const c = this.hits.filter(Boolean).length;
    return { goalsCompleted: c, allGoalsCompleted: c === this.hits.length, allSlotsConfirmed: false };
  }
}

export class LatencyEvaluator {
  constructor(private warn = 3000, private fail = 10000) {}
  evaluate(ms: number): Pick<TurnMetrics,'latencyStatus'> {
    return { latencyStatus: ms >= this.fail ? 'fail' : ms >= this.warn ? 'warn' : 'ok' };
  }
}

// ------------ Runner ------------
export class ConversationRunner {
  constructor(
    private bot: BotPort,
    private policy: AgendaPolicy,
    private evals: { regex?: RegexEvaluator; slots?: SlotEvaluator; goals?: GoalEvaluator; latency?: LatencyEvaluator },
    private maxTurns = 20
  ) {}

  async run(scenarioName: string, persona: Persona) {
    await this.bot.reset();
    this.policy.reset();

    const turns: TurnRecord[] = [];
    const turnMetrics: TurnMetrics[] = [];

    for (let t = 0; t < this.maxTurns; t++) {
      const userText = this.policy.nextUserUtterance(turns);
      if (userText == null) break;

      const { reply, latencyMs } = await this.bot.sendAndWaitForReply(userText);
      const tr: TurnRecord = { turn: t, user: userText, agent: reply, latencyMs };
      turns.push(tr);

      // evaluate per turn
      const m: TurnMetrics = { latencyStatus: 'ok' };
      if (this.evals.regex) Object.assign(m, this.evals.regex.evaluate(reply));
      if (this.evals.slots) Object.assign(m, this.evals.slots.evaluate(reply));
      if (this.evals.goals) this.evals.goals.evaluate(reply);
      if (this.evals.latency) Object.assign(m, this.evals.latency.evaluate(latencyMs));
      turnMetrics.push(m);
    }

    // aggregate
    const ga = this.evals.goals?.conversation() ?? { goalsCompleted: 0, allGoalsCompleted: false, allSlotsConfirmed: false };
    const sa = this.evals.slots?.conversation() ?? { goalsCompleted: 0, allGoalsCompleted: false, allSlotsConfirmed: false };
    const convo: ConversationMetrics = {
      goalsCompleted: ga.goalsCompleted,
      allGoalsCompleted: ga.allGoalsCompleted,
      allSlotsConfirmed: sa.allSlotsConfirmed
    };

    return { scenarioName, persona, turns, turnMetrics, conversation: convo };
  }
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

