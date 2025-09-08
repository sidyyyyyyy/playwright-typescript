export const ERROR_PATTERNS = [
  'something went wrong',
  'an error occurred',
  'please try again',
  'let me try that again',
  'having trouble',
  'apologize for the inconvenience',
  'there seems to be an issue',
  'unable to process',
  'attempt that again',
  'experiencing difficulties',
  'i cannot',
  'i can\'t',
  'not able',
  'sorry',
  'technical issue',
  'error',
  'problem',
  'trouble'
];

export function isRetryableError(text: string): boolean {
  const lowerText = text.toLowerCase();
  return ERROR_PATTERNS.some(pattern => lowerText.includes(pattern));
}

export const SUCCESS_MARKERS = [
  'updated',
  'confirmed',
  'processed',
  'success',
  'complete',
  'done',
  'finished',
  'successful'
];

export const AUTHENTICATION_CUES = [
  'member id',
  'account verification',
  'date of birth',
  'dob',
  'birthday',
  'verify',
  'authentication',
  'identity'
];

export const ADDRESS_CUES = [
  'address',
  'where do you live',
  'residential',
  'location',
  'current address',
  'new address',
  'updated address'
];

export function containsSuccessMarkers(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SUCCESS_MARKERS.some(marker => lowerText.includes(marker));
}

export function containsAuthCues(text: string): boolean {
  const lowerText = text.toLowerCase();
  return AUTHENTICATION_CUES.some(cue => lowerText.includes(cue));
}

export function containsAddressCues(text: string): boolean {
  const lowerText = text.toLowerCase();
  return ADDRESS_CUES.some(cue => lowerText.includes(cue));
}

export function shouldStopConversation(text: string, goodbyePhrase: string): boolean {
  const lowerText = text.toLowerCase();
  const endings = [
    'that\'s all',
    'goodbye',
    'bye',
    goodbyePhrase.toLowerCase(),
    'take care',
    'have a great day',
    'have a wonderful day',
    'you too',
    'thank you for your help',
    'thanks for your help'
  ];
  return endings.some(ending => lowerText.includes(ending));
}

