export interface Persona {
  background: string;
  info: Record<string, string>;
  goals: string[];
  goodbye_phrase?: string;
  style?: {
    verbosity?: 'terse' | 'normal' | 'chatty';
    typos?: 'none' | 'few' | 'some';
    emotion?: 'neutral' | 'polite' | 'concerned' | 'impatient';
  };
}

export interface SimulationConfig {
  agent_id: string;
  max_turns?: number;
  temperature?: number;
  model?: string;
  seed?: number;
}

export interface AgentMessage {
  role: 'agent' | 'system';
  content: string;
}

export interface UserMessage {
  role: 'user';
  content: string;
}

export interface ConversationMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp?: string;
}

export interface TestData {
  memberInfo: {
    firstName: string;
    lastName: string;
    memberId: string;
    dateOfBirth: string;
    currentAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    newAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    phoneNumber: string;
    email: string;
  };
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  scenario: string;
  goals: string[];
}

export interface TestDataFile {
  testData: TestData;
  testCases: TestCase[];
}

export interface BehaviorMetrics {
  correctness: number;
  relevance: number;
  conciseness: number;
  faithfulness: number;
  toxicity: number;
  hallucination: number;
  goalAccuracy: number;
  context: {
    correctness: number;
    relevance: number;
    precision: number;
    recall: number;
  };
  answer: {
    correctness: number;
    relevance: number;
    critic: number;
  };
}

export interface NextAction {
  type: 'SESSION_INIT' | 'SEND_USER_INPUT' | 'COMPLETE_SESSION' | 'FAIL_SESSION';
  data: {
    inputText?: string;
    sessionId?: string;
    reason?: string;
    evaluationResult?: {
      behavior: {
        correctness: number;
        relevance: number;
      };
    };
  };
}

export interface EvaluatorOutput {
  behavior: BehaviorMetrics;
  nextAction: NextAction;
}

export interface GoalAnalysis {
  goal: string;
  met: boolean;
  justification: string;
}

export interface EvaluationResult {
  goals_analysis: GoalAnalysis[];
  summary: string;
  raw?: string;
}

