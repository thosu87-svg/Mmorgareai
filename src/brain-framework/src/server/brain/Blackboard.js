export class Blackboard {
  constructor() { this.facts = {}; this.proposals = []; }
  reset() { this.proposals = []; }
  propose(action) { this.proposals.push(action); }
}
