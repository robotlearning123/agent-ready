/**
 * dependency_detect check implementation
 *
 * Detects if specific packages/dependencies are used in the project.
 * Used for tracing, metrics, and analytics package detection.
 */

import type { DependencyDetectCheck, CheckResult, ScanContext } from '../types.js';
import { fileExists, readFileCached, relativePath } from '../utils/fs.js';
import * as path from 'node:path';

export async function executeDependencyDetect(
  check: DependencyDetectCheck,
  context: ScanContext
): Promise<CheckResult> {
  const foundPackages: Array<{ package: string; source: string }> = [];
  const matchedFiles: string[] = [];

  // Check package.json dependencies (npm/yarn/pnpm)
  if (context.package_json) {
    const deps = {
      ...context.package_json.dependencies,
      ...context.package_json.devDependencies,
    };

    for (const pkg of check.packages) {
      if (deps[pkg]) {
        foundPackages.push({ package: pkg, source: 'package.json' });
        if (!matchedFiles.includes('package.json')) {
          matchedFiles.push('package.json');
        }
      }
    }
  }

  // Check requirements.txt (Python)
  const requirementsPath = path.join(context.root_path, 'requirements.txt');
  if (await fileExists(requirementsPath)) {
    const content = await readFileCached(requirementsPath, context.file_cache);
    if (content) {
      for (const pkg of check.packages) {
        // Match package name at start of line, with optional version specifier
        const pattern = new RegExp(`^${escapeRegex(pkg)}([>=<~!\\[\\s]|$)`, 'mi');
        if (pattern.test(content)) {
          foundPackages.push({ package: pkg, source: 'requirements.txt' });
          if (!matchedFiles.includes('requirements.txt')) {
            matchedFiles.push('requirements.txt');
          }
        }
      }
    }
  }

  // Check pyproject.toml (Python Poetry/PEP 621)
  const pyprojectPath = path.join(context.root_path, 'pyproject.toml');
  if (await fileExists(pyprojectPath)) {
    const content = await readFileCached(pyprojectPath, context.file_cache);
    if (content) {
      for (const pkg of check.packages) {
        // Match in dependencies section
        const pattern = new RegExp(`["']?${escapeRegex(pkg)}["']?\\s*[=:]`, 'i');
        if (pattern.test(content)) {
          foundPackages.push({ package: pkg, source: 'pyproject.toml' });
          if (!matchedFiles.includes('pyproject.toml')) {
            matchedFiles.push('pyproject.toml');
          }
        }
      }
    }
  }

  // Check go.mod (Go)
  const goModPath = path.join(context.root_path, 'go.mod');
  if (await fileExists(goModPath)) {
    const content = await readFileCached(goModPath, context.file_cache);
    if (content) {
      for (const pkg of check.packages) {
        if (content.includes(pkg)) {
          foundPackages.push({ package: pkg, source: 'go.mod' });
          if (!matchedFiles.includes('go.mod')) {
            matchedFiles.push('go.mod');
          }
        }
      }
    }
  }

  // Check Cargo.toml (Rust)
  const cargoPath = path.join(context.root_path, 'Cargo.toml');
  if (await fileExists(cargoPath)) {
    const content = await readFileCached(cargoPath, context.file_cache);
    if (content) {
      for (const pkg of check.packages) {
        const pattern = new RegExp(`^${escapeRegex(pkg)}\\s*=`, 'mi');
        if (pattern.test(content)) {
          foundPackages.push({ package: pkg, source: 'Cargo.toml' });
          if (!matchedFiles.includes('Cargo.toml')) {
            matchedFiles.push('Cargo.toml');
          }
        }
      }
    }
  }

  // Check for config files if specified
  if (check.config_files && check.config_files.length > 0) {
    for (const configFile of check.config_files) {
      const configPath = path.join(context.root_path, configFile);
      if (await fileExists(configPath)) {
        foundPackages.push({ package: `config:${configFile}`, source: configFile });
        matchedFiles.push(relativePath(configPath, context.root_path));
      }
    }
  }

  if (foundPackages.length > 0) {
    const packageNames = [...new Set(foundPackages.map((p) => p.package))];
    return {
      check_id: check.id,
      check_name: check.name,
      pillar: check.pillar,
      level: check.level,
      passed: true,
      required: check.required,
      message: `Found dependency: ${packageNames.join(', ')}`,
      matched_files: matchedFiles,
      details: {
        packages: foundPackages,
      },
    };
  }

  return {
    check_id: check.id,
    check_name: check.name,
    pillar: check.pillar,
    level: check.level,
    passed: false,
    required: check.required,
    message: `No matching dependencies found (looking for: ${check.packages.join(', ')})`,
    suggestions: [`Install one of: ${check.packages.join(', ')}`],
    details: {
      searched_for: check.packages,
      config_files_checked: check.config_files,
    },
  };
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
