import fs from 'fs';
import path from 'path';
import type {
  User,
  ScanSummary,
  Finding,
  ContributionRoute,
  IssueDraft,
  TechnologyRecord,
  ActivityEvent,
} from '../types';

interface DatabaseSchema {
  users: User[];
  scans: ScanSummary[];
  findings: Finding[];
  routes: ContributionRoute[];
  drafts: IssueDraft[];
  technologies: TechnologyRecord[];
  activities: ActivityEvent[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DATA: DatabaseSchema = {
  users: [],
  scans: [],
  findings: [],
  routes: [],
  drafts: [],
  technologies: [],
  activities: [],
};

// In-memory cache for fast sync access with mtime invalidation
let cache: DatabaseSchema | null = null;
let lastMtime = 0;

function ensureDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      cache = { ...INITIAL_DATA };
      lastMtime = fs.statSync(DB_FILE).mtimeMs;
      return cache;
    }

    const stat = fs.statSync(DB_FILE);
    if (cache && stat.mtimeMs <= lastMtime) {
      return cache;
    }

    const content = fs.readFileSync(DB_FILE, 'utf-8');
    cache = JSON.parse(content);
    lastMtime = stat.mtimeMs;
    return cache!;
  } catch (error) {
    console.error('Error reading database file, using fallback in-memory state:', error);
    if (cache) return cache;
    cache = { ...INITIAL_DATA };
    return cache;
  }
}

function persistDb(): void {
  if (!cache) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(cache, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    lastMtime = fs.statSync(DB_FILE).mtimeMs;
  } catch (error) {
    console.error('Failed to write database file atomically:', error);
  }
}

export const db = {
  // Users
  getUsers: (): User[] => {
    return ensureDb().users;
  },
  getUserById: (id: string): User | undefined => {
    return ensureDb().users.find((u) => u.id === id);
  },
  getUserByEmailOrPhone: (identifier: string): User | undefined => {
    const cleanId = identifier.trim().toLowerCase();
    return ensureDb().users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.phone.replace(/[\s\-\+]/g, '') === cleanId.replace(/[\s\-\+]/g, '')
    );
  },
  saveUser: (user: User): User => {
    const data = ensureDb();
    const index = data.users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      data.users[index] = user;
    } else {
      data.users.push(user);
    }
    persistDb();
    return user;
  },

  // Scans
  getScans: (userId?: string): ScanSummary[] => {
    const scans = ensureDb().scans;
    if (userId) return scans.filter((s) => s.userId === userId);
    return scans;
  },
  getScanById: (id: string): ScanSummary | undefined => {
    return ensureDb().scans.find((s) => s.id === id);
  },
  saveScan: (scan: ScanSummary): ScanSummary => {
    const data = ensureDb();
    const index = data.scans.findIndex((s) => s.id === scan.id);
    if (index >= 0) {
      data.scans[index] = scan;
    } else {
      data.scans.unshift(scan);
    }
    persistDb();
    return scan;
  },

  // Findings
  getFindings: (scanId?: string): Finding[] => {
    const findings = ensureDb().findings;
    if (scanId) return findings.filter((f) => f.scanId === scanId);
    return findings;
  },
  getFindingById: (id: string): Finding | undefined => {
    return ensureDb().findings.find((f) => f.id === id);
  },
  saveFindings: (newFindings: Finding[]): Finding[] => {
    const data = ensureDb();
    for (const finding of newFindings) {
      const idx = data.findings.findIndex((f) => f.id === finding.id);
      if (idx >= 0) {
        data.findings[idx] = finding;
      } else {
        data.findings.push(finding);
      }
    }
    persistDb();
    return newFindings;
  },
  updateFinding: (finding: Finding): Finding => {
    const data = ensureDb();
    const idx = data.findings.findIndex((f) => f.id === finding.id);
    if (idx >= 0) {
      data.findings[idx] = finding;
      persistDb();
    }
    return finding;
  },
  markFindingReviewed: (findingId: string, reviewedBy: string): Finding | undefined => {
    const data = ensureDb();
    const finding = data.findings.find((f) => f.id === findingId);
    if (finding) {
      finding.reviewed = true;
      finding.reviewedBy = reviewedBy;
      finding.reviewedAt = new Date().toISOString();
      persistDb();
    }
    return finding;
  },

  // Contribution Routes
  getRoutes: (scanId?: string): ContributionRoute[] => {
    const routes = ensureDb().routes;
    if (scanId) return routes.filter((r) => r.scanId === scanId);
    return routes;
  },
  getRouteById: (id: string): ContributionRoute | undefined => {
    return ensureDb().routes.find((r) => r.id === id);
  },
  saveRoute: (route: ContributionRoute): ContributionRoute => {
    const data = ensureDb();
    const idx = data.routes.findIndex((r) => r.id === route.id);
    if (idx >= 0) {
      data.routes[idx] = route;
    } else {
      data.routes.push(route);
    }
    persistDb();
    return route;
  },

  // Issue Drafts
  getDrafts: (scanId?: string): IssueDraft[] => {
    const drafts = ensureDb().drafts;
    if (scanId) return drafts.filter((d) => d.scanId === scanId);
    return drafts;
  },
  getDraftById: (id: string): IssueDraft | undefined => {
    return ensureDb().drafts.find((d) => d.id === id);
  },
  saveDraft: (draft: IssueDraft): IssueDraft => {
    const data = ensureDb();
    const idx = data.drafts.findIndex((d) => d.id === draft.id);
    if (idx >= 0) {
      data.drafts[idx] = draft;
    } else {
      data.drafts.push(draft);
    }
    persistDb();
    return draft;
  },
  updateDraft: (draftId: string, updates: Partial<IssueDraft>): IssueDraft | undefined => {
    const data = ensureDb();
    const idx = data.drafts.findIndex((d) => d.id === draftId);
    if (idx >= 0) {
      data.drafts[idx] = {
        ...data.drafts[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      persistDb();
      return data.drafts[idx];
    }
    return undefined;
  },
  deleteDraft: (draftId: string): boolean => {
    const data = ensureDb();
    const initialLen = data.drafts.length;
    data.drafts = data.drafts.filter((d) => d.id !== draftId);
    if (data.drafts.length !== initialLen) {
      persistDb();
      return true;
    }
    return false;
  },

  // Technologies (Section 7 Schema)
  getTechnologies: (scanId?: string): TechnologyRecord[] => {
    const data = ensureDb();
    if (!data.technologies) data.technologies = [];
    if (scanId) return data.technologies.filter((t) => t.scanId === scanId);
    return data.technologies;
  },
  saveTechnologies: (techs: TechnologyRecord[]): TechnologyRecord[] => {
    const data = ensureDb();
    if (!data.technologies) data.technologies = [];
    for (const tech of techs) {
      const idx = data.technologies.findIndex((t) => t.id === tech.id);
      if (idx >= 0) {
        data.technologies[idx] = tech;
      } else {
        data.technologies.push(tech);
      }
    }
    persistDb();
    return techs;
  },

  // Activities
  getActivities: (userId?: string): ActivityEvent[] => {
    const activities = ensureDb().activities;
    if (userId) return activities.filter((a) => a.userId === userId);
    return activities;
  },
  logActivity: (event: Omit<ActivityEvent, 'id' | 'timestamp'>): ActivityEvent => {
    const data = ensureDb();
    const newEvent: ActivityEvent = {
      ...event,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    data.activities.unshift(newEvent);
    // Keep bounded history
    if (data.activities.length > 200) {
      data.activities = data.activities.slice(0, 200);
    }
    persistDb();
    return newEvent;
  },

  // Clear user data (for Profile data clear action)
  clearUserData: (userId: string): void => {
    const data = ensureDb();
    const userScans = data.scans.filter((s) => s.userId === userId).map((s) => s.id);
    data.scans = data.scans.filter((s) => s.userId !== userId);
    data.findings = data.findings.filter((f) => !userScans.includes(f.scanId));
    data.routes = data.routes.filter((r) => !userScans.includes(r.scanId));
    data.drafts = data.drafts.filter((d) => !userScans.includes(d.scanId));
    data.technologies = (data.technologies || []).filter((t) => !userScans.includes(t.scanId));
    data.activities = data.activities.filter((a) => a.userId !== userId);
    persistDb();
  },

  // Export full sanitized user bundle for data portability (GDPR/privacy compliant)
  exportUserData: (userId: string) => {
    const data = ensureDb();
    const user = data.users.find((u) => u.id === userId);
    if (!user) return null;

    const userScans = data.scans.filter((s) => s.userId === userId);
    const userScanIds = userScans.map((s) => s.id);
    const findings = data.findings.filter((f) => userScanIds.includes(f.scanId));
    const routes = data.routes.filter((r) => userScanIds.includes(r.scanId));
    const drafts = data.drafts.filter((d) => userScanIds.includes(d.scanId));
    const activities = data.activities.filter((a) => a.userId === userId);

    return {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        settings: user.settings,
        createdAt: user.createdAt,
      },
      scans: userScans,
      findings,
      routes,
      drafts,
      activities,
    };
  },

  // Permanent account removal with cascading deletion across scans, findings, routes, drafts, and activities
  deleteUserAccount: (userId: string): boolean => {
    const data = ensureDb();
    const initialUserCount = data.users.length;
    data.users = data.users.filter((u) => u.id !== userId);
    if (data.users.length === initialUserCount) {
      return false;
    }

    const userScans = data.scans.filter((s) => s.userId === userId).map((s) => s.id);
    data.scans = data.scans.filter((s) => s.userId !== userId);
    data.findings = data.findings.filter((f) => !userScans.includes(f.scanId));
    data.routes = data.routes.filter((r) => !userScans.includes(r.scanId));
    data.drafts = data.drafts.filter((d) => !userScans.includes(d.scanId));
    data.technologies = (data.technologies || []).filter((t) => !userScans.includes(t.scanId));
    data.activities = data.activities.filter((a) => a.userId !== userId);
    persistDb();
    return true;
  },
};
