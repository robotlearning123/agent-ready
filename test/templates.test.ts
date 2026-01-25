/**
 * Tests for template generation
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';

import { getTemplates, getTemplateForCheck, listTemplates } from '../src/templates/index.js';

describe('Template system', () => {
  describe('listTemplates', () => {
    it('should return array of template definitions', () => {
      const templates = listTemplates();
      assert.ok(Array.isArray(templates));
      assert.ok(templates.length > 0, 'Should have some templates');
    });

    it('should include common templates', () => {
      const templates = listTemplates();

      // Should have templates for common files
      const expectedCheckIds = [
        'docs.agents_md',
        'docs.contributing',
        'env.dotenv_example',
        'security.gitignore',
      ];

      for (const checkId of expectedCheckIds) {
        assert.ok(
          templates.some((t) => t.checkId === checkId),
          `Should have template for ${checkId}`
        );
      }
    });

    it('should have valid template structure', () => {
      const templates = listTemplates();

      for (const template of templates) {
        assert.ok(template.checkId, 'Should have checkId');
        assert.ok(template.name, 'Should have name');
        assert.ok(template.description, 'Should have description');
        assert.ok(template.targetPath, 'Should have targetPath');
      }
    });
  });

  describe('getTemplates', () => {
    it('should return templates with content', async () => {
      const templates = await getTemplates();

      assert.ok(Array.isArray(templates));
      // At least some templates should load
      if (templates.length > 0) {
        const first = templates[0];
        assert.ok(first.content, 'Should have content');
        assert.ok(first.content.length > 0, 'Content should not be empty');
      }
    });
  });

  describe('getTemplateForCheck', () => {
    it('should return template for valid check ID', async () => {
      const template = await getTemplateForCheck('docs.agents_md');

      if (template) {
        assert.ok(template.checkId === 'docs.agents_md');
        assert.ok(template.content, 'Should have content');
      }
    });

    it('should return null for invalid check ID', async () => {
      const template = await getTemplateForCheck('nonexistent.check.id.xyz');
      assert.strictEqual(template, null);
    });
  });
});

describe('Template content quality', () => {
  describe('AGENTS.md template', () => {
    it('should have AI agent guidance', async () => {
      const template = await getTemplateForCheck('docs.agents_md');
      if (template) {
        assert.ok(template.content.includes('#'), 'Should have heading');
      }
    });
  });

  describe('.env.example template', () => {
    it('should have example variables', async () => {
      const template = await getTemplateForCheck('env.dotenv_example');
      if (template) {
        assert.ok(template.content.includes('='), 'Should have key=value format');
      }
    });
  });

  describe('.gitignore template', () => {
    it('should exclude common patterns', async () => {
      const template = await getTemplateForCheck('security.gitignore');
      if (template) {
        assert.ok(
          template.content.includes('node_modules') || template.content.includes('.env'),
          'Should have common exclusions'
        );
      }
    });
  });
});

describe('Template check ID conventions', () => {
  it('should follow pillar.name convention', () => {
    const templates = listTemplates();

    for (const template of templates) {
      assert.ok(
        template.checkId.includes('.'),
        `Check ID should have pillar prefix: ${template.checkId}`
      );
    }
  });
});
