# 🤖 Agent Coordination System - WinMarket V2

**System Version:** 1.0
**Last Update:** 30 Mai 2026
**PM Agent:** Active and Coordinating

---

## 🎭 Agent Registry & Capabilities

### **🏗️ Infrastructure Agent**
```yaml
agent_id: infrastructure-agent
specialties:
  - Docker & Docker Compose
  - Kubernetes deployment
  - CI/CD pipelines (GitHub Actions)
  - Monitoring & logging (Prometheus, Grafana)
  - Cloud infrastructure (AWS, GCP)
tools:
  - Dockerfile, docker-compose.yml
  - Kubernetes manifests
  - Terraform/Pulumi
  - GitHub Actions workflows
primary_sprints: [1, 17, 18]
secondary_sprints: [4, 16]
current_status: available
capacity: 100%
```

### **🗄️ Database Agent**
```yaml
agent_id: database-agent
specialties:
  - Drizzle ORM & PostgreSQL
  - Database schema design
  - Migrations & seeding
  - Query optimization
  - Database performance tuning
tools:
  - drizzle-orm, drizzle-kit
  - PostgreSQL, pgAdmin
  - Database migration scripts
  - Performance profiling tools
primary_sprints: [2, 3]
secondary_sprints: [16]
current_status: available
capacity: 100%
```

### **⚙️ Backend Agent**
```yaml
agent_id: backend-agent
specialties:
  - GraphQL API design
  - Apollo Server
  - Business logic implementation
  - Authentication & authorization
  - API security
tools:
  - Apollo Server, GraphQL
  - Better Auth
  - Zod validation
  - GraphQL Shield
primary_sprints: [2, 3, 4, 5, 6, 7, 8]
secondary_sprints: [13, 14, 15, 16]
current_status: available
capacity: 100%
```

### **🌐 Frontend Agent**
```yaml
agent_id: frontend-agent
specialties:
  - Next.js & React
  - TailwindCSS styling
  - Apollo Client
  - Responsive design
  - UI/UX implementation
tools:
  - Next.js, React
  - TailwindCSS
  - Apollo Client
  - Storybook
primary_sprints: [9, 10, 12]
secondary_sprints: [13, 15]
current_status: available
capacity: 100%
```

### **📱 Mobile Agent**
```yaml
agent_id: mobile-agent
specialties:
  - React Native & Expo
  - EAS deployment
  - Tamagui UI
  - Mobile navigation
  - Push notifications
tools:
  - Expo, EAS
  - React Native
  - Tamagui
  - Expo Router
primary_sprints: [11, 12]
secondary_sprints: [14]
current_status: available
capacity: 100%
```

### **🧪 Test Agent**
```yaml
agent_id: test-agent
specialties:
  - Unit & integration testing
  - E2E testing (Playwright)
  - Test automation
  - Quality assurance
  - Performance testing
tools:
  - Jest, Playwright
  - Testing Library
  - Cypress (if needed)
  - Load testing tools
primary_sprints: [4, 8, 12, 16]
secondary_sprints: [all sprints]
current_status: available
capacity: 100%
```

### **🚀 DevOps Agent**
```yaml
agent_id: devops-agent
specialties:
  - Production deployment
  - Monitoring & alerting
  - Performance optimization
  - Security hardening
  - Incident response
tools:
  - Kubernetes, Helm
  - DataDog, New Relic
  - Security scanners
  - Performance profilers
primary_sprints: [16, 17, 18]
secondary_sprints: [1, 4]
current_status: available
capacity: 100%
```

---

## 📋 Task Assignment Logic

### **Automatic Assignment Rules**

#### **1. Technology-Based Assignment**
```python
def assign_by_technology(task):
    tech_mapping = {
        # Infrastructure
        'docker': 'infrastructure-agent',
        'kubernetes': 'infrastructure-agent',
        'ci-cd': 'infrastructure-agent',

        # Database
        'drizzle': 'database-agent',
        'postgresql': 'database-agent',
        'migration': 'database-agent',

        # Backend
        'graphql': 'backend-agent',
        'apollo': 'backend-agent',
        'auth': 'backend-agent',

        # Frontend
        'nextjs': 'frontend-agent',
        'react': 'frontend-agent',
        'tailwind': 'frontend-agent',

        # Mobile
        'expo': 'mobile-agent',
        'react-native': 'mobile-agent',
        'tamagui': 'mobile-agent',

        # Testing
        'jest': 'test-agent',
        'playwright': 'test-agent',
        'testing': 'test-agent',

        # DevOps
        'deployment': 'devops-agent',
        'monitoring': 'devops-agent',
        'performance': 'devops-agent'
    }

    for tech, agent in tech_mapping.items():
        if tech in task.tags or tech in task.description.lower():
            return agent

    return 'backend-agent'  # Default fallback
```

#### **2. Sprint-Based Assignment**
```python
def assign_by_sprint(sprint_number):
    sprint_mapping = {
        1: ['infrastructure-agent', 'devops-agent'],
        2: ['database-agent', 'backend-agent'],
        3: ['backend-agent', 'database-agent'],
        4: ['backend-agent', 'test-agent'],
        5: ['backend-agent'],
        6: ['backend-agent'],
        7: ['backend-agent'],
        8: ['backend-agent', 'test-agent'],
        9: ['frontend-agent'],
        10: ['frontend-agent'],
        11: ['mobile-agent'],
        12: ['frontend-agent', 'mobile-agent', 'test-agent'],
        13: ['backend-agent', 'frontend-agent'],
        14: ['backend-agent', 'mobile-agent'],
        15: ['backend-agent', 'frontend-agent'],
        16: ['devops-agent', 'test-agent', 'database-agent'],
        17: ['devops-agent', 'infrastructure-agent'],
        18: ['devops-agent', 'infrastructure-agent', 'test-agent']
    }

    return sprint_mapping.get(sprint_number, ['backend-agent'])
```

#### **3. Workload Balancing**
```python
def balance_workload(agents_list, task):
    # Check current capacity of each agent
    available_agents = [
        agent for agent in agents_list
        if get_agent_capacity(agent) > 0.8  # Less than 80% loaded
    ]

    if not available_agents:
        # All agents busy, assign to least loaded
        return min(agents_list, key=get_agent_load)

    # Among available agents, pick by expertise match
    return max(available_agents, key=lambda a: get_expertise_match(a, task))
```

### **Assignment Decision Matrix**

#### **High Priority Tasks (Sprint Blockers)**
1. **Infrastructure setup blocking** → Infrastructure Agent (immediate)
2. **Database schema needed** → Database Agent (immediate)
3. **API endpoint required** → Backend Agent (immediate)
4. **Critical bug in production** → DevOps Agent + relevant specialist

#### **Standard Task Flow**
```
Task Created → PM Agent Analysis → Auto-Assignment → Agent Acceptance → Execution
```

#### **Complex Task Splitting**
```markdown
### Complex Task: "Complete User Authentication System"

**Split into sub-tasks:**
1. Database schema (users, sessions) → Database Agent
2. GraphQL resolvers & mutations → Backend Agent
3. Security middleware → Backend Agent
4. Frontend login forms → Frontend Agent
5. Mobile auth screens → Mobile Agent
6. E2E authentication tests → Test Agent

**Dependencies:**
1 → 2 → 3 → (4, 5) → 6

**Coordination:**
PM Agent orchestrates handoffs between agents
```

---

## 🔄 Agent Communication Protocols

### **Task Handoff Protocol**

#### **1. Task Assignment Message**
```markdown
🎯 **TASK ASSIGNMENT**

**To:** @[agent-name]
**From:** @pm-agent
**Sprint:** [sprint-number]
**Priority:** High/Medium/Low
**Estimated Effort:** [hours/story-points]

### Task Description
[Detailed description with acceptance criteria]

### Technical Context
- **Repository:** /path/to/code
- **Branch:** feature/[branch-name]
- **Dependencies:** [list of blocking tasks/PRs]
- **Related Issues:** #123, #456

### Definition of Done
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Tests written and passing
- [ ] Code reviewed
- [ ] Documentation updated

### Resources
- **Documentation:** [links]
- **Examples:** [links]
- **Stakeholder:** [contact info]

**Due Date:** [date]
**Accept/Decline by:** [date]
```

#### **2. Agent Response Protocol**
```markdown
📝 **TASK RESPONSE**

**Task:** [task-id]
**Agent:** @[agent-name]
**Status:** ACCEPTED/DECLINED/NEEDS_CLARIFICATION

### If ACCEPTED:
- **Estimated Completion:** [date]
- **Confidence Level:** High/Medium/Low
- **Resource Needs:** [any additional resources needed]

### If DECLINED:
- **Reason:** [workload/expertise mismatch/other]
- **Alternative:** [suggest another agent or timing]

### If NEEDS_CLARIFICATION:
- **Questions:** [list of specific questions]
- **Blocking Issues:** [list of blockers]
```

#### **3. Progress Updates Protocol**
```markdown
📊 **PROGRESS UPDATE**

**Task:** [task-id]
**Agent:** @[agent-name]
**Date:** [date]

### Completed Work
- [✅] Sub-task 1
- [✅] Sub-task 2

### In Progress
- [🔄] Sub-task 3 (60% complete, ETA: [date])

### Blockers
- [🚫] Sub-task 4 blocked by: [description]
  - **Impact:** [description]
  - **Resolution:** [suggested action]

### Next Steps
- [ ] Will complete sub-task 3
- [ ] Will start sub-task 5

### Risk Assessment
🟢 On track / 🟡 Minor risk / 🔴 Major risk
**Details:** [if not green, explain]
```

### **Daily Standup Format**
```markdown
🏃 **DAILY STANDUP** - [Date]

### What I completed yesterday:
- [✅] [Task/subtask completed]
- [✅] [Task/subtask completed]

### What I'm working on today:
- [🔄] [Current task with expected completion]
- [🆕] [New task starting]

### Blockers/Help needed:
- [🚫] [Blocker description] - Need: [specific help]
- [❓] [Question/clarification needed]

### ETA Updates:
- [Task X]: Originally [date], now [new date] due to [reason]

**Overall Status:** 🟢 On track / 🟡 Minor issues / 🔴 Needs attention
```

---

## 🎯 Sprint Coordination Workflows

### **Sprint Start Ceremony**

#### **1. PM Agent Preparation (Day -1)**
```markdown
📋 **SPRINT [X] PREPARATION**

### Sprint Goal
[Clear, measurable goal for the sprint]

### Capacity Planning
- Total story points available: [X]
- Committed story points: [Y]
- Buffer for unknowns: [Z]%

### Agent Assignments
| Agent | Primary Tasks | Secondary Tasks | Load % |
|-------|---------------|-----------------|--------|
| Infrastructure | Task A, B | - | 80% |
| Database | Task C | Task D | 60% |
| Backend | Task E, F, G | - | 90% |

### Dependencies & Risks
- [🔗] Task A must complete before Task C
- [⚠️] External API integration may delay Task E

### Success Criteria
- [ ] All primary tasks completed
- [ ] No critical bugs introduced
- [ ] Test coverage maintained >70%
```

#### **2. Sprint Kickoff (Day 1)**
```markdown
🚀 **SPRINT [X] KICKOFF**

**Participants:** All assigned agents
**Duration:** 30 minutes max

### Agenda
1. **Sprint Goal Review** (5 min)
2. **Task Assignment Confirmation** (10 min)
3. **Dependency Discussion** (10 min)
4. **Questions & Clarifications** (5 min)

### Agent Commitments
- @infrastructure-agent: Confirms capacity and Task A completion by Day 3
- @database-agent: Confirms Task C dependency on Task A
- @backend-agent: Identifies potential risk in Task E

### Communication Plan
- Daily async standups
- Mid-sprint sync on Day 7
- Immediate escalation for critical blockers

### Next Steps
- All agents update task status by EOD
- First progress report due Day 2
```

### **Mid-Sprint Synchronization (Day 7)**

```markdown
🔄 **MID-SPRINT SYNC** - Sprint [X]

### Progress Overview
**Completed:** 3/8 tasks (37.5%)
**In Progress:** 3/8 tasks
**Blocked:** 1/8 tasks
**Not Started:** 1/8 tasks

### Individual Agent Status
#### @infrastructure-agent
- ✅ Task A: Completed (on time)
- 🔄 Task B: 70% complete, on track for Day 10

#### @database-agent
- ✅ Task C: Completed (dependency resolved)
- 📅 Task D: Starting today, estimated completion Day 12

#### @backend-agent
- 🔄 Task E: 40% complete, external API issues causing delay
- 🚫 Task F: Blocked by Task E
- 📅 Task G: Will start after Task F unblocked

### Issues & Actions
1. **Task E API Integration Delay**
   - **Impact:** 2-day delay affecting Task F
   - **Action:** @pm-agent escalating with vendor
   - **Mitigation:** Consider mock API for parallel development

2. **Resource Constraint**
   - **Issue:** @backend-agent overloaded
   - **Action:** @frontend-agent to assist with Task G if needed

### Sprint Goal Assessment
🟡 **AT RISK** - May need scope adjustment if API issue persists

### Decisions Made
- Task F will use mock API if vendor issue not resolved by Day 9
- Task G moved to secondary priority
- Additional check-in scheduled for Day 9
```

### **Sprint Completion & Handoff**

```markdown
🏁 **SPRINT [X] COMPLETION**

### Final Results
**Completed:** 7/8 tasks (87.5%)
**Incomplete:** 1/8 tasks (moved to next sprint)
**Quality:** All tests passing, 75% coverage

### Agent Performance
| Agent | Committed | Completed | Notes |
|-------|-----------|-----------|--------|
| Infrastructure | 2 tasks | 2 tasks | ✅ On time, excellent quality |
| Database | 2 tasks | 2 tasks | ✅ On time, good documentation |
| Backend | 4 tasks | 3 tasks | 🟡 API delay affected one task |

### Handoff to Next Sprint
1. **Task F (incomplete)** → Sprint [X+1] with priority boost
2. **API integration** → Working solution available
3. **Technical debt** → 2 items identified for future sprints

### Lessons Learned
- ✅ Early dependency identification worked well
- ⚠️ Need better vendor communication
- 📝 Mock API strategy helped maintain progress

### Sprint Retrospective Actions
- [ ] Implement vendor escalation process
- [ ] Create mock API template for future use
- [ ] Improve initial estimation for external dependencies
```

---

## 🔧 Agent Management Commands

### **PM Agent Control Commands**

#### **Assignment & Coordination**
```bash
# Assign task to specific agent
@pm-agent assign-task [task-id] @[agent-name]

# Auto-assign task based on rules
@pm-agent auto-assign [task-id]

# Reassign task to different agent
@pm-agent reassign [task-id] @[new-agent] --reason="[reason]"

# Check agent capacity
@pm-agent agent-capacity @[agent-name]

# Get best agent for task
@pm-agent suggest-agent [task-description]
```

#### **Sprint Management**
```bash
# Start new sprint
@pm-agent start-sprint [sprint-number]

# Add task to current sprint
@pm-agent add-to-sprint [task-id]

# Remove task from sprint
@pm-agent remove-from-sprint [task-id] --reason="[reason]"

# Sprint status check
@pm-agent sprint-status

# Mid-sprint review
@pm-agent mid-sprint-review
```

#### **Monitoring & Reporting**
```bash
# Check all agents status
@pm-agent agents-status

# Get productivity report
@pm-agent productivity-report [timeframe]

# Check for blockers
@pm-agent check-blockers

# Escalate issue
@pm-agent escalate [issue-description] --priority=high
```

### **Agent Response Commands**

#### **Task Management**
```bash
# Accept assigned task
@[agent-name] accept-task [task-id]

# Decline task with reason
@[agent-name] decline-task [task-id] --reason="[reason]"

# Request clarification
@[agent-name] clarify-task [task-id] --questions="[questions]"

# Update task progress
@[agent-name] update-progress [task-id] --percentage=60 --eta="2 days"

# Mark task complete
@[agent-name] complete-task [task-id]

# Report blocker
@[agent-name] report-blocker [task-id] --description="[blocker details]"
```

#### **Status & Communication**
```bash
# Daily standup update
@[agent-name] daily-standup

# Request help from another agent
@[agent-name] request-help @[helper-agent] [description]

# Offer help to another agent
@[agent-name] offer-help @[target-agent] [availability]

# Update availability
@[agent-name] set-availability [percentage] [duration]
```

---

## 📊 Performance Metrics & KPIs

### **Agent Performance Tracking**
```yaml
metrics:
  task_completion_rate:
    formula: completed_tasks / assigned_tasks * 100
    target: ">= 90%"

  average_task_cycle_time:
    formula: sum(task_completion_times) / completed_tasks
    target: "<= sprint_estimate * 1.2"

  quality_score:
    formula: (tests_passing + code_review_score + documentation_score) / 3
    target: ">= 8/10"

  blocker_resolution_time:
    formula: average_time_to_resolve_blockers
    target: "<= 4 hours"
```

### **Team Coordination Metrics**
```yaml
coordination_metrics:
  handoff_efficiency:
    formula: successful_handoffs / total_handoffs * 100
    target: ">= 95%"

  communication_response_time:
    formula: average_response_time_to_mentions
    target: "<= 2 hours"

  dependency_prediction_accuracy:
    formula: correctly_predicted_dependencies / total_dependencies * 100
    target: ">= 80%"

  sprint_goal_achievement:
    formula: sprints_meeting_goal / total_sprints * 100
    target: ">= 85%"
```

---

**🎯 Status:** Agent Coordination System Ready for Production Use
**Next Step:** Activate PM Agent for Sprint 1 coordination starting June 1st, 2026