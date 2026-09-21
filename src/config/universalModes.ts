import type { UniversalMode } from '../types';

export interface ModePreset {
  label: string;
  sector: string;
  topology: 'Centralized' | 'Decentralized' | 'Hybrid' | 'Independent';
  text: string;
  description: string;
}

export interface UniversalModeDefinition {
  id: UniversalMode;
  name: string;
  shortLabel: string;
  categoryTitle: string;
  description: string;
  badge: string;
  iconName: string;
  theme: {
    accent: string;
    accentGlow: string;
    accentBorder: string;
    badgeBg: string;
    badgeText: string;
    bgGradient: string;
  };
  contextPrompt: string;
  defaultSectors: string[];
  presets: ModePreset[];
}

export const UNIVERSAL_MODES: Record<UniversalMode, UniversalModeDefinition> = {
  everyday: {
    id: 'everyday',
    name: 'Everyday User',
    shortLabel: 'Everyday',
    categoryTitle: 'Personal, Home & Daily Tasks',
    description: 'Designed for personal projects, daily planning, learning, and simple questions. Clear, friendly, and jargon-free.',
    badge: 'UNIVERSAL / EVERYDAY',
    iconName: 'User',
    theme: {
      accent: '#3b82f6',
      accentGlow: 'rgba(59, 130, 246, 0.3)',
      accentBorder: 'border-blue-500/40',
      badgeBg: 'bg-blue-500/10',
      badgeText: 'text-blue-400',
      bgGradient: 'from-blue-950/20 via-zinc-950 to-zinc-950',
    },
    contextPrompt: `AUDIENCE & REGISTER: Everyday User (Personal, Home, Student, General).
- Communicate with friendly, approachable clarity.
- Ban heavy bureaucratic or corporate jargon; speak in plain, engaging English.
- For basic questions and everyday requests, give immediate, step-by-step helpful answers.
- Organize answers logically with helpful tips without overwhelming technical telemetry unless requested.`,
    defaultSectors: [
      'Personal Productivity',
      'Learning & Education',
      'Home & Family',
      'Creative Writing & Ideas',
      'Personal Finance & Budgeting',
      'Health & Wellness',
      'Travel & Leisure',
      'Technology & Gadgets'
    ],
    presets: [
      {
        label: 'Weekly Meal & Grocery Planner',
        sector: 'Home & Family',
        topology: 'Centralized',
        description: 'Nutritious family dinners under a set budget with a categorized shopping list.',
        text: 'Create a 7-day balanced dinner meal plan for a family of four with quick 30-minute recipes and a consolidated grocery shopping checklist sorted by supermarket aisle.'
      },
      {
        label: 'Personal Budget & Subscription Audit',
        sector: 'Personal Finance & Budgeting',
        topology: 'Hybrid',
        description: 'Identify recurring fees and optimize monthly savings with high yield targets.',
        text: 'Analyze monthly recurring expenses, identify hidden subscription creep, and propose an achievable 50/30/20 budget framework with a 6-month emergency fund goal.'
      },
      {
        label: 'Explain Complex Topic Simply',
        sector: 'Learning & Education',
        topology: 'Independent',
        description: 'Break down complex concepts into crystal-clear analogies anyone can understand.',
        text: 'Explain how Large Language Models and AI agents work using the analogy of a master research library and apprentice scribes. Keep it engaging, accurate, and completely free of jargon.'
      },
      {
        label: 'Polite Tenant Maintenance Request',
        sector: 'Personal Productivity',
        topology: 'Centralized',
        description: 'Professional and courteous communication to resolve property maintenance.',
        text: 'Draft a polite but firm formal email to a residential property manager requesting emergency repair of a leaking under-sink pipe that began this morning.'
      }
    ]
  },

  small_business: {
    id: 'small_business',
    name: 'Small Business',
    shortLabel: 'Business',
    categoryTitle: 'Founders, SMBs & Lean Operations',
    description: 'Tailored for entrepreneurs, small agencies, and shops. Pragmatic, ROI-driven, and focused on growth and operations.',
    badge: 'COMMERCIAL / SMB',
    iconName: 'Store',
    theme: {
      accent: '#10b981',
      accentGlow: 'rgba(16, 185, 129, 0.3)',
      accentBorder: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-500/10',
      badgeText: 'text-emerald-400',
      bgGradient: 'from-emerald-950/20 via-zinc-950 to-zinc-950',
    },
    contextPrompt: `AUDIENCE & REGISTER: Small Business Owner / Founder / Lean Operations Team.
- Deliver pragmatic, high-ROI solutions that save time and conserve capital.
- Focus on customer delight, cash flow health, conversion rates, and lean automation.
- Deliver ready-to-use artifacts: draft emails, spreadsheet structures, outreach plans, and executable scripts.
- Avoid enterprise bureaucracy while maintaining professional business discipline.`,
    defaultSectors: [
      'Marketing & Customer Acquisition',
      'Cash Flow & Bookkeeping',
      'Inventory & Order Fulfillment',
      'Customer Service & Retention',
      'Team & Freelancer Coordination',
      'Pricing Strategy & Margins',
      'E-Commerce Operations',
      'Business Legal & Permits'
    ],
    presets: [
      {
        label: '30-Day Customer Win-Back Campaign',
        sector: 'Marketing & Customer Acquisition',
        topology: 'Hybrid',
        description: 'Multi-touch email sequence with incentives to re-engage dormant buyers.',
        text: 'Design a 3-part email reactivation sequence for past customers who haven\'t purchased in 90 days, including compelling subject lines, value propositions, and limited-time discount incentives.'
      },
      {
        label: 'SaaS / Service Tier Pricing Model',
        sector: 'Pricing Strategy & Margins',
        topology: 'Decentralized',
        description: 'Calculate unit economics, gross margins, and tier differentiation.',
        text: 'Structure a 3-tier pricing strategy (Starter, Professional, Agency) for a digital marketing service with margin analysis, feature gating, and annual billing discount incentives.'
      },
      {
        label: 'Warehouse & Shipping RFP Template',
        sector: 'Inventory & Order Fulfillment',
        topology: 'Centralized',
        description: 'Vendor specification to negotiate competitive 3PL fulfillment rates.',
        text: 'Draft a concise Request for Proposal (RFP) to submit to third-party logistics (3PL) providers for handling 2,500 monthly parcel shipments with 2-day delivery SLAs.'
      },
      {
        label: 'Automated Invoice Reconciliation Flow',
        sector: 'Cash Flow & Bookkeeping',
        topology: 'Hybrid',
        description: 'Workflow and Python script to catch unpaid invoices and flag overdue accounts.',
        text: 'Synthesize an automated accounts receivable workflow that reconciles incoming payments against outstanding customer invoices and drafts polite staged reminder notices at 7, 14, and 30 days overdue.'
      }
    ]
  },

  enterprise: {
    id: 'enterprise',
    name: 'Major Corporation',
    shortLabel: 'Enterprise',
    categoryTitle: 'Enterprise Scale, Multi-Team & Strategy',
    description: 'Engineered for corporate executives, department directors, and cross-functional teams. Focuses on high-level synthesis and risk management.',
    badge: 'ENTERPRISE / SCALE',
    iconName: 'Building2',
    theme: {
      accent: '#2563eb',
      accentGlow: 'rgba(37, 99, 235, 0.35)',
      accentBorder: 'border-blue-600/50',
      badgeBg: 'bg-blue-600/15',
      badgeText: 'text-blue-300',
      bgGradient: 'from-blue-950/25 via-zinc-950 to-zinc-950',
    },
    contextPrompt: `AUDIENCE & REGISTER: Major Corporation / Enterprise Leader / Cross-Functional Steering Committee.
- Deliver strategic synthesis, cross-department governance, and executive debriefs.
- Address system-level architecture, SLA monitoring, compliance frameworks (SOC2, ISO 27001), and financial implications.
- In multi-branch delegations, explicitly synthesize subordinate findings into concise executive decisions with clear risk trade-offs.
- Balance forward-looking innovation with risk mitigation and corporate stability.`,
    defaultSectors: [
      'Enterprise FinOps & Cloud Strategy',
      'Cybersecurity & Risk Management',
      'Cross-Functional Operations',
      'Global Supply Chain Resilience',
      'Corporate Governance & Audit',
      'Talent & Organizational Scale',
      'Mergers, Acquisitions & Integration',
      'Data Architecture & Analytics'
    ],
    presets: [
      {
        label: 'Multi-Cloud FinOps Spend Optimization',
        sector: 'Enterprise FinOps & Cloud Strategy',
        topology: 'Hybrid',
        description: 'Audit cross-department AWS, Azure, and GCP workloads for 22% cost savings.',
        text: 'Synthesize an enterprise FinOps audit across 14 engineering departments, analyzing unreserved compute instances, idle Kubernetes clusters, and egress bandwidth to achieve a $1.8M annualized cost reduction.'
      },
      {
        label: 'Cyber Incident Escalation Matrix',
        sector: 'Cybersecurity & Risk Management',
        topology: 'Centralized',
        description: 'Establish clear decision gates, PR response triggers, and C-suite notifications.',
        text: 'Formulate an enterprise-wide Sev-1 cyber incident escalation playbook detailing decision gates between the SOC, General Counsel, CISO, and external forensic breach response teams.'
      },
      {
        label: 'Global Supply Chain Single-Point Audit',
        sector: 'Global Supply Chain Resilience',
        topology: 'Decentralized',
        description: 'Assess tier-1 and tier-2 vendor bottlenecks across Asia-Pacific and EU corridors.',
        text: 'Evaluate single-points-of-failure across our semiconductor supply chain, modeling dual-sourcing contingencies and buffer inventory targets across North American and European assembly hubs.'
      },
      {
        label: 'Enterprise Zero-Trust IAM Federation',
        sector: 'Cybersecurity & Risk Management',
        topology: 'Hybrid',
        description: 'Consolidate identity providers across 8 merged corporate subsidiaries.',
        text: 'Architect an enterprise identity federation migration roadmap uniting three disparate Okta and Active Directory tenants into a unified Zero-Trust IAM architecture with hardware MFA tokens.'
      }
    ]
  },

  local_gov: {
    id: 'local_gov',
    name: 'Local Government',
    shortLabel: 'Local Gov',
    categoryTitle: 'Municipal Services & Civic Transparency',
    description: 'Built for city managers, municipal departments, and civic leaders. Public-service delivery, open records, and community impact.',
    badge: 'MUNICIPAL / CIVIC',
    iconName: 'Landmark',
    theme: {
      accent: '#0284c7',
      accentGlow: 'rgba(2, 132, 199, 0.3)',
      accentBorder: 'border-sky-500/40',
      badgeBg: 'bg-sky-500/10',
      badgeText: 'text-sky-300',
      bgGradient: 'from-sky-950/20 via-zinc-950 to-zinc-950',
    },
    contextPrompt: `AUDIENCE & REGISTER: Local Government Official / Municipal Department / Civic Administrator.
- Ground all output in public welfare, community transparency, and civic accessibility.
- Adhere to municipal standards: public comment periods, open meeting laws, non-partisan clarity, and clear constituent notices.
- Formulate practical public notices, zoning briefs, budget allocations, and service routing guidelines.
- Write in language accessible to all community members regardless of background.`,
    defaultSectors: [
      'Public Works & Infrastructure',
      'Parks, Recreation & Community',
      'Municipal Permitting & Zoning',
      'Civic Safety & Local Emergency',
      'Public Health & Sanitation',
      'City Council & Ordinances',
      'Constituent 311 Services',
      'Municipal Grants & Fiscal Planning'
    ],
    presets: [
      {
        label: 'Downtown Street Resurfacing Notice',
        sector: 'Public Works & Infrastructure',
        topology: 'Centralized',
        description: 'Citizen notice detailing detours, bus reroutes, and local business access.',
        text: 'Draft a comprehensive, clear municipal public notice regarding the upcoming 3-week Main Street asphalt resurfacing project, outlining phase schedules, emergency vehicle access, and business parking allowances.'
      },
      {
        label: 'Citizen Feedback on Park Ordinance',
        sector: 'Parks, Recreation & Community',
        topology: 'Hybrid',
        description: 'Synthesize 450 public survey responses into council recommendations.',
        text: 'Synthesize public comments collected during the community survey on the proposed civic park dog run expansion and off-leash hours ordinance, summarizing core constituent concerns and actionable compromises.'
      },
      {
        label: 'Federal Clean Water Grant Proposal',
        sector: 'Municipal Grants & Fiscal Planning',
        topology: 'Decentralized',
        description: 'Grant application for replacing aging municipal storm drainage culverts.',
        text: 'Prepare a municipal grant application project narrative and timeline for EPA Clean Water State Revolving Funds to upgrade stormwater retention basins in the historic district.'
      },
      {
        label: '311 Constituent Service Routing Guide',
        sector: 'Constituent 311 Services',
        topology: 'Hybrid',
        description: 'Standard operating procedures for triaging non-emergency resident requests.',
        text: 'Develop a municipal 311 intake and dispatch matrix that classifies resident reports (potholes, streetlights, graffiti, tree trimming) with target resolution SLAs and automated resident SMS updates.'
      }
    ]
  },

  federal: {
    id: 'federal',
    name: 'Federal Agency',
    shortLabel: 'Federal',
    categoryTitle: 'National Missions & Zero-Trust Governance',
    description: 'Designed for federal departments, defense analysts, and statutory auditors. Statutory rigor, NIST compliance, and provenance tracking.',
    badge: 'FEDERAL / STATUTORY',
    iconName: 'ShieldAlert',
    theme: {
      accent: '#f59e0b',
      accentGlow: 'rgba(245, 158, 11, 0.35)',
      accentBorder: 'border-amber-500/50',
      badgeBg: 'bg-amber-500/10',
      badgeText: 'text-amber-400',
      bgGradient: 'from-amber-950/25 via-zinc-950 to-zinc-950',
    },
    contextPrompt: `AUDIENCE & REGISTER: Federal Agency Official / Defense Analyst / Statutory Compliance Officer.
- Strict procedural precision, statutory grounding (FAR, FISMA, NIST SP 800-53), and zero-trust provenance.
- State certainty declarations explicitly with zero reflexive hedging or conversational padding.
- Emphasize fail-closed validation, immutable audit trails, and strict data boundary enforcement.
- Provide comprehensive statutory citations and clear distinction between empirical evidence and calculated projections.`,
    defaultSectors: [
      'Defense & National Aerospace',
      'Intelligence Analysis & Signals',
      'Federal Statutory Compliance & FAR',
      'Critical Infrastructure (CISA/SCADA)',
      'Federal Public Health (CDC/FDA)',
      'Emergency Response & FEMA',
      'Appropriations & Federal Budget',
      'Inter-Agency Interoperability'
    ],
    presets: [
      {
        label: 'NIST SP 800-53 Rev 5 Control Audit',
        sector: 'Critical Infrastructure (CISA/SCADA)',
        topology: 'Centralized',
        description: 'Verify Moderate-impact cloud workload against access and audit controls.',
        text: 'Conduct a formal compliance review of a hybrid cloud workload against NIST SP 800-53 Rev 5 AC-2 (Account Management) and AU-6 (Audit Review, Analysis, and Reporting) controls.'
      },
      {
        label: 'Inter-Agency Data Sharing Agreement',
        sector: 'Federal Statutory Compliance & FAR',
        topology: 'Hybrid',
        description: 'Draft a Memorandum of Understanding for cross-agency telemetry exchange.',
        text: 'Draft the statutory and privacy provisions for an inter-agency Memorandum of Understanding (MOU) governing the automated real-time sharing of satellite environmental sensor data under Privacy Act guidelines.'
      },
      {
        label: 'SCADA Telemetry Network Isolation Protocol',
        sector: 'Defense & National Aerospace',
        topology: 'Decentralized',
        description: 'Protocol to sever external ingress while preserving emergency telemetry.',
        text: 'Synthesize a fail-closed emergency isolation protocol for operational technology (OT) SCADA networks controlling critical water treatment infrastructure during an active APT intrusion vector.'
      },
      {
        label: 'FAR Part 15 Sole-Source Justification',
        sector: 'Appropriations & Federal Budget',
        topology: 'Centralized',
        description: 'Justification and Approval (J&A) document for specialized satellite telemetry.',
        text: 'Structure a formal Justification and Approval (J&A) memorandum under FAR 6.302-1 (Only One Responsible Source) for the non-competitive procurement of proprietary radiation-hardened satellite transceivers.'
      }
    ]
  }
};

// Helper to detect mode automatically from input prompt
export function detectModeFromPrompt(text: string): UniversalMode {
  const lower = text.toLowerCase();

  // Federal / Defense / Statutory cues
  if (
    lower.includes('nist') ||
    lower.includes('far ') ||
    lower.includes('fisma') ||
    lower.includes('fedramp') ||
    lower.includes('statutory') ||
    lower.includes('federal') ||
    lower.includes('inter-agency') ||
    lower.includes('defense') ||
    lower.includes('scada') ||
    lower.includes('cisa') ||
    lower.includes('fema') ||
    lower.includes('dod') ||
    lower.includes('classified')
  ) {
    return 'federal';
  }

  // Local Government / Municipal cues
  if (
    lower.includes('municipal') ||
    lower.includes('city council') ||
    lower.includes('zoning') ||
    lower.includes('constituent') ||
    lower.includes('311') ||
    lower.includes('public works') ||
    lower.includes('parks and rec') ||
    lower.includes('ordinance') ||
    lower.includes('public notice') ||
    lower.includes('sidewalk') ||
    lower.includes('pothole') ||
    lower.includes('civic') ||
    lower.includes('county')
  ) {
    return 'local_gov';
  }

  // Enterprise / Major Corporation cues
  if (
    lower.includes('enterprise') ||
    lower.includes('finops') ||
    lower.includes('multi-cloud') ||
    lower.includes('cross-department') ||
    lower.includes('multi-team') ||
    lower.includes('sla ') ||
    lower.includes('okta') ||
    lower.includes('merger') ||
    lower.includes('corporate governance') ||
    lower.includes('erp') ||
    lower.includes('c-suite') ||
    lower.includes('quarterly revenue') ||
    lower.includes('q3') ||
    lower.includes('q4') ||
    lower.includes('stakeholder')
  ) {
    return 'enterprise';
  }

  // Small Business cues
  if (
    lower.includes('small business') ||
    lower.includes('smb') ||
    lower.includes('freelancer') ||
    lower.includes('invoice') ||
    lower.includes('cash flow') ||
    lower.includes('pricing tier') ||
    lower.includes('retention campaign') ||
    lower.includes('rfp') ||
    lower.includes('inventory') ||
    lower.includes('e-commerce') ||
    lower.includes('shopify') ||
    lower.includes('marketing email') ||
    lower.includes('startup')
  ) {
    return 'small_business';
  }

  // Default to Everyday User for broad, universally friendly interaction
  return 'everyday';
}
