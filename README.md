# TS SERVICE DESK

- Microservice architecture for a service desk application.
- Connection to the services is through a LoadBalancer attached to it is a deployment with an ingress configuration with a set of routing rules.

## Cloud Provider

- GCP

## Architecture

![architecture](./service-desk.drawio.png)

## TICKET STATUSES

| Status                                       | Description                                                                                                                                                |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| $$\textcolor{yellow}{\text{OPEN}}$$          | When a new ticket has been created, it gets this status. These are tickets that are yet to be assigned to an agent.                                        |
| $$\textcolor{blue}{\text{IN PROGRESS}}$$     | Agent has been assigned a ticket and is working on it.                                                                                                     |
| $$\textcolor{orange}{\text{WAITING REPLY}}$$ | Tickets go into this state after an Agent replies to a ticket while waiting for more information from the user.                                            |
| $$\textcolor{purple}{\text{ON HOLD}}$$       | This is a case that cannot be completed right away. This means that the agent needs to consult with someone on the team or another person about the issue. |
| $$\textcolor{green}{\text{RESOLVED}}$$       | Ticket has been fully resolved.                                                                                                                            |

## PRIORITIES

### Response time and resolution time for given priorities (these are defaults which will be configurable from within the app)

| Priority                             | Respond Within | Resolve Within |
| ------------------------------------ | -------------- | -------------- |
| $$\textcolor{red}{\text{Critical}}$$ | 1 hour         | 3 hours        |
| $$\textcolor{pink}{\text{High}}$$    | 3 hours        | 5 hours        |
| $$\textcolor{blue}{\text{Medium}}$$  | 4 hours        | 24 hours       |
| $$\textcolor{green}{\text{Low}}$$    | 6 hours        | 48 hours       |

## SERVICES

| Service          | Description                                                                                                    | CluterIP Port |
| ---------------- | -------------------------------------------------------------------------------------------------------------- | ------------- |
| Auth             | user module to handle sign-in, password reset etc                                                              | 5000          |
| Groups           | These will be attached to categories such that an auto assignment can run on the group attached to a category. | 5001          |
| Category         | ticket categories which will hold the auto-assignment logic                                                    | 5002          |
| Tickets          | Tickets Raised                                                                                                 | 5003          |
| Auto Assignment  | Run jobs to assign tickets to agents based on a priority queue data structure.                                 | ----          |
| Tickets Assigned | To keep a record of the number of tickets assigned to an agent                                                 | 5005          |
| Escalation       | To handle dynamic escalation matrices which shall be attached to tickets raised.                               | 5006          |

**Services communicate asynchronously with each other through publishing events**

## EVENTS TO BE PUBLISHED AND TO BE LISTENED TO

| Event                   | Published By (Service)                    | Listened to By (Service)                                                             |
| ----------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------ |
| UserCreated             | User                                      | Auto Assignment, Groups,<br /> Tickets Assigned, Tickets                             |
| UserDeleted             | User                                      | Auto Assignment, Groups,<br /> Tickets Assigned, Tickets                             |
| UserUpdated             | User                                      | Auto Assignment, Groups,<br /> Tickets Assigned, Tickets                             |
| CategoryCreated         | Category                                  | Tickets, Auto Assignment                                                             |
| CategoryUpdated         | Category                                  | Tickets, Auto Assignment                                                             |
| CategoryDeleted         | Category                                  | Tickets, Auto Assignment                                                             |
| TicketCreated           | Ticket                                    | Auto Assignment, Tickets Assigned                                                    |
| TicketUpdated           | Ticket, Auto Assignment,<br /> Escalation | Auto Assignment,<br /> Escalation, Tickets Assigned                                  |
| TicketDeleted           | Ticket                                    | Auto Assignment,<br /> Escalation, Tickets Assigned<br />, Tickets (auto assignment) |
| GroupCreated            | Groups                                    | Category, Auto Assignment                                                            |
| GroupUpdated            | Groups                                    | Category, Auto Assignment                                                            |
| EscalationMatrixCreated | Escalation                                | Tickets                                                                              |
| EscalationMatrixUpdated | Escalation                                | Tickets                                                                              |
| AgentStatusUpdated      | Tickets Assigned                          | AutoAssignment                                                                       |

## Routes

1. Auth Service

| Route                                              | Purpose                                    | Verb        | Status                                 |
| -------------------------------------------------- | ------------------------------------------ | ----------- | -------------------------------------- |
| <code>/api/auth/sign-up</code>                     | Sign Up                                    | <code>POST  | $$\textcolor{green}{\text{complete}}$$ |
| <code>/api/auth/login</code>                       | Login                                      | <code>POST  | $$\textcolor{green}{\text{complete}}$$ |
| <code>/api/auth/request-reset-token</code>         | Request Password Reset Link on mail        | <code>POST  | $$\textcolor{red}{\text{incomplete}}$$ |
| <code>/api/auth//reset-password/:resetToken</code> | Resets password with the provided password | <code>PATCH | $$\textcolor{green}{\text{complete}}$$ |
| <code>/api/auth//modify-user/:userId</code>        | Modify User Role by Admin                  | <code>PATCH | $$\textcolor{green}{\text{complete}}$$ |

2. Groups Service

| Route                                       | Purpose                   | Verb        | Status                                 |
| ------------------------------------------- | ------------------------- | ----------- | -------------------------------------- |
| <code>/api/groups</code>                    | Fetch Groups              | <code>GET   | $$\textcolor{green}{\text{complete}}$$ |
| <code>/api/groups/users                     | Fetch Users               | <code>GET   | $$\textcolor{green}{\text{complete}}$$ |
| <code>/api/groups/new</code>                | Create New Group          | <code>POST  | $$\textcolor{green}{\text{complete}}$$ |
| <code>/api/groups/:groupId/add-users</code> | Add Users to a Group      | <code>PATCH | $$\textcolor{green}{\text{complete}}$$ |
| <code>/api/groups/:groupId/add-users</code> | Remove Users from a Group | <code>PATCH | $$\textcolor{green}{\text{complete}}$$ |

3. Categories Service

| Route                                  | Purpose             | Verb         | Status                                 |
| -------------------------------------- | ------------------- | ------------ | -------------------------------------- |
| <code>/api/category</code>             | Fetch Categories    | <code>GET    | $$\textcolor{green}{\text{complete}}$$ |
| <code>/api/category/new</code>         | Create New Category | <code>POST   | $$\textcolor{green}{\text{complete}}$$ |
| <code>/api/category/:categoryId</code> | Update a category   | <code>PATCH  | $$\textcolor{red}{\text{incomplete}}$$ |
| <code>/api/category/:categoryId</code> | Delete a category   | <code>DELETE | $$\textcolor{red}{\text{incomplete}}$$ |

4. Tickets Service

| Route                                       | Purpose                                      | Verb         | Status                                 |
| ------------------------------------------- | -------------------------------------------- | ------------ | -------------------------------------- |
| <code>/api/tickets</code>                   | Fetch Tickets                                | <code>GET    | $$\textcolor{green}{\text{complete}}$$ |
| <code>/api/tickets/categories</code>        | Fetch Categories                             | <code>GET    | $$\textcolor{green}{\text{complete}}$$ |
| <code>/api/tickets/new</code>               | Create New Ticket                            | <code>POST   | $$\textcolor{green}{\text{complete}}$$ |
| <code>/api/tickets/:id</code>               | Update a ticket                              | <code>PATCH  | $$\textcolor{green}{\text{complete}}$$ |
| <code>/api/tickets/reply</code>             | Reply to a ticket                            | <code>POST   | $$\textcolor{green}{\text{complete}}$$ |
| <code>/api/tickets/escalation-matrix</code> | Select default escalation matrix for tickets | <code>PATCH  | $$\textcolor{green}{\text{complete}}$$ |
| <code>/api/ticket/:id</code>                | Delete a ticket                              | <code>DELETE | $$\textcolor{red}{\text{incomplete}}$$ |

**_Ticket Auto Assignment is attached to a category, the assignment options can be either be:_**

- Yes, assign to any user.
- Yes, assign to specific users - specific users are found in the group attached to a category.
- No - Auto assigment is not perfomed in this category. Tickets are manually assigned

5. Auto Assignment Service

- Listen to ticket created event published by Tickets service.
- Run jobs periodically to assign tickets to agents based on the autoassignment configured for a category.
- Use a Round Robin Algorithm to distribute ticket assignment to agents in a circular fashion based on active status of an agent and the number of tickets currently being handled. Should not exceed allocated throttle of an agent.
- Publish TicketUpdated event to be listened to by Tickets Service.

6. Tickets Assigned Service

| Route                                          | Purpose                                     | Verb       | Status                                 |
| ---------------------------------------------- | ------------------------------------------- | ---------- | -------------------------------------- |
| <code>/api/assigned</code>                     | Fetch Tickets Assigned to all agents        | <code>GET  | $$\textcolor{red}{\text{incomplete}}$$ |
| <code>/api/assigned/:agentId</code>            | Fetch ticktets assigned to an agent         | <code>GET  | $$\textcolor{red}{\text{incomplete}}$$ |
| <code>/api/assigned/update-agent-status</code> | Update agent status from active to inactive | <code>POST | $$\textcolor{red}{\text{incomplete}}$$ |

**No routes configured here**

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

## Manual Acceptance Testing

- Sign up (should be via a magic link on mail - default account is admin on sign up ) to settle for POSTMAN for now.
- Check if event was publsihed to create a new user in Group Service.
- This admin account should be able to add more users into the system ( default password - 123456, should be changed on login).
- Users with Agent roles when added by this admin, Auth Service publishes UserCreatedEvent, which is listened to by Groups Service.
- Create a new group - (add users to this group from the duplicated DB found in groups service).
- Create / Update group emit a GroupCreated / GroupUpdated event to Category Service.
- Create / Update a category (CategoryCreated / CategoryUpdated event(s)) to be emmitted to tickets service.

## FUTURE IMPLEMENTATION

- Ticket Followers - Add more agents to a ticket. They should also be able to follow and resolve this ticket.
- Role Based Access Control.
- Manual assignment of tickets to agents - create a pool of users who are responsible for this.
- Bulk assign tickets to agents.
- Rating system for agents.
- Add templates for creating and responding to tickets based on the category.

## License

#### Copyright (c) 2022 Shadrack Adwera

#### Licenced under the [MIT License](LICENCE)
