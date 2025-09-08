export const agentConfig = {
    end_points: {
      createAgent: '/aiagents',
      activateAgent: '/activate',
      enterpriseSettings: '/rest/account/v2/jsondata/set',
      assets: '/rest/assets/v2/upload',
      agentInit:'/aiagentgw/init'
    },
    "enterprise_setting":{
        "userName":"TEST_ADMIN10@USHURDUMMY.ME",
        "data":{
        "displayAdvancedAISettings":"Yes",
        "liveChatConfig": "{\"Five9\":{\"scriptUrl\":\"\",\"tenant\":\"Ushur Inc\",\"profile\":\"\"}}",
        "ftagPassIappEnableChatbotReplyErrorHandler": "Yes",
        "displayUshurLi": "On",
        "displayLIProcessingModule": "Yes",
        "ftagPassIappEnableChatbotStopButton": "Yes",
        "displayLIJumpParameters": "Yes",
        "customizeIAHistory": "Yes",
        "displayLiveChatModule": "Yes",
        "showUi2Tabs":"Yes",
        "enableIABotDetection": "Yes",
        "showAIStudioTab": "Yes",
        "ftagPassShowConvoEditOption": "No",
        "ftagPassIappHideChatbotLogo": "Yes",
        "ftagPassIappEnableChatbotHelp": "No",
        "EnablePromptOptionalResponseToggle": "Yes",
        "displayAdditionalDetailsFeature": "Yes",
        "ShowDeveloperView": "Yes",
        "ftagPassAdditionalLanguagesForChatbot": "",
        "aiAgentSmartReview": "On",
        "aiAgentFeature": "On",
        "aiAgentDemoEnhancements": "On"
    }
    },
    create_agent: [
      {
        name: "placeholder", 
        description: "This is an automated test agent.",
        type: "HealthPlan",
        agentPersona: {
          friendlyName: "Friendly Farah",
          greetMessage: "Hi I am Farah, your friendly health advisor.",
          personaId: "persona_001",
          properties: {
            tone: "Friendly",
            formality: "Casual",
            empathy: "High",
            readability: "Grade 6"
          }
        },
        optedCapabilities: [
          {
            id: "aiskill_001",
            name: "Answer a question",
            type: "AISkill",
            knowledgeAssetId: "10a7a648-f239-4963-93d1-174c1b8b86f2.pdf"
          },
          {
            id: "task_003",
            name: "Download ID Card",
            type: "Tasks"
          }
        ],
        useCaseTemplate: "healthplan_001",
        knowledgeInfo: {
          appId: "",
          ushurPlatformKey: ""
        },
        brandInfo: {
          logo: "481db36d-de0f-4dd6-abed-9ae5c8f3f3a2",
          color: "#0D6EFD",
          personalIcon: "f4a46096-bbfe-4a66-805c-261b42d759d4",
          agentMessageIcon: "f4a46096-bbfe-4a66-805c-261b42d759d4"
        }
      }
    ]
  };
  