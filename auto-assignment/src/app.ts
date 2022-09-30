// run jobs to check for active tickets
// check auto assignment logic - if assign to specific users or assign to any agent
// found tickets are pushed to a priority queue using the priority status and time created (earliest CRITICAL tickets take first priority)
// fetch agents based on active status and not exceeded the threshold
// POP from the queue - LIFO and and assign an agent - least recently assigned
// Update time assigned for this agent
// REPEAT PROCESS
