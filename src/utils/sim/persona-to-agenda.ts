// utils/sim/persona-to-agenda.ts
import type { Persona, AgendaStep } from './sim-eval';

export function agendaFromPersona(p: Persona): AgendaStep[] {
  const info = p.info || {};
  return [
    { template: 'Hi, I need to update my address.' },
    { template: 'My member id is {member_id} and date of birth is {dob}.',
      slots: { member_id: info['member id'] ?? '', dob: info['date of birth'] ?? '' } },
    { template: 'My new address is {addr}.',
      slots: { addr: info['new address'] ?? '' } },
    { template: 'Thanks, can you confirm the update went through?' },
    { template: 'Thank you!' }
  ];
}
