# TS SERVICE DESK

Microservice architecture for a service desk application.

## SERVICES

- Auth - user module to handle sign-in, password reset etc
- Auto Assignment - run jobs to assign tickets to agents based on a proirity queue data structure.
- Category - ticket categories which will hold the auto-assignment logic
- Escalation - to handle dynamic escalation matrices which shall be attached to tickets raised.
- Groups - These will be attached to categories such that an auto assignment can run on the group attached to a category.
- Tickets
- Tickets Assigned - to keep a record of the number of tickets assigned to an agent

**Services communicate asynchronously with each other by emitting events**

## EVENTS TO BE EMMITTED AND TO BE LISTENED TO

| Event           | Emmited By (Service)                      | Listened to By (Service)                                    |
| --------------- | ----------------------------------------- | ----------------------------------------------------------- |
| UserCreated     | User                                      | Auto Assignment, Groups,<br /> Tickets Assigned             |
| CategoryCreated | Category                                  | Tickets                                                     |
| CategoryUpdated | Category                                  | Tickets                                                     |
| CategoryDeleted | Category                                  | Tickets                                                     |
| TicketCreated   | Ticket                                    | Auto Assignment                                             |
| TicketUpdated   | Ticket, Auto Assignment,<br /> Escalation | Ticket, Auto Assignment,<br /> Escalation, Tickets Assigned |
| TicketDeleted   | Ticket                                    | Ticket, Auto Assignment,<br /> Escalation, Tickets Assigned |
| GroupCreated    | Groups                                    | Category                                                    |
| GroupUpdated    | Groups                                    | Category                                                    |

## TECHNOLOGIES USED

- Node js
- Express
- Mongo DB
- Typescript
- Redis
- Nats Streaming Server
- Docker
- Kubernetes

_To be update the README as the application continues._

## License

#### Copyright (c) 2022 Shadrack Adwera

#### Licenced under the [MIT License](LICENCE)
