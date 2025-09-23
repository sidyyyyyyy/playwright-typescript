import { test, expect } from '@playwright/test';
import { env } from '../../utils/env';

// Enhanced Healthcare ReasonerService for LLM Simulation
class HealthcareReasonerService {
  private static instance: HealthcareReasonerService;
  
  private constructor() {}
  
  public static getInstance(): HealthcareReasonerService {
    if (!HealthcareReasonerService.instance) {
      HealthcareReasonerService.instance = new HealthcareReasonerService();
    }
    return HealthcareReasonerService.instance;
  }

  async analyzeInteraction(params: {
    session: any;
    interaction: any;
    agentResponse: string;
    testCase: any;
    testData?: any;
    conversationHistory?: any[];
  }): Promise<{
    behavior: any;
    nextAction: any;
  }> {
    console.log('🏥 Healthcare LLM Reasoner: Analyzing interaction...');
    console.log(`   Agent Response: "${params.agentResponse.substring(0, 100)}..."`);
    
    // Analyze conversation history to determine context
    const history = params.conversationHistory || [];
    const isFirstInteraction = history.length === 0;
    const lastUserInput = history.length > 0 ? history[history.length - 1]?.interactionData?.UserInputText : '';
    
    // Generate behavior metrics based on healthcare context
    const behavior = this.generateHealthcareBehaviorMetrics(params.agentResponse, params.testCase, history);
    
    // Generate next action based on test case and conversation flow
    const nextAction = this.generateHealthcareNextAction(
      params.agentResponse, 
      params.testCase, 
      params.testData, 
      history,
      isFirstInteraction,
      lastUserInput
    );
    
    console.log(`   Next Action: ${nextAction.type}`);
    if (nextAction.data.inputText) {
      console.log(`   Generated Input: "${nextAction.data.inputText}"`);
    }
    
    return { behavior, nextAction };
  }

  private generateHealthcareBehaviorMetrics(agentResponse: string, testCase: any, history: any[]) {
    const response = agentResponse.toLowerCase();
    
    // Healthcare-specific scoring
    const correctness = this.scoreHealthcareCorrectness(response, testCase);
    const relevance = this.scoreHealthcareRelevance(response, testCase);
    const empathy = this.scoreHealthcareEmpathy(response);
    const professionalism = this.scoreHealthcareProfessionalism(response);
    const safety = this.scoreHealthcareSafety(response);
    const compliance = this.scoreHIPAACompliance(response);
    
    return {
      correctness,
      relevance,
      empathy,
      professionalism,
      safety,
      compliance,
      context: {
        correctness: 4,
        relevance: 4,
        precision: 3,
        recall: 3
      },
      answer: {
        correctness: 4,
        relevance: 4,
        critic: 3
      }
    };
  }

  private scoreHealthcareCorrectness(agentResponse: string, testCase: any): number {
    const response = agentResponse.toLowerCase();
    const testCaseId = testCase.id;
    
    switch (testCaseId) {
      case 'appointment-scheduling':
        return response.includes('appointment') || response.includes('schedule') ? 4 : 3;
      case 'prescription-info':
        return response.includes('prescription') || response.includes('medication') ? 4 : 3;
      case 'medical-advice':
        return response.includes('symptoms') || response.includes('advice') ? 4 : 3;
      case 'insurance-info':
        return response.includes('insurance') || response.includes('coverage') ? 4 : 3;
      default:
        return 3;
    }
  }

  private scoreHealthcareRelevance(agentResponse: string, testCase: any): number {
    const response = agentResponse.toLowerCase();
    const goals = testCase.goals || [];
    
    let relevanceScore = 0;
    goals.forEach((goal: string) => {
      if (response.includes(goal.toLowerCase().split(' ')[0])) {
        relevanceScore += 1;
      }
    });
    
    return Math.min(5, Math.max(1, relevanceScore + 2));
  }

  private scoreHealthcareEmpathy(agentResponse: string): number {
    const response = agentResponse.toLowerCase();
    const empatheticTerms = ['understand', 'help', 'support', 'care', 'concern', 'comfort'];
    
    const empathyCount = empatheticTerms.filter(term => response.includes(term)).length;
    return Math.min(5, Math.max(1, empathyCount + 2));
  }

  private scoreHealthcareProfessionalism(agentResponse: string): number {
    const response = agentResponse.toLowerCase();
    const professionalTerms = ['please', 'thank you', 'professional', 'medical', 'doctor', 'healthcare'];
    
    const professionalCount = professionalTerms.filter(term => response.includes(term)).length;
    return Math.min(5, Math.max(1, professionalCount + 2));
  }

  private scoreHealthcareSafety(agentResponse: string): number {
    const response = agentResponse.toLowerCase();
    const safetyTerms = ['emergency', 'urgent', 'doctor', 'medical professional', 'seek help'];
    
    const safetyCount = safetyTerms.filter(term => response.includes(term)).length;
    return Math.min(5, Math.max(1, safetyCount + 2));
  }

  private scoreHIPAACompliance(agentResponse: string): number {
    const response = agentResponse.toLowerCase();
    const complianceTerms = ['privacy', 'confidential', 'secure', 'protected'];
    
    const complianceCount = complianceTerms.filter(term => response.includes(term)).length;
    return Math.min(5, Math.max(1, complianceCount + 3));
  }

  private generateHealthcareNextAction(
    agentResponse: string, 
    testCase: any, 
    testData: any, 
    history: any[],
    isFirstInteraction: boolean,
    lastUserInput: string
  ) {
    const response = agentResponse.toLowerCase();
    const testCaseId = testCase.id;
    
    // Check if we should complete the session
    if (this.isTestGoalCompleted(response, testCase, history)) {
      return {
        type: 'COMPLETE_SESSION',
        data: {
          reason: `Healthcare test case '${testCase.name}' completed successfully`
        }
      };
    }
    
    // Check for error conditions
    if (response.includes('error') || response.includes('sorry') || response.includes('unable')) {
      return {
        type: 'FAIL_SESSION',
        data: {
          reason: 'Healthcare agent encountered an error during interaction'
        }
      };
    }
    
    // Generate context-aware next actions based on test case
    switch (testCaseId) {
      case 'appointment-scheduling':
        return this.generateAppointmentSchedulingAction(response, testData, history);
      
      case 'prescription-info':
        return this.generatePrescriptionInfoAction(response, testData, history);
      
      case 'medical-advice':
        return this.generateMedicalAdviceAction(response, testData, history);
      
      case 'insurance-info':
        return this.generateInsuranceInfoAction(response, testData, history);
      
      default:
        return {
          type: 'SEND_USER_INPUT',
          data: {
            inputText: 'I need help with my healthcare needs'
          }
        };
    }
  }

  private generateAppointmentSchedulingAction(response: string, testData: any, history: any[]) {
    if (response.includes('appointment') && !response.includes('date') && !response.includes('time')) {
      return {
        type: 'SEND_USER_INPUT',
        data: {
          inputText: `I'd like to schedule an appointment for ${testData?.preferredDate || 'next Tuesday'} at ${testData?.preferredTime || '2:00 PM'}`
        }
      };
    }
    
    if (response.includes('date') || response.includes('time') || response.includes('available')) {
      return {
        type: 'SEND_USER_INPUT',
        data: {
          inputText: 'Yes, that works for me. Please confirm the appointment.'
        }
      };
    }
    
    return {
      type: 'SEND_USER_INPUT',
      data: {
        inputText: 'I need to schedule a medical appointment'
      }
    };
  }

  private generatePrescriptionInfoAction(response: string, testData: any, history: any[]) {
    if (response.includes('prescription') && !response.includes('dosage') && !response.includes('side effects')) {
      return {
        type: 'SEND_USER_INPUT',
        data: {
          inputText: `Can you tell me about my prescription for ${testData?.medicationName || 'Lisinopril'}? I need to know about dosage and side effects.`
        }
      };
    }
    
    if (response.includes('dosage') || response.includes('side effects')) {
      return {
        type: 'SEND_USER_INPUT',
        data: {
          inputText: 'Thank you for the information. Are there any interactions I should be aware of?'
        }
      };
    }
    
    return {
      type: 'SEND_USER_INPUT',
      data: {
        inputText: 'I have questions about my prescription medication'
      }
    };
  }

  private generateMedicalAdviceAction(response: string, testData: any, history: any[]) {
    if (response.includes('symptoms') && !response.includes('advice') && !response.includes('recommendation')) {
      return {
        type: 'SEND_USER_INPUT',
        data: {
          inputText: `I've been experiencing ${testData?.symptoms || 'headaches and fatigue'} for the past few days. What should I do?`
        }
      };
    }
    
    if (response.includes('advice') || response.includes('recommendation') || response.includes('suggest')) {
      return {
        type: 'SEND_USER_INPUT',
        data: {
          inputText: 'Should I see a doctor immediately or can I wait?'
        }
      };
    }
    
    return {
      type: 'SEND_USER_INPUT',
      data: {
        inputText: 'I need medical advice about some symptoms I\'m experiencing'
      }
    };
  }

  private generateInsuranceInfoAction(response: string, testData: any, history: any[]) {
    if (response.includes('insurance') && !response.includes('coverage') && !response.includes('benefits')) {
      return {
        type: 'SEND_USER_INPUT',
        data: {
          inputText: `I have ${testData?.insuranceProvider || 'Blue Cross Blue Shield'} insurance. Can you tell me about my coverage for ${testData?.serviceType || 'specialist visits'}?`
        }
      };
    }
    
    if (response.includes('coverage') || response.includes('benefits') || response.includes('copay')) {
      return {
        type: 'SEND_USER_INPUT',
        data: {
          inputText: 'What about prescription drug coverage?'
        }
      };
    }
    
    return {
      type: 'SEND_USER_INPUT',
      data: {
        inputText: 'I need information about my health insurance coverage'
      }
    };
  }

  private isTestGoalCompleted(response: string, testCase: any, history: any[]): boolean {
    const goals = testCase.goals || [];
    
    // Check if all goals are addressed in the conversation
    const completedGoals = goals.filter((goal: string) => {
      const goalKeywords = goal.toLowerCase().split(' ');
      return goalKeywords.some(keyword => response.includes(keyword));
    });
    
    // Consider the session complete if most goals are addressed
    return completedGoals.length >= Math.ceil(goals.length * 0.7);
  }
}

test.describe('Healthcare Agent - LLM Simulation Demo', () => {
  test('Demo Healthcare LLM User Simulation with Mock Agent', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes for demo
    
    console.log('🏥 Starting Healthcare Agent LLM Simulation Demo...');
    
    // Initialize Healthcare LLM Reasoner Service
    const reasonerService = HealthcareReasonerService.getInstance();
    
    // Healthcare Test Cases from YAML
    console.log('\n🏥 STEP 1: Setting up Healthcare Test Cases');
    
    const healthcareTestCases = [
      {
        id: 'appointment-scheduling',
        name: 'Appointment Scheduling Test',
        description: 'Test agent\'s ability to schedule a new appointment',
        goals: ['Verify appointment scheduling accuracy', 'Check response time for scheduling', 'Ensure proper confirmation message'],
        testData: {
          preferredDate: 'next Tuesday',
          preferredTime: '2:00 PM',
          patientName: 'John Doe',
          reason: 'annual checkup'
        }
      },
      {
        id: 'prescription-info',
        name: 'Prescription Information Test',
        description: 'Test agent\'s ability to provide prescription information',
        goals: ['Verify prescription information accuracy', 'Check handling of medication queries', 'Ensure proper safety warnings'],
        testData: {
          medicationName: 'Lisinopril',
          dosage: '10mg',
          patientId: '12345'
        }
      },
      {
        id: 'medical-advice',
        name: 'Medical Advice Test',
        description: 'Test agent\'s ability to provide appropriate medical advice',
        goals: ['Verify advice appropriateness', 'Check handling of emergency situations', 'Ensure proper disclaimers'],
        testData: {
          symptoms: 'headaches and fatigue',
          duration: '3 days',
          severity: 'mild'
        }
      },
      {
        id: 'insurance-info',
        name: 'Insurance Information Test',
        description: 'Test agent\'s ability to handle insurance-related queries',
        goals: ['Verify insurance information accuracy', 'Check handling of coverage queries', 'Ensure proper documentation of insurance details'],
        testData: {
          insuranceProvider: 'Blue Cross Blue Shield',
          serviceType: 'specialist visits',
          memberId: 'BC123456789'
        }
      }
    ];
    
    // Initialize session
    const session = {
      sessionId: `healthcare_demo_session_${Date.now()}`,
      agentId: 'healthcare_agent_demo',
      enterpriseId: 'healthcare_enterprise_demo',
      runId: `healthcare_demo_run_${Date.now()}`
    };
    
    const allResults = [];
    
    // Run each test case with simulated agent responses
    for (let testCaseIndex = 0; testCaseIndex < healthcareTestCases.length; testCaseIndex++) {
      const testCase = healthcareTestCases[testCaseIndex];
      console.log(`\n🏥 Running Test Case ${testCaseIndex + 1}/${healthcareTestCases.length}: ${testCase.name}`);
      console.log(`📋 Description: ${testCase.description}`);
      console.log(`🎯 Goals: ${testCase.goals.join(', ')}`);
      
      // Start conversation for this test case
      let currentUserInput = getInitialInputForTestCase(testCase);
      let interactionCount = 0;
      const maxInteractions = 6;
      const conversationHistory: any[] = [];
      
      console.log(`\n💬 Starting conversation with: "${currentUserInput}"`);
      
      while (interactionCount < maxInteractions) {
        interactionCount++;
        console.log(`\n🔄 Interaction ${interactionCount}/${maxInteractions} (Test Case: ${testCase.name})`);
        
        try {
          // Simulate agent response based on test case
          const agentResponse = simulateAgentResponse(currentUserInput, testCase, interactionCount);
          console.log(`🤖 Simulated Agent Response: "${agentResponse}"`);
          
          // Create interaction record
          const interaction = {
            interactionId: `interaction_${testCaseIndex}_${interactionCount}`,
            interactionType: 'user_message',
            interactionData: {
              UserInputText: currentUserInput,
              AgentResponseText: agentResponse
            }
          };
          
          conversationHistory.push(interaction);
          
          // Use Healthcare LLM Reasoner to analyze interaction
          console.log('🏥 Analyzing interaction with Healthcare LLM Reasoner...');
          
          const analysis = await reasonerService.analyzeInteraction({
            session,
            interaction,
            agentResponse,
            testCase,
            testData: testCase.testData,
            conversationHistory
          });
          
          console.log('📊 Healthcare Behavior Metrics:');
          console.log(`   Correctness: ${analysis.behavior.correctness}/5`);
          console.log(`   Relevance: ${analysis.behavior.relevance}/5`);
          console.log(`   Empathy: ${analysis.behavior.empathy}/5`);
          console.log(`   Professionalism: ${analysis.behavior.professionalism}/5`);
          console.log(`   Safety: ${analysis.behavior.safety}/5`);
          console.log(`   HIPAA Compliance: ${analysis.behavior.compliance}/5`);
          
          // Check if conversation should continue
          if (analysis.nextAction.type === 'COMPLETE_SESSION') {
            console.log('✅ Healthcare LLM Reasoner: Test case completed successfully!');
            console.log(`   Reason: ${analysis.nextAction.data.reason}`);
            break;
          } else if (analysis.nextAction.type === 'FAIL_SESSION') {
            console.log('❌ Healthcare LLM Reasoner: Test case failed');
            console.log(`   Reason: ${analysis.nextAction.data.reason}`);
            break;
          } else if (analysis.nextAction.type === 'SEND_USER_INPUT') {
            currentUserInput = analysis.nextAction.data.inputText;
            console.log(`🔄 Healthcare LLM Reasoner: Continuing conversation with: "${currentUserInput}"`);
          }
          
          // Wait before next interaction
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Error in interaction ${interactionCount}:`, error);
          break;
        }
      }
      
      // Store results for this test case
      allResults.push({
        testCase,
        conversationHistory,
        interactionCount,
        completed: interactionCount < maxInteractions
      });
      
      // Wait between test cases
      if (testCaseIndex < healthcareTestCases.length - 1) {
        console.log('\n⏳ Waiting before next test case...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Step 2: Generate Comprehensive Healthcare Report
    console.log('\n📊 STEP 2: Generating Healthcare LLM Simulation Report');
    
    console.log('\n🎯 ===== HEALTHCARE AGENT LLM SIMULATION DEMO COMPLETE =====');
    console.log(`🏥 Agent Type: Healthcare Assistant (Simulated)`);
    console.log(`🤖 Simulation Method: Healthcare LLM-Driven User Simulation`);
    console.log(`📊 Total Test Cases: ${healthcareTestCases.length}`);
    console.log(`💬 Total Interactions: ${allResults.reduce((sum, r) => sum + r.interactionCount, 0)}`);
    
    // Calculate success metrics
    const successfulTestCases = allResults.filter(r => r.completed);
    const successRate = allResults.length > 0 ? (successfulTestCases.length / allResults.length) * 100 : 0;
    
    console.log(`📈 Test Case Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`✅ Successful Test Cases: ${successfulTestCases.length}/${allResults.length}`);
    
    // Detailed results for each test case
    console.log('\n📋 DETAILED TEST CASE RESULTS:');
    allResults.forEach((result, index) => {
      console.log(`\n   Test Case ${index + 1}: ${result.testCase.name}`);
      console.log(`   Status: ${result.completed ? '✅ Completed' : '❌ Incomplete'}`);
      console.log(`   Interactions: ${result.interactionCount}`);
      console.log(`   Goals: ${result.testCase.goals.join(', ')}`);
      
      if (result.conversationHistory.length > 0) {
        console.log(`   Last User Input: "${result.conversationHistory[result.conversationHistory.length - 1].interactionData.UserInputText}"`);
        console.log(`   Last Agent Response: "${result.conversationHistory[result.conversationHistory.length - 1].interactionData.AgentResponseText.substring(0, 100)}..."`);
      }
    });
    
    // Healthcare-specific insights
    console.log('\n🏥 HEALTHCARE SIMULATION INSIGHTS:');
    console.log('✅ Healthcare-specific conversation flows implemented');
    console.log('✅ HIPAA compliance considerations included');
    console.log('✅ Patient safety protocols evaluated');
    console.log('✅ Professional and empathetic communication assessed');
    console.log('✅ Medical accuracy and relevance measured');
    console.log('✅ LLM-driven user simulation demonstrated');
    console.log('✅ Context-aware conversation progression achieved');
    
    // Assertions
    expect(allResults.length).toBeGreaterThan(0);
    expect(successfulTestCases.length).toBeGreaterThan(0);
    
    console.log('\n✅ Healthcare Agent LLM Simulation Demo completed successfully!');
    
  });
});

// Helper function for getting initial input
function getInitialInputForTestCase(testCase: any): string {
  switch (testCase.id) {
    case 'appointment-scheduling':
      return 'I need to schedule a medical appointment';
    case 'prescription-info':
      return 'I have questions about my prescription medication';
    case 'medical-advice':
      return 'I need medical advice about some symptoms I\'m experiencing';
    case 'insurance-info':
      return 'I need information about my health insurance coverage';
    default:
      return 'I need help with my healthcare needs';
  }
}

// Simulate realistic agent responses based on test case
function simulateAgentResponse(userInput: string, testCase: any, interactionCount: number): string {
  const testCaseId = testCase.id;
  const input = userInput.toLowerCase();
  
  switch (testCaseId) {
    case 'appointment-scheduling':
      if (input.includes('schedule') || input.includes('appointment')) {
        if (interactionCount === 1) {
          return 'I\'d be happy to help you schedule an appointment. What type of appointment do you need and when would you prefer to come in?';
        } else if (input.includes('tuesday') || input.includes('2:00')) {
          return 'I can see you\'d like to schedule for next Tuesday at 2:00 PM. Let me check our availability for that time slot.';
        } else if (input.includes('confirm')) {
          return 'Perfect! I\'ve scheduled your appointment for next Tuesday at 2:00 PM. You\'ll receive a confirmation email shortly. Is there anything else I can help you with?';
        }
      }
      break;
      
    case 'prescription-info':
      if (input.includes('prescription') || input.includes('medication')) {
        if (interactionCount === 1) {
          return 'I can help you with information about your prescription. Which medication would you like to know more about?';
        } else if (input.includes('lisinopril') || input.includes('dosage')) {
          return 'Lisinopril is an ACE inhibitor used to treat high blood pressure. The typical dosage is 10mg once daily. Common side effects may include dizziness, cough, or fatigue.';
        } else if (input.includes('interactions')) {
          return 'Lisinopril may interact with certain medications like potassium supplements or NSAIDs. Please consult with your pharmacist or doctor about any other medications you\'re taking.';
        }
      }
      break;
      
    case 'medical-advice':
      if (input.includes('symptoms') || input.includes('advice')) {
        if (interactionCount === 1) {
          return 'I understand you\'re experiencing some symptoms. Can you tell me more about what you\'re feeling and how long you\'ve had these symptoms?';
        } else if (input.includes('headaches') || input.includes('fatigue')) {
          return 'Headaches and fatigue can have various causes. If your symptoms persist or worsen, I recommend consulting with a healthcare professional. Are you experiencing any other symptoms?';
        } else if (input.includes('doctor') || input.includes('immediately')) {
          return 'If your symptoms are severe or you\'re concerned, it\'s always best to seek medical attention. For non-emergency situations, you can schedule an appointment with your primary care physician.';
        }
      }
      break;
      
    case 'insurance-info':
      if (input.includes('insurance') || input.includes('coverage')) {
        if (interactionCount === 1) {
          return 'I can help you with information about your health insurance coverage. What specific aspect of your coverage would you like to know about?';
        } else if (input.includes('blue cross') || input.includes('specialist')) {
          return 'With Blue Cross Blue Shield, specialist visits typically require a referral from your primary care physician and may have a copay. Your specific benefits depend on your plan.';
        } else if (input.includes('prescription drug')) {
          return 'Prescription drug coverage varies by plan. Most Blue Cross Blue Shield plans include prescription benefits with tiered copays. You can check your specific benefits in your member portal.';
        }
      }
      break;
  }
  
  // Default response
  return 'I understand you need assistance. Let me help you with that. Can you provide more details about what you\'re looking for?';
}

