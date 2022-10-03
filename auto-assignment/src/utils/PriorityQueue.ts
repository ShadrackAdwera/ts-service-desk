export interface ITicket {
  priority: string;
  id: string;
  //   timeCreated: number; - future modification - for duplicate priorities, also check time created
}

export class PriorityQueue {
  tickets: ITicket[];
  constructor() {
    this.tickets = [];
  }

  insert(ticket: ITicket): void {
    this.tickets.push(ticket);
    this.bubbleUp();
  }

  bubbleUp(): void {
    let index = this.tickets.length - 1;
    const insertedTicket = this.tickets[index];

    while (index !== 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      let parent = this.tickets[parentIndex];

      if (Number(insertedTicket.priority) <= Number(parent.priority)) break;
      this.tickets[index] = parent;
      this.tickets[parentIndex] = insertedTicket;
      index = parentIndex;
    }
  }

  extractMax(): ITicket | undefined {
    const max = this.tickets[0];
    const end = this.tickets.pop();
    if (!end) return undefined;
    this.tickets[0] = end;
    this.bubbleDown();
    return max;
  }

  bubbleDown(): void {
    //TODO: Implementation . . .
  }
}
