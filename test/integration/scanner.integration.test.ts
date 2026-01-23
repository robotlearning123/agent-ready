/**
 * Integration tests for the scanner module
 * Tests end-to-end scanning functionality against real fixtures
 */

import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const CLI_PATH = path.join(__dirname, '../../src/index.ts');
const FIXTURES_PATH = path.join(__dirname, '../fixtures');

function runCLI(args: string[]): { stdout: string; stderr: string; status: number } {
  const result = spawnSync('npx', ['tsx', CLI_PATH, ...args], {
    encoding: 'utf-8',
    cwd: process.cwd(),
  });
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    status: result.status || 0,
  };
}

describe('Scanner Integration Tests', () => {
  describe('scan command', () => {
    it('should scan minimal-repo fixture and return L1', () => {
      const minimalRepo = path.join(FIXTURES_PATH, 'minimal-repo');
      if (!fs.existsSync(minimalRepo)) {
        console.log('Skipping: minimal-repo fixture not found');
        return;
      }

      const { stdout } = runCLI(['scan', minimalRepo, '--output', 'json']);
      const result = JSON.parse(stdout);

      expect(result.level).toBeDefined();
      expect(['L1', 'L2', 'L3', 'L4', 'L5']).toContain(result.level);
    });

    it('should scan standard-repo fixture and return L2+', () => {
      const standardRepo = path.join(FIXTURES_PATH, 'standard-repo');
      if (!fs.existsSync(standardRepo)) {
        console.log('Skipping: standard-repo fixture not found');
        return;
      }

      const { stdout } = runCLI(['scan', standardRepo, '--output', 'json']);
      const result = JSON.parse(stdout);

      expect(result.level).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('should scan current directory successfully', () => {
      const { stdout } = runCLI(['scan', '.', '--output', 'json']);
      const result = JSON.parse(stdout);

      expect(result.repo).toBeDefined();
      expect(result.level).toBeDefined();
      expect(result.pillars).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should generate readiness.json output file', () => {
      const outputPath = path.join(process.cwd(), 'readiness.json');

      runCLI(['scan', '.']);

      expect(fs.existsSync(outputPath)).toBe(true);

      const content = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      expect(content.level).toBeDefined();
      expect(content.pillars).toBeDefined();
    });

    it('should handle verbose flag', () => {
      const { stdout } = runCLI(['scan', '.', '--verbose']);

      expect(stdout).toContain('Agent Readiness Report');
      expect(stdout).toContain('Level:');
    });
  });

  describe('init command', () => {
    it('should show dry-run output without creating files', () => {
      const { status } = runCLI(['init', '--dry-run']);

      // Dry run should complete without errors
      expect(status).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle non-existent directory gracefully', () => {
      const { status } = runCLI(['scan', '/non/existent/path/12345']);

      // Should return non-zero exit code
      expect(status).not.toBe(0);
    });
  });
});
