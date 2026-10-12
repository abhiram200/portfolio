// Starter questions shown in the chat panel. Kept separate from the knowledge
// base so pages can show them without loading the whole bot.
export const suggestions = [
  'What does he do at EY?',
  'Is he looking for a new role?',
  'How does SYNAPSE work?',
  'How strong is the chess engine?',
  'Has he worked with AWS?',
  'How can I contact him?',
];

// Follow-up questions shown after an answer about a specific project or role.
export const followUps = {
  aura: ['How does AURA use SYNAPSE?', 'What tools does AURA’s agent have?', 'How was AURA built?'],
  synapse: ['How does SYNAPSE search work?', 'What does impact analysis show?', 'How does SYNAPSE analyse API routes?'],
  'reverse-learning': ['How does Reverse Learning make decisions?', 'How does it handle long-running jobs?', 'What are its known limits?'],
  forcingknight: ['What is the forcing-line search?', 'How did he fix the learning rate?', 'How strong is ForcingKnight?'],
  'lora-alerting': ['What did he build for the LoRa project?', 'Where was the paper published?', 'Where could the LoRa project go next?'],
  ey: ['What are history fixes?', 'How does he debug failed loads?', 'Is he looking for a new role?'],
  perusal: ['What did the tester role do?', 'How was the platform hosted?', 'What did the certification workflow do?'],
};
