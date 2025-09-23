// Define the interface locally to avoid circular dependency
interface FAQTestConfig {
  agentType: 'healthplan' | 'clientservices' | 'policyholder';
  agentUrl: string;
  testTimeout: number;
  questionCount: number;
  pdfPath?: string;
}

/**
 * Default agent configurations for FAQ evaluation tests
 */
export const DEFAULT_AGENT_CONFIGS: Record<string, FAQTestConfig> = {
  policyholder: {
    agentType: 'policyholder',
    agentUrl: 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?agentId=9jr1HaT',
    testTimeout: 300000, // 5 minutes
    questionCount: 3
  },
  
  clientservices: {
    agentType: 'clientservices',
    agentUrl: 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?agentId=9jr1HaT',
    testTimeout: 300000, // 5 minutes
    questionCount: 3
  },
  
  healthplan: {
    agentType: 'healthplan',
    agentUrl: 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?agentId=9jr1HaT',
    testTimeout: 300000, // 5 minutes
    questionCount: 3
  }
};

/**
 * Environment-specific configurations
 */
export const ENV_CONFIGS = {
  development: {
    baseUrl: 'https://r2d2demo.ushur.dev',
    defaultTimeout: 300000,
    questionCount: 3
  },
  
  staging: {
    baseUrl: 'https://staging.ushur.dev',
    defaultTimeout: 300000,
    questionCount: 5
  },
  
  production: {
    baseUrl: 'https://ushur.dev',
    defaultTimeout: 600000, // 10 minutes for production
    questionCount: 5
  }
};

/**
 * Get configuration for a specific environment and agent type
 */
export function getAgentConfig(
  agentType: string, 
  environment: keyof typeof ENV_CONFIGS = 'development'
): FAQTestConfig {
  const baseConfig = DEFAULT_AGENT_CONFIGS[agentType];
  const envConfig = ENV_CONFIGS[environment];
  
  if (!baseConfig) {
    throw new Error(`Unknown agent type: ${agentType}`);
  }
  
  return {
    ...baseConfig,
    agentUrl: `${envConfig.baseUrl}/mob3.0/ushur-ui/?agentId=9jr1HaT`,
    testTimeout: envConfig.defaultTimeout,
    questionCount: envConfig.questionCount
  };
}

/**
 * Get all agent configurations for a specific environment
 */
export function getAllAgentConfigs(
  environment: keyof typeof ENV_CONFIGS = 'development'
): FAQTestConfig[] {
  return Object.keys(DEFAULT_AGENT_CONFIGS).map(agentType => 
    getAgentConfig(agentType, environment)
  );
}

/**
 * Custom agent configurations for specific use cases
 */
export const CUSTOM_AGENT_CONFIGS: Record<string, Partial<FAQTestConfig>> = {
  // High-volume testing with more questions
  highVolume: {
    questionCount: 10,
    testTimeout: 600000 // 10 minutes
  },
  
  // Quick testing with fewer questions
  quickTest: {
    questionCount: 1,
    testTimeout: 120000 // 2 minutes
  },
  
  // Comprehensive testing with extended timeout
  comprehensive: {
    questionCount: 5,
    testTimeout: 900000 // 15 minutes
  }
};

/**
 * Create a custom configuration by merging with defaults
 */
export function createCustomConfig(
  agentType: string,
  customConfig: Partial<FAQTestConfig>,
  environment: keyof typeof ENV_CONFIGS = 'development'
): FAQTestConfig {
  const baseConfig = getAgentConfig(agentType, environment);
  return { ...baseConfig, ...customConfig };
}
