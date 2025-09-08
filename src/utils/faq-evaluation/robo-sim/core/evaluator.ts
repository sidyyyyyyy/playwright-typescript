import { ChatOpenAI } from '@langchain/openai';
import { ConversationMessage, EvaluationResult, BehaviorMetrics, NextAction, EvaluatorOutput } from './schema';
import { buildEvaluationPrompt } from './prompt';
import { containsSuccessMarkers, containsAuthCues, containsAddressCues } from './policies';

export class RoboEvaluator {
  private llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY
    });
  }

  async evaluateGoals(conversation: ConversationMessage[], goals: string[]): Promise<EvaluationResult> {
    const prompt = buildEvaluationPrompt(conversation, goals);
    
    try {
      const response = await this.llm.invoke([{ role: 'system' as const, content: prompt }]);
      const text = response.content as string;
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        return {
          goals_analysis: [],
          summary: 'Parse error',
          raw: text
        };
      }
    } catch (error) {
      console.error('Evaluation Error:', error);
      return {
        goals_analysis: [],
        summary: 'Evaluation failed',
        raw: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async evaluateBehavior(conversation: ConversationMessage[], goals: string[]): Promise<BehaviorMetrics> {
    const lastAgentMessage = conversation[conversation.length - 1]?.content || '';
    const lastUserMessage = conversation[conversation.length - 2]?.content || '';
    
    // Rule-based evaluation for speed
    const correctness = this.evaluateCorrectness(conversation, goals);
    const relevance = this.evaluateRelevance(conversation);
    const conciseness = this.evaluateConciseness(conversation);
    const faithfulness = this.evaluateFaithfulness(conversation);
    const toxicity = this.evaluateToxicity(conversation);
    const hallucination = this.evaluateHallucination(conversation);
    const goalAccuracy = this.evaluateGoalAccuracy(conversation, goals);

    return {
      correctness,
      relevance,
      conciseness,
      faithfulness,
      toxicity,
      hallucination,
      goalAccuracy,
      context: {
        correctness: correctness,
        relevance: relevance,
        precision: relevance,
        recall: correctness
      },
      answer: {
        correctness: correctness,
        relevance: relevance,
        critic: (correctness + relevance) / 2
      }
    };
  }

  private evaluateCorrectness(conversation: ConversationMessage[], goals: string[]): number {
    let score = 0;
    const totalGoals = goals.length;
    
    for (const goal of goals) {
      if (goal.toLowerCase().includes('authenticate')) {
        if (conversation.some(msg => containsAuthCues(msg.content))) {
          score += 1;
        }
      } else if (goal.toLowerCase().includes('address')) {
        if (conversation.some(msg => containsAddressCues(msg.content))) {
          score += 1;
        }
      } else if (goal.toLowerCase().includes('confirm')) {
        if (conversation.some(msg => containsSuccessMarkers(msg.content))) {
          score += 1;
        }
      }
    }
    
    return totalGoals > 0 ? score / totalGoals : 0;
  }

  private evaluateRelevance(conversation: ConversationMessage[]): number {
    const userMessages = conversation.filter(msg => msg.role === 'user');
    if (userMessages.length === 0) return 0;
    
    let relevantCount = 0;
    for (const msg of userMessages) {
      const content = msg.content.toLowerCase();
      if (content.includes('member') || content.includes('address') || 
          content.includes('update') || content.includes('yes') || 
          content.includes('correct') || content.includes('confirm')) {
        relevantCount++;
      }
    }
    
    return relevantCount / userMessages.length;
  }

  private evaluateConciseness(conversation: ConversationMessage[]): number {
    const userMessages = conversation.filter(msg => msg.role === 'user');
    if (userMessages.length === 0) return 0;
    
    const avgLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length;
    
    // Prefer messages between 20-100 characters
    if (avgLength >= 20 && avgLength <= 100) return 1.0;
    if (avgLength < 20) return 0.8;
    if (avgLength > 100 && avgLength <= 200) return 0.6;
    return 0.4;
  }

  private evaluateFaithfulness(conversation: ConversationMessage[]): number {
    // Check if user messages stay within expected patterns
    const userMessages = conversation.filter(msg => msg.role === 'user');
    if (userMessages.length === 0) return 0;
    
    let faithfulCount = 0;
    for (const msg of userMessages) {
      const content = msg.content.toLowerCase();
      if (!content.includes('simulated') && !content.includes('test') && 
          !content.includes('fake') && !content.includes('bot')) {
        faithfulCount++;
      }
    }
    
    return faithfulCount / userMessages.length;
  }

  private evaluateToxicity(conversation: ConversationMessage[]): number {
    const toxicWords = ['hate', 'stupid', 'idiot', 'dumb', 'suck', 'terrible', 'awful'];
    const allContent = conversation.map(msg => msg.content.toLowerCase()).join(' ');
    
    for (const word of toxicWords) {
      if (allContent.includes(word)) {
        return 1.0; // High toxicity
      }
    }
    
    return 0.0; // No toxicity detected
  }

  private evaluateHallucination(conversation: ConversationMessage[]): number {
    const userMessages = conversation.filter(msg => msg.role === 'user');
    if (userMessages.length === 0) return 0;
    
    let hallucinationCount = 0;
    for (const msg of userMessages) {
      const content = msg.content.toLowerCase();
      // Check for made-up information
      if (content.includes('my social security') || 
          content.includes('my credit card') ||
          content.includes('my bank account') ||
          content.includes('my insurance policy number')) {
        hallucinationCount++;
      }
    }
    
    return hallucinationCount / userMessages.length;
  }

  private evaluateGoalAccuracy(conversation: ConversationMessage[], goals: string[]): number {
    return this.evaluateCorrectness(conversation, goals);
  }

  async generateNextAction(
    conversation: ConversationMessage[], 
    goals: string[], 
    behavior: BehaviorMetrics
  ): Promise<NextAction> {
    const lastAgentMessage = conversation[conversation.length - 1]?.content || '';
    
    // Check if goals are met
    const allGoalsMet = goals.every(goal => {
      if (goal.toLowerCase().includes('authenticate')) {
        return conversation.some(msg => containsAuthCues(msg.content));
      } else if (goal.toLowerCase().includes('address')) {
        return conversation.some(msg => containsAddressCues(msg.content));
      } else if (goal.toLowerCase().includes('confirm')) {
        return conversation.some(msg => containsSuccessMarkers(msg.content));
      }
      return false;
    });

    if (allGoalsMet) {
      return {
        type: 'COMPLETE_SESSION',
        data: {
          reason: 'All goals achieved',
          evaluationResult: {
            behavior: {
              correctness: behavior.correctness,
              relevance: behavior.relevance
            }
          }
        }
      };
    }

    // Check for technical issues
    if (conversation.length > 5 && behavior.correctness < 0.3) {
      return {
        type: 'FAIL_SESSION',
        data: {
          reason: 'Low correctness score indicates technical issues'
        }
      };
    }

    // Continue conversation
    return {
      type: 'SEND_USER_INPUT',
      data: {
        inputText: 'Continue conversation',
        sessionId: 'current'
      }
    };
  }

  async evaluate(conversation: ConversationMessage[], goals: string[]): Promise<EvaluatorOutput> {
    const behavior = await this.evaluateBehavior(conversation, goals);
    const nextAction = await this.generateNextAction(conversation, goals, behavior);
    
    return {
      behavior,
      nextAction
    };
  }
}
