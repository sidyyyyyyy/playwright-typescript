import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from '@langchain/core/prompts';
import { LLMChain } from 'langchain/chains';

/**
 * Enhanced GEval-based evaluation system with multiple correctness metrics
 * and LLM-based reason classification
 */
export class EnhancedGEvalEvaluator {
  private classifierLLM: ChatOpenAI;
  private classifyPrompt: ChatPromptTemplate;
  private classifyChain: LLMChain;

  constructor() {
    // Initialize classifier LLM
    this.classifierLLM = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.0,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    // Create classification prompt
    this.classifyPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `You are a fair evaluator of reasoning quality for chatbot responses.

Your goal is to classify whether the provided "reason" from a custom deepeval metric is acceptable and reasonable for justifying an evaluation result.

Be generous in your evaluation. If the reason provides any reasonable justification, classify it as True otherwise False. 

Respond with only one word: **True** or **False**`
      ),
      HumanMessagePromptTemplate.fromTemplate(
        "Reason:\n{reason}\n\nLabel:"
      ),
    ]);

    this.classifyChain = new LLMChain({
      llm: this.classifierLLM,
      prompt: this.classifyPrompt
    });
  }

  /**
   * Classify whether a reason is acceptable
   */
  async classifyReason(reason: string): Promise<boolean> {
    try {
      const raw = await this.classifyChain.invoke({ reason: reason });
      const result = raw.text.trim().toLowerCase();
      // treat anything starting with "true" as True
      return result.startsWith("true");
    } catch (error) {
      console.error('Error classifying reason:', error);
      return false; // Default to false if classification fails
    }
  }

  /**
   * Evaluate response using multiple GEval correctness metrics
   */
  async evaluateWithGEvalMetrics(
    question: string,
    response: string,
    expectedOutput: string
  ): Promise<{
    correctness1: { score: number; reason: string; classification: boolean };
    correctness2: { score: number; reason: string; classification: boolean };
    correctness3: { score: number; reason: string; classification: boolean };
    overallScore: number;
    evaluation: string;
  }> {
    console.log('🔍 Evaluating with enhanced GEval metrics...');

    // Metric 1: Check if all facts are present in answer that are present in expected_output
    const correctness1 = await this.evaluateCorrectness1(question, response, expectedOutput);
    const class1 = await this.classifyReason(correctness1.reason);

    // Metric 2: Check if extra facts are present in answer that are not in expected_output
    const correctness2 = await this.evaluateCorrectness2(question, response, expectedOutput);
    const class2 = await this.classifyReason(correctness2.reason);

    // Metric 3: Check if structure of answer matches structure of expected output
    const correctness3 = await this.evaluateCorrectness3(question, response, expectedOutput);
    const class3 = await this.classifyReason(correctness3.reason);

    // Metric 4: Answer Relevancy - how relevant is the response to the question
    const answerRelevancy = await this.evaluateAnswerRelevancy(question, response);
    const class4 = await this.classifyReason(answerRelevancy.reason);

    // Calculate overall score
    const scores = [correctness1.score, correctness2.score, correctness3.score, answerRelevancy.score];
    const validScores = scores.filter(score => !isNaN(score) && score >= 0);
    const overallScore = validScores.length > 0 
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length 
      : 0;

    const evaluation = this.generateEvaluation(overallScore);

    return {
      correctness1: { ...correctness1, classification: class1 },
      correctness2: { ...correctness2, classification: class2 },
      correctness3: { ...correctness3, classification: class3 },
      answerRelevancy: { ...answerRelevancy, classification: class4 },
      overallScore: Math.round(overallScore * 100) / 100,
      evaluation
    };
  }

  /**
   * GEval Metric 1: Check if all facts are present in answer that are present in expected_output
   */
  private async evaluateCorrectness1(
    question: string,
    response: string,
    expectedOutput: string
  ): Promise<{ score: number; reason: string }> {
    const evaluationLLM = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.0,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `You are an expert evaluator for chatbot responses. Your task is to check if all facts present in the expected output are also present in the actual response.

Evaluate on a scale of 0-1 where:
- 1.0 = All facts from expected output are present in the response
- 0.8 = Most facts are present with minor omissions
- 0.6 = Some facts are present but significant omissions
- 0.4 = Few facts are present, major omissions
- 0.2 = Very few facts are present
- 0.0 = No relevant facts are present

Provide your score and a detailed reason explaining your evaluation.`
      ),
      HumanMessagePromptTemplate.fromTemplate(
        `Question: {question}

Expected Output: {expectedOutput}

Actual Response: {response}

Score (0-1):`
      ),
    ]);

    const chain = new LLMChain({ llm: evaluationLLM, prompt: prompt });
    
    try {
      const result = await chain.invoke({
        question: question,
        expectedOutput: expectedOutput,
        response: response
      });

      // Extract score and reason from the response
      const responseText = result.text || result;
      const lines = responseText.split('\n').filter(line => line.trim());
      let score = 0.5; // Default score
      let reason = responseText;

      // Try to extract numeric score
      for (const line of lines) {
        const scoreMatch = line.match(/(\d+\.?\d*)/);
        if (scoreMatch) {
          const extractedScore = parseFloat(scoreMatch[1]);
          if (extractedScore >= 0 && extractedScore <= 1) {
            score = extractedScore;
            break;
          }
        }
      }

      return { score, reason };
    } catch (error) {
      console.error('Error in correctness1 evaluation:', error);
      return { score: 0.5, reason: 'Evaluation failed due to error' };
    }
  }

  /**
   * GEval Metric 2: Check if extra facts are present in answer that are not in expected_output
   */
  private async evaluateCorrectness2(
    question: string,
    response: string,
    expectedOutput: string
  ): Promise<{ score: number; reason: string }> {
    const evaluationLLM = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.0,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `You are an expert evaluator for chatbot responses. Your task is to check if the response contains extra facts that are not in the expected output.

Evaluate on a scale of 0-1 where:
- 1.0 = No extra facts, response perfectly matches expected scope
- 0.8 = Minimal extra facts that are still relevant
- 0.6 = Some extra facts but mostly relevant
- 0.4 = Several extra facts, some may be irrelevant
- 0.2 = Many extra facts, significant deviation from expected
- 0.0 = Response is completely off-topic or contains many irrelevant facts

Provide your score and a detailed reason explaining your evaluation.`
      ),
      HumanMessagePromptTemplate.fromTemplate(
        `Question: {question}

Expected Output: {expectedOutput}

Actual Response: {response}

Score (0-1):`
      ),
    ]);

    const chain = new LLMChain({ llm: evaluationLLM, prompt: prompt });
    
    try {
      const result = await chain.invoke({
        question: question,
        expectedOutput: expectedOutput,
        response: response
      });

      // Extract score and reason from the response
      const responseText = result.text || result;
      const lines = responseText.split('\n').filter(line => line.trim());
      let score = 0.5; // Default score
      let reason = responseText;

      // Try to extract numeric score
      for (const line of lines) {
        const scoreMatch = line.match(/(\d+\.?\d*)/);
        if (scoreMatch) {
          const extractedScore = parseFloat(scoreMatch[1]);
          if (extractedScore >= 0 && extractedScore <= 1) {
            score = extractedScore;
            break;
          }
        }
      }

      return { score, reason };
    } catch (error) {
      console.error('Error in correctness2 evaluation:', error);
      return { score: 0.5, reason: 'Evaluation failed due to error' };
    }
  }

  /**
   * GEval Metric 3: Check if structure of answer matches structure of expected output
   */
  private async evaluateCorrectness3(
    question: string,
    response: string,
    expectedOutput: string
  ): Promise<{ score: number; reason: string }> {
    const evaluationLLM = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.0,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `You are an expert evaluator for chatbot responses. Your task is to check if the structure and format of the response matches the expected output structure.

Evaluate on a scale of 0-1 where:
- 1.0 = Perfect structural match with expected output
- 0.8 = Very good structural match with minor differences
- 0.6 = Good structural match with some differences
- 0.4 = Fair structural match with notable differences
- 0.2 = Poor structural match with significant differences
- 0.0 = No structural similarity to expected output

Consider: organization, formatting, flow, completeness of structure, logical progression.

Provide your score and a detailed reason explaining your evaluation.`
      ),
      HumanMessagePromptTemplate.fromTemplate(
        `Question: {question}

Expected Output: {expectedOutput}

Actual Response: {response}

Score (0-1):`
      ),
    ]);

    const chain = new LLMChain({ llm: evaluationLLM, prompt: prompt });
    
    try {
      const result = await chain.invoke({
        question: question,
        expectedOutput: expectedOutput,
        response: response
      });

      // Extract score and reason from the response
      const responseText = result.text || result;
      const lines = responseText.split('\n').filter(line => line.trim());
      let score = 0.5; // Default score
      let reason = responseText;

      // Try to extract numeric score
      for (const line of lines) {
        const scoreMatch = line.match(/(\d+\.?\d*)/);
        if (scoreMatch) {
          const extractedScore = parseFloat(scoreMatch[1]);
          if (extractedScore >= 0 && extractedScore <= 1) {
            score = extractedScore;
            break;
          }
        }
      }

      return { score, reason };
    } catch (error) {
      console.error('Error in correctness3 evaluation:', error);
      return { score: 0.5, reason: 'Evaluation failed due to error' };
    }
  }

  /**
   * Evaluate answer relevancy - how relevant is the response to the question
   */
  async evaluateAnswerRelevancy(question: string, response: string): Promise<{ score: number; reason: string; classification: string }> {
    const relevancyPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `You are an expert evaluator assessing answer relevancy for chatbot responses.

Your task is to evaluate how relevant and directly the response addresses the specific question asked.

Evaluation Criteria:
- Does the response directly answer the question asked?
- Is the information provided relevant to what was requested?
- Does the response stay on topic and not go off on tangents?
- Is the response concise and focused on the question?

Score Guidelines:
- 1.0: Perfect relevancy - directly and completely answers the question
- 0.8-0.9: High relevancy - mostly answers the question with minor tangents
- 0.6-0.7: Moderate relevancy - partially answers but includes some irrelevant information
- 0.4-0.5: Low relevancy - barely addresses the question, mostly irrelevant
- 0.0-0.3: Very low relevancy - does not answer the question or is completely off-topic

Respond with a JSON object containing:
- "score": number between 0.0 and 1.0
- "reason": detailed explanation of the relevancy assessment`
      ),
      HumanMessagePromptTemplate.fromTemplate(
        `Question: {question}

Response: {response}

Evaluate the relevancy of the response to the question.`
      ),
    ]);

    const relevancyChain = new LLMChain({
      llm: this.classifierLLM,
      prompt: relevancyPrompt
    });

    try {
      const result = await relevancyChain.invoke({ question, response });
      const parsed = JSON.parse(result.text || result);
      
      const score = Math.max(0, Math.min(1, parsed.score || 0));
      const reason = parsed.reason || 'No reason provided';
      const classification = this.getClassification(score);

      return { score, reason, classification };
    } catch (error) {
      console.error('Error in answer relevancy evaluation:', error);
      return { 
        score: 0.5, 
        reason: 'Error in evaluation', 
        classification: 'Invalid' 
      };
    }
  }

  /**
   * Get classification based on score
   */
  private getClassification(score: number): boolean {
    return score >= 0.5;
  }

  /**
   * Generate evaluation text based on score
   */
  private generateEvaluation(score: number): string {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'Very Good';
    if (score >= 0.7) return 'Good';
    if (score >= 0.6) return 'Fair';
    if (score >= 0.5) return 'Poor';
    return 'Very Poor';
  }

  /**
   * Generate detailed evaluation report
   */
  generateDetailedReport(
    question: string,
    response: string,
    expectedOutput: string,
    evaluation: any
  ): string {
    let report = `\n📊 Enhanced GEval Evaluation Report\n`;
    report += `=====================================\n\n`;
    
    report += `📝 Question: ${question}\n\n`;
    report += `📝 Response: ${response.substring(0, 200)}${response.length > 200 ? '...' : ''}\n\n`;
    report += `📝 Expected: ${expectedOutput.substring(0, 200)}${expectedOutput.length > 200 ? '...' : ''}\n\n`;
    
    report += `📈 GEval Metrics:\n`;
    report += `   Correctness1 (Fact Presence): ${evaluation.correctness1.score.toFixed(3)}/1.0\n`;
    report += `   Reason: ${evaluation.correctness1.reason.substring(0, 100)}...\n`;
    report += `   Classification: ${evaluation.correctness1.classification ? '✅ Valid' : '❌ Invalid'}\n\n`;
    
    report += `   Correctness2 (Extra Facts): ${evaluation.correctness2.score.toFixed(3)}/1.0\n`;
    report += `   Reason: ${evaluation.correctness2.reason.substring(0, 100)}...\n`;
    report += `   Classification: ${evaluation.correctness2.classification ? '✅ Valid' : '❌ Invalid'}\n\n`;
    
    report += `   Correctness3 (Structure Match): ${evaluation.correctness3.score.toFixed(3)}/1.0\n`;
    report += `   Reason: ${evaluation.correctness3.reason.substring(0, 100)}...\n`;
    report += `   Classification: ${evaluation.correctness3.classification ? '✅ Valid' : '❌ Invalid'}\n\n`;
    
    if (evaluation.answerRelevancy) {
      report += `   Answer Relevancy: ${evaluation.answerRelevancy.score.toFixed(3)}/1.0\n`;
      report += `   Reason: ${evaluation.answerRelevancy.reason.substring(0, 100)}...\n`;
      report += `   Classification: ${evaluation.answerRelevancy.classification ? '✅ Valid' : '❌ Invalid'}\n\n`;
    }
    
    report += `🎯 Overall Score: ${evaluation.overallScore.toFixed(3)}/1.0 (${evaluation.evaluation})\n`;
    
    return report;
  }
}

/**
 * Factory for creating enhanced evaluators
 */
export class EnhancedEvaluatorFactory {
  static createEvaluator(): EnhancedGEvalEvaluator {
    return new EnhancedGEvalEvaluator();
  }
}
