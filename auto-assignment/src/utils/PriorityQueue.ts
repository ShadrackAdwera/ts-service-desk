export interface ITicket {
  priority: string;
  id: string;
  timeCreated: number;
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
}
