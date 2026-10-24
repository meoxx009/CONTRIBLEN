/**
 * ContribLens Technology Stack & Readiness Detector
 * 
 * Accurately detects programming languages, frameworks, tooling, and build manifests
 * with confidence levels and calculates the Contribution Readiness Score.
 */

import type { TechStack, ManifestInfo } from '../../types';
import type { BoundedFile } from './github';

const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.mjs': 'JavaScript',
  '.py': 'Python',
  '.go': 'Go',
  '.rs': 'Rust',
  '.java': 'Java',
  '.c': 'C',
  '.cpp': 'C++',
  '.cc': 'C++',
  '.cs': 'C#',
  '.swift': 'Swift',
  '.kt': 'Kotlin',
  '.kts': 'Kotlin',
  '.rb': 'Ruby',
  '.php': 'PHP',
  '.sh': 'Shell',
  '.bash': 'Shell',
  '.yml': 'YAML',
  '.yaml': 'YAML',
  '.sql': 'SQL',
  '.html': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
};

export function detectTechnologyStack(
  files: BoundedFile[],
  packageJsonData?: { dependencies: Array<{ name: string }>; scripts: Record<string, string> },
  pythonDeps?: Array<{ name: string }>
): { techStack: TechStack; readinessScore: number } {
  const langCounts: Record<string, number> = {};
  const langSources: Record<string, string[]> = {};
  let totalCodeFiles = 0;

  const frameworks: TechStack['frameworks'] = [];
  const tooling: TechStack['tooling'] = [];
  const manifests: ManifestInfo[] = [];

  // Helper to add or augment tooling
  const addTooling = (name: string, category: string, source: string, confidence: number = 0.90) => {
    const existing = tooling.find((t) => t.name === name);
    if (existing) {
      if (existing.sources && !existing.sources.includes(source)) {
        existing.sources.push(source);
      }
    } else {
      tooling.push({ name, category, sources: [source], confidence });
    }
  };

  // Inspect file tree
  files.forEach((file) => {
    const ext = '.' + file.path.split('.').pop()?.toLowerCase();
    const lang = EXTENSION_LANGUAGE_MAP[ext];
    if (lang) {
      langCounts[lang] = (langCounts[lang] || 0) + 1;
      if (!langSources[lang]) langSources[lang] = [];
      if (langSources[lang].length < 10) {
        langSources[lang].push(file.path);
      }
      totalCodeFiles++;
    }

    const lowerPath = file.path.toLowerCase();

    // Check manifests
    if (lowerPath.endsWith('package.json')) {
      manifests.push({
        path: file.path,
        type: 'npm',
        dependenciesCount: packageJsonData?.dependencies.length || 0,
      });
      addTooling('npm', 'Package Manager', file.path, 0.95);
    } else if (lowerPath.endsWith('requirements.txt')) {
      manifests.push({
        path: file.path,
        type: 'pip',
        dependenciesCount: pythonDeps?.length || 0,
      });
      addTooling('pip', 'Package Manager', file.path, 0.95);
    } else if (lowerPath.endsWith('pyproject.toml')) {
      manifests.push({
        path: file.path,
        type: 'poetry',
        dependenciesCount: pythonDeps?.length || 0,
      });
      addTooling('poetry', 'Package Manager', file.path, 0.95);
    } else if (lowerPath.endsWith('cargo.toml')) {
      manifests.push({
        path: file.path,
        type: 'cargo',
        dependenciesCount: 0,
      });
      addTooling('Cargo', 'Package Manager', file.path, 0.95);
    } else if (lowerPath.endsWith('go.mod')) {
      manifests.push({
        path: file.path,
        type: 'go_mod',
        dependenciesCount: 0,
      });
      addTooling('Go modules', 'Package Manager', file.path, 0.95);
    }

    // Tooling check via files
    if (lowerPath.includes('dockerfile') || lowerPath.endsWith('docker-compose.yml')) {
      addTooling('Docker', 'Containerization', file.path, 0.95);
    }
    if (lowerPath.includes('.github/workflows/')) {
      addTooling('GitHub Actions', 'CI/CD', file.path, 0.98);
    }
    if (lowerPath.includes('.eslintrc') || lowerPath.includes('eslint.config')) {
      addTooling('ESLint', 'Linter', file.path, 0.95);
    }
    if (lowerPath.includes('jest.config') || lowerPath.includes('vitest.config')) {
      const name = lowerPath.includes('vitest') ? 'Vitest' : 'Jest';
      addTooling(name, 'Testing', file.path, 0.95);
    }
    if (lowerPath.includes('tailwind.config')) {
      addTooling('Tailwind CSS', 'CSS Framework', file.path, 0.95);
    }
    if (lowerPath.includes('pytest.ini') || lowerPath.includes('conftest.py')) {
      addTooling('Pytest', 'Testing', file.path, 0.95);
    }
    if (lowerPath.includes('playwright.config')) {
      addTooling('Playwright', 'Testing', file.path, 0.95);
    }
    if (lowerPath.includes('cypress.config') || lowerPath.includes('cypress.json')) {
      addTooling('Cypress', 'Testing', file.path, 0.95);
    }
  });

  // Framework detection via package.json dependencies
  if (packageJsonData) {
    const depNames = packageJsonData.dependencies.map((d) => d.name.toLowerCase());

    if (depNames.includes('next')) {
      frameworks.push({ name: 'Next.js', category: 'Full-stack Web Framework', sources: ['package.json'], confidence: 0.98 });
    }
    if (depNames.includes('react')) {
      frameworks.push({ name: 'React', category: 'UI Library', sources: ['package.json'], confidence: 0.98 });
    }
    if (depNames.includes('express')) {
      frameworks.push({ name: 'Express', category: 'Web Server', sources: ['package.json'], confidence: 0.95 });
    }
    if (depNames.includes('vue')) {
      frameworks.push({ name: 'Vue.js', category: 'UI Framework', sources: ['package.json'], confidence: 0.95 });
    }
    if (depNames.includes('svelte')) {
      frameworks.push({ name: 'Svelte', category: 'UI Framework', sources: ['package.json'], confidence: 0.95 });
    }
    if (depNames.includes('tailwindcss')) {
      addTooling('Tailwind CSS', 'CSS Framework', 'package.json', 0.95);
    }
    if (depNames.includes('typescript')) {
      addTooling('TypeScript', 'Type Checker', 'package.json', 0.95);
    }
    if (depNames.includes('jest')) {
      addTooling('Jest', 'Testing', 'package.json', 0.95);
    }
    if (depNames.includes('vitest')) {
      addTooling('Vitest', 'Testing', 'package.json', 0.95);
    }
    if (depNames.includes('playwright') || depNames.includes('@playwright/test')) {
      addTooling('Playwright', 'Testing', 'package.json', 0.95);
    }
    if (depNames.includes('cypress')) {
      addTooling('Cypress', 'Testing', 'package.json', 0.95);
    }
  }

  // Framework detection via python dependencies
  if (pythonDeps) {
    const pyDepNames = pythonDeps.map((d) => d.name.toLowerCase());
    const pySource = manifests.find((m) => m.type === 'pip' || m.type === 'poetry')?.path || 'requirements.txt';

    if (pyDepNames.includes('fastapi')) {
      frameworks.push({ name: 'FastAPI', category: 'API Framework', sources: [pySource], confidence: 0.95 });
    }
    if (pyDepNames.includes('django')) {
      frameworks.push({ name: 'Django', category: 'Web Framework', sources: [pySource], confidence: 0.95 });
    }
    if (pyDepNames.includes('flask')) {
      frameworks.push({ name: 'Flask', category: 'Microframework', sources: [pySource], confidence: 0.95 });
    }
    if (pyDepNames.includes('pytest')) {
      addTooling('Pytest', 'Testing', pySource, 0.95);
    }
  }

  // Calculate Language percentages and signals
  const languages = Object.entries(langCounts)
    .map(([name, count]) => {
      const sources = langSources[name] || [];
      const isManifestBacked =
        (name === 'JavaScript' || name === 'TypeScript') ? manifests.some((m) => m.type === 'npm') :
        (name === 'Python') ? manifests.some((m) => m.type === 'pip' || m.type === 'poetry') :
        (name === 'Rust') ? manifests.some((m) => m.type === 'cargo') :
        (name === 'Go') ? manifests.some((m) => m.type === 'go_mod') : false;

      // Higher confidence if backed by a project manifest, otherwise path-based
      const confidence = isManifestBacked ? 0.98 : count >= 3 ? 0.90 : 0.75;

      return {
        name,
        filesCount: count,
        percentage: totalCodeFiles > 0 ? Math.round((count / totalCodeFiles) * 100) : 0,
        sources,
        confidence,
      };
    })
    .sort((a, b) => b.filesCount - a.filesCount);

  // Confidence score for tech detection (0 - 100)
  const confidenceScore = Math.min(
    100,
    (languages.length > 0 ? 40 : 0) +
      (frameworks.length > 0 ? 30 : 0) +
      (manifests.length > 0 ? 20 : 0) +
      (tooling.length > 0 ? 10 : 0)
  );

  // Contribution Readiness Score (0 to 100)
  // Factors: clear tooling, test runners present, linter present, manifest clarity
  let readinessScore = 50;
  if (tooling.some((t) => t.category === 'Testing')) readinessScore += 20;
  if (tooling.some((t) => t.category === 'CI/CD')) readinessScore += 15;
  if (tooling.some((t) => t.category === 'Linter')) readinessScore += 10;
  if (manifests.length > 0) readinessScore += 5;

  return {
    techStack: {
      languages,
      frameworks,
      tooling,
      manifests,
      confidenceScore,
    },
    readinessScore: Math.min(100, Math.max(20, readinessScore)),
  };
}
