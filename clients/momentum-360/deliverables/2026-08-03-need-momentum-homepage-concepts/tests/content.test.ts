import { describe, expect, it } from 'vitest';
import { auditUrl, proofImages, services } from '../src/shared/content';

describe('Need Momentum homepage source locks', () => {
  it('uses the canonical free audit path', () => {
    expect(auditUrl).toBe('https://www.needmomentum.com/free-website-seo-audit/');
  });

  it('keeps Momentum 360 inside the connected service system', () => {
    expect(services.map((service) => service.title)).toContain('Momentum 360');
    expect(services).toHaveLength(9);
  });

  it('ships a real-work photo sequence', () => {
    expect(proofImages).toHaveLength(5);
    expect(proofImages.every((image) => image.src.startsWith('/assets/proof/'))).toBe(true);
  });
});
