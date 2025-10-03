export type ActivityAudience = "all" | "admin";

export interface ActivityEntry {
  id: string;
  user: {
    name: string;
    initials: string;
    avatar: string | null;
    role: string;
  };
  action: string;
  target: string;
  context: string;
  time: string;
  type: string;
  details: string;
  audience?: ActivityAudience;
}

export interface ActivitySection {
  id: string;
  label: string;
  entries: ActivityEntry[];
}

export const activityTimeline: ActivitySection[] = [
  {
    id: "today",
    label: "Today",
    entries: [
      {
        id: "activity-1",
        user: { name: "Sarah Johnson", initials: "SJ", avatar: null, role: "Product Marketing" },
        action: "created task",
        target: "Launch announcement brief",
        context: "Go-to-market plan",
        time: "12 minutes ago",
        type: "Task",
        details: "Set due date for Oct 12 and assigned to launch squad",
      },
      {
        id: "activity-2",
        user: { name: "Mike Chen", initials: "MC", avatar: null, role: "Client Success" },
        action: "uploaded file",
        target: "Q4 client review deck.pdf",
        context: "Client Success > Q4 Reviews",
        time: "27 minutes ago",
        type: "File",
        details: "Version 3.1 added with updated revenue forecasts",
      },
      {
        id: "activity-3",
        user: { name: "Emma Davis", initials: "ED", avatar: null, role: "Talent" },
        action: "created candidate profile",
        target: "Alex Morgan",
        context: "Marketing Manager Hiring",
        time: "49 minutes ago",
        type: "People",
        details: "Imported from Lever and scheduled first round interview",
      },
      {
        id: "activity-8",
        user: { name: "System", initials: "SYS", avatar: null, role: "Security" },
        action: "escalated access review",
        target: "Financial workspace",
        context: "Compliance",
        time: "Today • 7:18 AM",
        type: "Security",
        details: "Flagged unapproved export attempt by user carol@native.local",
        audience: "admin",
      },
    ],
  },
  {
    id: "yesterday",
    label: "Yesterday",
    entries: [
      {
        id: "activity-4",
        user: { name: "Alex Wilson", initials: "AW", avatar: null, role: "Product" },
        action: "published document",
        target: "Native roadmap v2.4",
        context: "Product Strategy",
        time: "Yesterday • 4:32 PM",
        type: "Document",
        details: "Shared with Leadership workspace and enabled change tracking",
      },
      {
        id: "activity-5",
        user: { name: "Lisa Brown", initials: "LB", avatar: null, role: "Finance" },
        action: "created approval workflow",
        target: "FY25 budget revisions",
        context: "Finance > Planning",
        time: "Yesterday • 11:18 AM",
        type: "Workflow",
        details: "Added approvers: Sarah Johnson, Mike Chen",
      },
      {
        id: "activity-9",
        user: { name: "System", initials: "SYS", avatar: null, role: "Security" },
        action: "revoked session",
        target: "Inactive admin account",
        context: "Identity",
        time: "Yesterday • 6:12 AM",
        type: "Security",
        details: "Forced sign out for account inactivity exceeding policy",
        audience: "admin",
      },
    ],
  },
  {
    id: "week",
    label: "Earlier this week",
    entries: [
      {
        id: "activity-6",
        user: { name: "Priya Patel", initials: "PP", avatar: null, role: "Operations" },
        action: "moved project stage",
        target: "Enterprise onboarding",
        context: "Projects",
        time: "Monday • 9:02 AM",
        type: "Project",
        details: "Advanced from Discovery to Planning after client approval",
      },
      {
        id: "activity-7",
        user: { name: "Diego Martínez", initials: "DM", avatar: null, role: "Engineering" },
        action: "created incident report",
        target: "API latency spike",
        context: "Statuspage",
        time: "Monday • 7:46 AM",
        type: "Incident",
        details: "Documented mitigation steps and assigned follow-up tasks",
      },
      {
        id: "activity-10",
        user: { name: "Compliance Bot", initials: "CB", avatar: null, role: "Automation" },
        action: "generated export log",
        target: "All workspace downloads",
        context: "Audit trail",
        time: "Sunday • 9:30 PM",
        type: "Audit",
        details: "Compiled 42 file access events for weekly compliance review",
        audience: "admin",
      },
    ],
  },
];
