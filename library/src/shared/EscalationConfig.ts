export enum EscalationTypes {
  REPLY_TO = 'REPLY_TO',
  RESOLVED = 'RESOLVED',
  ASSIGNED = 'ASSIGNED',
}

export enum EscalationTitles {
  REPLY_ESCALATION = 'If a ticket has not been replied to by the action time, send reminder mail',
  RESOLVED_ESCALATION = 'If a ticket has not been resolved by the action time, send reminder mail to pool of users',
  ASSIGNED_ESCALATION = 'If a ticket has not been assigned to by the action time, escalate to a higher priority',
}
