import { describe, expect, it } from 'vitest';

describe('infrastructure test harness', () => {
  it('runs Vitest without product code', () => {
    expect(process.version).toMatch(/^v\d+\./);
  });
});
