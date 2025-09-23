// utils/sim/ui-chat.adapter.ts
import { Frame, Locator, Page } from '@playwright/test';

export type ChatSelectors = {
  input: string;            // textarea/input selector
  allMessages: string;      // container for all messages
  userMessages: string;     // user message bubbles
  agentMessages: string;    // agent message bubbles
};

export class UIChatAdapter {
  private frame: Frame;
  private sel: ChatSelectors;
  private page: Page;

  constructor(frame: Frame, page: Page, selectors: ChatSelectors) {
    this.frame = frame;
    this.sel = selectors;
    this.page = page;
  }

  async reset(): Promise<void> {
    // no-op for now; you could clear chat if your UI supports it
  }

  async sendAndWaitForReply(text: string, waitMs = 10000): Promise<{ reply: string; latencyMs: number }> {
    const input = this.frame.locator(this.sel.input).first();
    await input.waitFor({ state: 'visible', timeout: 10000 });

    // count agent messages before
    const agentBefore = await this.frame.locator(this.sel.agentMessages).count();
    console.log(`📊 Agent messages before: ${agentBefore}`);

    // type the user message
    await input.click();
    await input.fill(''); // clear
    await input.type(text, { delay: 25 });

    const t0 = performance.now();
    await input.press('Enter');
    console.log(`✅ Sent: "${text}"`);

    // wait for at least one new agent message to appear using polling
    let attempts = 0;
    const maxAttempts = Math.floor(waitMs / 1000);
    let agentAfter = agentBefore;
    
    while (attempts < maxAttempts) {
      await this.page.waitForTimeout(1000);
      attempts++;
      
      agentAfter = await this.frame.locator(this.sel.agentMessages).count();
      console.log(`🔍 Attempt ${attempts}: Agent messages = ${agentAfter} (was ${agentBefore})`);
      
      if (agentAfter > agentBefore) {
        console.log(`✅ New agent message detected!`);
        break;
      }
    }

    // fetch latest agent message
    const outs = this.frame.locator(this.sel.agentMessages);
    const outCount = await outs.count();
    let replyText = '';
    if (outCount > 0) {
      replyText = (await outs.nth(outCount - 1).innerText()).trim();
      console.log(`🤖 Agent response: "${replyText}"`);
    } else {
      console.log(`❌ No agent response captured`);
    }
    const latencyMs = Math.round(performance.now() - t0);
    return { reply: replyText, latencyMs };
  }
}

export const ushersSelectors = {
  input: 'body > div.tb-ushur.ushur-widget-container > div.ushur-chatbot.no-logo.no-title > div.chatbot-input-container > textarea',
  allMessages: 'div.chatbot-message',
  userMessages: 'div.chatbot-message.incoming',
  agentMessages: 'div.chatbot-message.outgoing'
} as const;
