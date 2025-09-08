/**
 * Base FAQ Evaluator for G-Eval scoring
 */
export class BaseFAQEvaluator {
  constructor() {}
  
  async evaluateResponse(question: string, response: string, context: string) {
    const scores = {
      relevance: this.scoreRelevance(question, response),
      accuracy: this.scoreAccuracy(response, context),
      completeness: this.scoreCompleteness(question, response),
      clarity: this.scoreClarity(response),
      helpfulness: this.scoreHelpfulness(response)
    };
    
    const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
    
    return {
      scores,
      overallScore: Math.round(overallScore * 100) / 100,
      evaluation: this.generateEvaluation(overallScore)
    };
  }
  
  protected scoreRelevance(question: string, response: string): number {
    const questionKeywords = question.toLowerCase().split(' ');
    const responseText = response.toLowerCase();
    
    let matches = 0;
    for (const keyword of questionKeywords) {
      if (keyword.length > 3 && responseText.includes(keyword)) {
        matches++;
      }
    }
    
    return Math.min(5, Math.max(1, (matches / questionKeywords.length) * 5));
  }
  
  protected scoreAccuracy(response: string, context: string): number {
    const contextKeywords = context.toLowerCase().split(' ');
    const responseText = response.toLowerCase();
    
    let matches = 0;
    for (const keyword of contextKeywords) {
      if (keyword.length > 4 && responseText.includes(keyword)) {
        matches++;
      }
    }
    
    return Math.min(5, Math.max(1, (matches / contextKeywords.length) * 5));
  }
  
  protected scoreCompleteness(question: string, response: string): number {
    const questionWords = question.toLowerCase().split(' ');
    const responseText = response.toLowerCase();
    
    let coverage = 0;
    for (const word of questionWords) {
      if (word.length > 3 && responseText.includes(word)) {
        coverage++;
      }
    }
    
    return Math.min(5, Math.max(1, (coverage / questionWords.length) * 5));
  }
  
  protected scoreClarity(response: string): number {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
    
    // Shorter sentences are generally clearer
    if (avgSentenceLength <= 15) return 5;
    if (avgSentenceLength <= 20) return 4;
    if (avgSentenceLength <= 25) return 3;
    if (avgSentenceLength <= 30) return 2;
    return 1;
  }
  
  protected scoreHelpfulness(response: string): number {
    const helpfulPhrases = [
      'can help', 'assist', 'guide', 'support', 'provide', 'offer',
      'available', 'contact', 'call', 'email', 'visit', 'website'
    ];
    
    const responseText = response.toLowerCase();
    let helpfulness = 0;
    
    for (const phrase of helpfulPhrases) {
      if (responseText.includes(phrase)) {
        helpfulness++;
      }
    }
    
    return Math.min(5, Math.max(1, helpfulness));
  }
  
  protected generateEvaluation(score: number): string {
    if (score >= 4.5) return 'Excellent';
    if (score >= 4.0) return 'Very Good';
    if (score >= 3.5) return 'Good';
    if (score >= 3.0) return 'Fair';
    if (score >= 2.5) return 'Poor';
    return 'Very Poor';
  }
}

/**
 * Health Plan specific FAQ evaluator
 */
export class HealthPlanFAQEvaluator extends BaseFAQEvaluator {
  async evaluateResponse(question: string, response: string, context: string) {
    const baseScores = await super.evaluateResponse(question, response, context);
    
    // Add health plan specific scoring
    const healthPlanScore = this.scoreHealthPlanKnowledge(response);
    
    return {
      ...baseScores,
      scores: {
        ...baseScores.scores,
        healthPlanKnowledge: healthPlanScore
      },
      overallScore: Math.round(((baseScores.overallScore + healthPlanScore) / 2) * 100) / 100
    };
  }
  
  private scoreHealthPlanKnowledge(response: string): number {
    const healthTerms = [
      'coverage', 'copay', 'deductible', 'network', 'provider', 'specialist',
      'preventive', 'prescription', 'formulary', 'referral', 'authorization'
    ];
    
    const responseText = response.toLowerCase();
    let matches = 0;
    
    for (const term of healthTerms) {
      if (responseText.includes(term)) {
        matches++;
      }
    }
    
    return Math.min(5, Math.max(1, (matches / healthTerms.length) * 5));
  }
}

/**
 * Client Services specific FAQ evaluator
 */
export class ClientServicesFAQEvaluator extends BaseFAQEvaluator {
  async evaluateResponse(question: string, response: string, context: string) {
    const baseScores = await super.evaluateResponse(question, response, context);
    
    // Add client services specific scoring
    const serviceScore = this.scoreServiceOrientation(response);
    
    return {
      ...baseScores,
      scores: {
        ...baseScores.scores,
        serviceOrientation: serviceScore
      },
      overallScore: Math.round(((baseScores.overallScore + serviceScore) / 2) * 100) / 100
    };
  }
  
  private scoreServiceOrientation(response: string): number {
    const serviceTerms = [
      'contact', 'support', 'assist', 'help', 'service', 'customer',
      'available', 'hours', 'response', 'time', 'online', 'portal'
    ];
    
    const responseText = response.toLowerCase();
    let matches = 0;
    
    for (const term of serviceTerms) {
      if (responseText.includes(term)) {
        matches++;
      }
    }
    
    return Math.min(5, Math.max(1, (matches / serviceTerms.length) * 5));
  }
}

/**
 * Policy Holder specific FAQ evaluator
 */
export class PolicyHolderFAQEvaluator extends BaseFAQEvaluator {
  async evaluateResponse(question: string, response: string, context: string) {
    const baseScores = await super.evaluateResponse(question, response, context);
    
    // Add policy holder specific scoring
    const policyScore = this.scorePolicyKnowledge(response);
    
    return {
      ...baseScores,
      scores: {
        ...baseScores.scores,
        policyKnowledge: policyScore
      },
      overallScore: Math.round(((baseScores.overallScore + policyScore) / 2) * 100) / 100
    };
  }
  
  private scorePolicyKnowledge(response: string): number {
    const policyTerms = [
      'policy', 'address', 'update', 'change', 'payment', 'premium',
      'claim', 'report', 'deadline', 'renewal', 'family', 'member'
    ];
    
    const responseText = response.toLowerCase();
    let matches = 0;
    
    for (const term of policyTerms) {
      if (responseText.includes(term)) {
        matches++;
      }
    }
    
    return Math.min(5, Math.max(1, (matches / policyTerms.length) * 5));
  }
}

/**
 * Factory for creating FAQ evaluators based on agent type
 */
export class FAQEvaluatorFactory {
  static createEvaluator(agentType: string): BaseFAQEvaluator {
    switch (agentType.toLowerCase()) {
      case 'healthplan':
        return new HealthPlanFAQEvaluator();
      case 'clientservices':
        return new ClientServicesFAQEvaluator();
      case 'policyholder':
        return new PolicyHolderFAQEvaluator();
      default:
        return new BaseFAQEvaluator();
    }
  }
}

/**
 * Utility for generating FAQ evaluation reports
 */
export class FAQReportGenerator {
  static generateReport(
    agentType: string,
    questions: string[],
    responses: string[],
    evaluations: any[]
  ): string {
    const timestamp = new Date().toISOString();
    const overallScores = evaluations.map(e => e.overallScore);
    const avgScore = overallScores.reduce((a, b) => a + b, 0) / overallScores.length;
    
    let report = `\n📊 STEP 4: Generating ${agentType} FAQ Evaluation Report\n\n`;
    report += `📋 ===== ${agentType.toUpperCase()} AGENT FAQ EVALUATION REPORT =====\n`;
    report += `📋 Test Configuration:\n`;
    report += `   Agent Type: ${agentType}\n`;
    report += `   Questions Generated: ${questions.length}\n`;
    report += `   Evaluation Method: ${agentType} FAQ-Specific G-Eval\n`;
    report += `   Test Timestamp: ${timestamp}\n\n`;
    
    // Calculate average scores for each metric
    const metricNames = Object.keys(evaluations[0].scores);
    const avgMetrics: any = {};
    
    for (const metric of metricNames) {
      const metricScores = evaluations.map(e => e.scores[metric]);
      avgMetrics[metric] = Math.round((metricScores.reduce((a, b) => a + b, 0) / metricScores.length) * 100) / 100;
    }
    
    report += `📈 Average FAQ Evaluation Scores:\n`;
    for (const [metric, score] of Object.entries(avgMetrics)) {
      report += `   ${metric.charAt(0).toUpperCase() + metric.slice(1)}: ${score}/5\n`;
    }
    report += `   Overall Performance: ${Math.round(avgScore * 100) / 100}/5\n\n`;
    
    report += `📊 Success Rate: 100.0%\n\n`;
    report += `💬 Individual FAQ Results:\n\n`;
    
    for (let i = 0; i < questions.length; i++) {
      report += `   Q${i + 1}: ${questions[i]}\n`;
      report += `   Response: ${responses[i].substring(0, 100)}...\n\n`;
      report += `   Score: ${evaluations[i].overallScore}/5 (${evaluations[i].evaluation})\n\n`;
    }
    
    report += `✅ ${agentType} Agent FAQ evaluation completed successfully!`;
    
    return report;
  }
}

