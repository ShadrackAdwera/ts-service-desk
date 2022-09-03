# TS SERVICE DESK

- Microservice architecture for a service desk application.
- Connection to the services is through a LoadBalancer attached to it is a deployment with an ingress configuration with a set of routing rules.

## Cloud Provider

- GCP

## SERVICES

| Service          | Description                                                                                                    | CluterIP |
| ---------------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| Auth             | user module to handle sign-in, password reset etc                                                              | 5000     |
| Groups           | These will be attached to categories such that an auto assignment can run on the group attached to a category. | 5001     |
| Category         | ticket categories which will hold the auto-assignment logic                                                    | 5002     |
| Tickets          | Tickets Raised                                                                                                 | 5003     |
| Tickets Assigned | To keep a record of the number of tickets assigned to an agent                                                 | 5004     |
| Auto Assignment  | Run jobs to assign tickets to agents based on a priority queue data structure.                                 | 5005     |
| Escalation       | To handle dynamic escalation matrices which shall be attached to tickets raised.                               | 5006     |

**Services communicate asynchronously with each other by emitting events**

## EVENTS TO BE EMMITTED AND TO BE LISTENED TO

| Event           | Emmited By (Service)                      | Listened to By (Service)                                    |
| --------------- | ----------------------------------------- | ----------------------------------------------------------- |
| UserCreated     | User                                      | Auto Assignment, Groups,<br /> Tickets Assigned             |
| UserDeleted     | User                                      | Auto Assignment, Groups,<br /> Tickets Assigned             |
| UserUpdated     | User                                      | Auto Assignment, Groups,<br /> Tickets Assigned             |
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

_To update the README as the application continues._

## License

#### Copyright (c) 2022 Shadrack Adwera

#### Licenced under the [MIT License](LICENCE)
