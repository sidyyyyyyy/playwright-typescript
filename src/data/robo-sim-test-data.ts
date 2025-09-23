export const roboSimTestData = {
  memberInfo: {
    firstName: 'John',
    lastName: 'Doe',
    memberId: 'MEM12345',
    dateOfBirth: '1980-01-15',
    currentAddress: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105'
    },
    newAddress: {
      street: '456 Market St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103'
    },
    phoneNumber: '555-123-4567',
    email: 'john.doe@example.com'
  },
  testCases: [{
    id: 'address-update-001',
    name: 'Basic Address Update Flow',
    description: 'Validate agent\'s ability to handle a simple address update request',
    scenario: 'Given I am a member with an existing address...',
    goals: [
      'Successfully authenticate member',
      'Update member address',
      'Provide clear confirmation'
    ]
  }]
};

export const agentConfiguration = {
  type: 'HealthPlan',
  description: 'Health Plan Member Engagement System for automated testing with RoboSim integration',
  friendly: 'Friendly Farah',
  greet: 'Hi there! I\'m here to make navigating your health journey simple and stress-free—how can I help today?',
  personaId: 'persona_001',
  tone: 'Friendly',
  formality: 'Casual',
  empathy: 'High',
  readability: 'Grade 6',
  useCaseTemplate: 'healthplan_001',
  capName: 'Knowledge Base',
  capIndex: 0,
  taskId: 'task_002',
  taskName: 'Update Address',
  additionalTasks: [
    {
      id: 'task_002',
      name: 'Update Address',
      type: 'Tasks'
    }
  ]
};
