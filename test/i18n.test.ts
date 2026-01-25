/**
 * Tests for i18n module
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert';

import {
  setLocale,
  getLocale,
  getAvailableLocales,
  isValidLocale,
  t,
  getPillarName,
  getLevelName,
  getPriorityName,
} from '../src/i18n/index.js';

describe('i18n module', () => {
  beforeEach(() => {
    // Reset to default locale before each test
    setLocale('en');
  });

  afterEach(() => {
    // Reset to default locale after each test
    setLocale('en');
  });

  describe('setLocale and getLocale', () => {
    it('should default to English', () => {
      assert.strictEqual(getLocale(), 'en');
    });

    it('should switch to Chinese', () => {
      setLocale('zh');
      assert.strictEqual(getLocale(), 'zh');
    });

    it('should switch back to English', () => {
      setLocale('zh');
      setLocale('en');
      assert.strictEqual(getLocale(), 'en');
    });

    it('should handle invalid locale gracefully', () => {
      setLocale('invalid' as 'en');
      // Should fall back to English
      assert.strictEqual(getLocale(), 'en');
    });
  });

  describe('getAvailableLocales', () => {
    it('should return available locales', () => {
      const locales = getAvailableLocales();
      assert.ok(Array.isArray(locales));
      assert.ok(locales.includes('en'));
      assert.ok(locales.includes('zh'));
    });
  });

  describe('isValidLocale', () => {
    it('should return true for valid locales', () => {
      assert.strictEqual(isValidLocale('en'), true);
      assert.strictEqual(isValidLocale('zh'), true);
    });

    it('should return false for invalid locales', () => {
      assert.strictEqual(isValidLocale('invalid'), false);
      assert.strictEqual(isValidLocale('fr'), false);
    });
  });

  describe('t function', () => {
    it('should translate pillar names in English', () => {
      setLocale('en');
      assert.strictEqual(t('pillars.docs'), 'Documentation');
      assert.strictEqual(t('pillars.build'), 'Build System');
      assert.strictEqual(t('pillars.security'), 'Security');
    });

    it('should translate pillar names in Chinese', () => {
      setLocale('zh');
      assert.strictEqual(t('pillars.docs'), '文档');
      assert.strictEqual(t('pillars.build'), '构建系统');
      assert.strictEqual(t('pillars.security'), '安全');
    });

    it('should translate level names in English', () => {
      setLocale('en');
      assert.strictEqual(t('levels.L1'), 'Functional');
      assert.strictEqual(t('levels.L2'), 'Documented');
      assert.strictEqual(t('levels.L5'), 'Autonomous');
    });

    it('should translate level names in Chinese', () => {
      setLocale('zh');
      assert.strictEqual(t('levels.L1'), '可运行');
      assert.strictEqual(t('levels.L2'), '有文档');
      assert.strictEqual(t('levels.L5'), '自治');
    });

    it('should translate priority names', () => {
      setLocale('en');
      assert.strictEqual(t('priorities.critical'), 'CRITICAL');
      assert.strictEqual(t('priorities.high'), 'HIGH');
      assert.strictEqual(t('priorities.low'), 'LOW');
    });

    it('should translate output titles', () => {
      setLocale('en');
      assert.strictEqual(t('output.title'), 'Agent Readiness Report');

      setLocale('zh');
      assert.strictEqual(t('output.title'), 'AI Agent 就绪度报告');
    });

    it('should interpolate parameters', () => {
      setLocale('en');
      const result = t('cli.scanning', { path: '/home/project' });
      assert.strictEqual(result, 'Scanning: /home/project');
    });

    it('should interpolate parameters in Chinese', () => {
      setLocale('zh');
      const result = t('cli.scanning', { path: '/home/project' });
      assert.strictEqual(result, '正在扫描: /home/project');
    });

    it('should interpolate numeric parameters', () => {
      setLocale('en');
      const result = t('output.score', { score: 85 });
      assert.strictEqual(result, 'Score: 85%');
    });

    it('should handle missing keys gracefully', () => {
      const result = t('nonexistent.key');
      assert.strictEqual(result, 'nonexistent.key');
    });

    it('should handle missing parameters', () => {
      const result = t('cli.scanning');
      // Should keep the placeholder when parameter is missing
      assert.ok(result.includes('{path}'));
    });
  });

  describe('getPillarName', () => {
    it('should get pillar names in English', () => {
      setLocale('en');
      assert.strictEqual(getPillarName('docs'), 'Documentation');
      assert.strictEqual(getPillarName('test'), 'Testing');
      assert.strictEqual(getPillarName('env'), 'Development Environment');
    });

    it('should get pillar names in Chinese', () => {
      setLocale('zh');
      assert.strictEqual(getPillarName('docs'), '文档');
      assert.strictEqual(getPillarName('test'), '测试');
      assert.strictEqual(getPillarName('env'), '开发环境');
    });
  });

  describe('getLevelName', () => {
    it('should get level names in English', () => {
      setLocale('en');
      assert.strictEqual(getLevelName('L1'), 'Functional');
      assert.strictEqual(getLevelName('L3'), 'Standardized');
      assert.strictEqual(getLevelName(null), 'Not Achieved');
    });

    it('should get level names in Chinese', () => {
      setLocale('zh');
      assert.strictEqual(getLevelName('L1'), '可运行');
      assert.strictEqual(getLevelName('L3'), '标准化');
      assert.strictEqual(getLevelName(null), '未达成');
    });
  });

  describe('getPriorityName', () => {
    it('should get priority names in English', () => {
      setLocale('en');
      assert.strictEqual(getPriorityName('critical'), 'CRITICAL');
      assert.strictEqual(getPriorityName('medium'), 'MEDIUM');
    });

    it('should get priority names in Chinese', () => {
      setLocale('zh');
      assert.strictEqual(getPriorityName('critical'), '紧急');
      assert.strictEqual(getPriorityName('medium'), '中');
    });
  });
});

describe('Translation coverage', () => {
  beforeEach(() => setLocale('en'));
  afterEach(() => setLocale('en'));

  it('should have all pillar translations', () => {
    const pillars = [
      'docs',
      'style',
      'build',
      'test',
      'security',
      'observability',
      'env',
      'task_discovery',
      'product',
    ];

    setLocale('en');
    for (const pillar of pillars) {
      const translation = t(`pillars.${pillar}`);
      assert.ok(
        translation !== `pillars.${pillar}`,
        `Should have English translation for ${pillar}`
      );
    }

    setLocale('zh');
    for (const pillar of pillars) {
      const translation = t(`pillars.${pillar}`);
      assert.ok(
        translation !== `pillars.${pillar}`,
        `Should have Chinese translation for ${pillar}`
      );
    }
  });

  it('should have all level translations', () => {
    const levels = ['L1', 'L2', 'L3', 'L4', 'L5', 'none'];

    setLocale('en');
    for (const level of levels) {
      const translation = t(`levels.${level}`);
      assert.ok(translation !== `levels.${level}`, `Should have English translation for ${level}`);
    }

    setLocale('zh');
    for (const level of levels) {
      const translation = t(`levels.${level}`);
      assert.ok(translation !== `levels.${level}`, `Should have Chinese translation for ${level}`);
    }
  });

  it('should have all priority translations', () => {
    const priorities = ['critical', 'high', 'medium', 'low'];

    setLocale('en');
    for (const priority of priorities) {
      const translation = t(`priorities.${priority}`);
      assert.ok(
        translation !== `priorities.${priority}`,
        `Should have English translation for ${priority}`
      );
    }

    setLocale('zh');
    for (const priority of priorities) {
      const translation = t(`priorities.${priority}`);
      assert.ok(
        translation !== `priorities.${priority}`,
        `Should have Chinese translation for ${priority}`
      );
    }
  });
});
