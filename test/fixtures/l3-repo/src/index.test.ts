import { describe, it, expect } from 'vitest';
import { hello } from './index';

describe('hello', () => {
  it('should return greeting', () => {
    expect(hello('World')).toBe('Hello, World!');
  });
});
