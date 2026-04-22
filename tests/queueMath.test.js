'use strict';

const { factorial, computeMMc } = require('../src/queueMath');

// ─────────────────────────────────────────────────────────
// factorial
// ─────────────────────────────────────────────────────────
describe('factorial', () => {
  test('0! = 1 (base case)', () => {
    expect(factorial(0)).toBe(1);
  });

  test('1! = 1', () => {
    expect(factorial(1)).toBe(1);
  });

  test('2! = 2', () => {
    expect(factorial(2)).toBe(2);
  });

  test('3! = 6', () => {
    expect(factorial(3)).toBe(6);
  });

  test('4! = 24', () => {
    expect(factorial(4)).toBe(24);
  });

  test('5! = 120', () => {
    expect(factorial(5)).toBe(120);
  });

  test('6! = 720', () => {
    expect(factorial(6)).toBe(720);
  });

  test('10! = 3 628 800', () => {
    expect(factorial(10)).toBe(3628800);
  });

  test('12! = 479 001 600', () => {
    expect(factorial(12)).toBe(479001600);
  });

  test('n!/n = (n-1)! identity holds for n = 7', () => {
    expect(factorial(7) / 7).toBe(factorial(6));
  });
});

// ─────────────────────────────────────────────────────────
// computeMMc — unstable systems (ρ ≥ 1)
// ─────────────────────────────────────────────────────────
describe('computeMMc — unstable systems', () => {
  test('ρ = 1 exactly (boundary) is flagged as unstable', () => {
    const result = computeMMc(10, 10, 1);   // rho = 10/(1*10) = 1
    expect(result.stable).toBe(false);
    expect(result.rho).toBeCloseTo(1, 10);
  });

  test('ρ > 1 (overloaded single server) is unstable', () => {
    const result = computeMMc(10, 5, 1);    // rho = 10/(1*5) = 2
    expect(result.stable).toBe(false);
    expect(result.rho).toBeCloseTo(2, 10);
  });

  test('ρ > 1 with two servers is unstable', () => {
    const result = computeMMc(20, 5, 2);    // rho = 20/(2*5) = 2
    expect(result.stable).toBe(false);
    expect(result.rho).toBeCloseTo(2, 10);
  });

  test('unstable result has no P0, Lq, Wq, Ws', () => {
    const result = computeMMc(15, 5, 2);    // rho = 15/10 = 1.5
    expect(result.P0).toBeUndefined();
    expect(result.Lq).toBeUndefined();
    expect(result.Wq).toBeUndefined();
    expect(result.Ws).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────
// computeMMc — M/M/1 (c = 1)
// ─────────────────────────────────────────────────────────
describe('computeMMc — M/M/1 (c = 1)', () => {
  // λ=10, μ=20 → ρ=0.5  (well-known textbook values)
  describe('lam=10, mu=20, rho=0.5', () => {
    let result;
    beforeAll(() => { result = computeMMc(10, 20, 1); });

    test('is stable', () => expect(result.stable).toBe(true));
    test('ρ = 0.5', () => expect(result.rho).toBeCloseTo(0.5, 10));
    test('P₀ = 0.5', () => expect(result.P0).toBeCloseTo(0.5, 10));
    test('Lq = 0.5', () => expect(result.Lq).toBeCloseTo(0.5, 10));
    test('Wq = 3 min', () => expect(result.Wq).toBeCloseTo(3, 10));
    test('Ws = 6 min', () => expect(result.Ws).toBeCloseTo(6, 10));
  });

  // λ=9, μ=10 → ρ=0.9  (heavily loaded)
  describe('lam=9, mu=10, rho=0.9', () => {
    let result;
    beforeAll(() => { result = computeMMc(9, 10, 1); });

    test('is stable', () => expect(result.stable).toBe(true));
    test('ρ = 0.9', () => expect(result.rho).toBeCloseTo(0.9, 10));
    test('P₀ = 0.1', () => expect(result.P0).toBeCloseTo(0.1, 10));
    test('Lq = 8.1', () => expect(result.Lq).toBeCloseTo(8.1, 5));
    test('Wq = 54 min', () => expect(result.Wq).toBeCloseTo(54, 5));
    test('Ws = 60 min', () => expect(result.Ws).toBeCloseTo(60, 5));
  });

  // λ=1, μ=4 → ρ=0.25  (lightly loaded)
  describe('lam=1, mu=4, rho=0.25', () => {
    let result;
    beforeAll(() => { result = computeMMc(1, 4, 1); });

    test('is stable', () => expect(result.stable).toBe(true));
    test('ρ = 0.25', () => expect(result.rho).toBeCloseTo(0.25, 10));
    // M/M/1: P0 = 1-rho = 0.75
    test('P₀ = 0.75', () => expect(result.P0).toBeCloseTo(0.75, 10));
    // Lq = rho²/(1-rho) = 0.0625/0.75 = 1/12
    test('Lq = 1/12', () => expect(result.Lq).toBeCloseTo(1 / 12, 10));
    // Wq = Lq/λ * 60 = (1/12)/1*60 = 5 min
    test('Wq = 5 min', () => expect(result.Wq).toBeCloseTo(5, 10));
    // Ws = 5 + 60/4 = 20 min
    test('Ws = 20 min', () => expect(result.Ws).toBeCloseTo(20, 10));
  });

  // Consistency: P0 = 1 - rho for M/M/1
  test('P₀ = 1 − ρ holds for M/M/1 (lam=30, mu=60)', () => {
    const r = computeMMc(30, 60, 1);
    expect(r.P0).toBeCloseTo(1 - r.rho, 10);
  });
});

// ─────────────────────────────────────────────────────────
// computeMMc — M/M/2 (c = 2)
// ─────────────────────────────────────────────────────────
describe('computeMMc — M/M/2 (c = 2)', () => {
  // λ=10, μ=10, c=2 → ρ=0.5  (symmetric textbook case)
  describe('lam=10, mu=10, c=2, rho=0.5', () => {
    let result;
    beforeAll(() => { result = computeMMc(10, 10, 2); });

    test('is stable', () => expect(result.stable).toBe(true));
    test('ρ = 0.5', () => expect(result.rho).toBeCloseTo(0.5, 10));
    test('P₀ = 1/3', () => expect(result.P0).toBeCloseTo(1 / 3, 10));
    test('Lq = 1/3', () => expect(result.Lq).toBeCloseTo(1 / 3, 10));
    test('Wq = 2 min', () => expect(result.Wq).toBeCloseTo(2, 10));
    test('Ws = 8 min', () => expect(result.Ws).toBeCloseTo(8, 10));
  });

  // Slider defaults from the study: λ=53, μ=62, c=2
  describe('lam=53, mu=62, c=2 (study slider defaults)', () => {
    let result;
    beforeAll(() => { result = computeMMc(53, 62, 2); });

    test('is stable', () => expect(result.stable).toBe(true));
    test('ρ ≈ 0.4274', () => expect(result.rho).toBeCloseTo(0.4274193548387097, 10));
    test('P₀ ≈ 0.4011', () => expect(result.P0).toBeCloseTo(0.4011299435028248, 8));
    test('Lq ≈ 0.1911', () => expect(result.Lq).toBeCloseTo(0.19107519181060484, 8));
    test('Wq ≈ 0.2163 min', () => expect(result.Wq).toBeCloseTo(0.21631153789879792, 8));
    test('Ws ≈ 1.1841 min', () => expect(result.Ws).toBeCloseTo(1.1840534733826689, 8));
  });

  // λ=80, μ=60, c=2 → ρ = 80/120 ≈ 0.667
  describe('lam=80, mu=60, c=2, rho≈0.667', () => {
    let result;
    beforeAll(() => { result = computeMMc(80, 60, 2); });

    test('is stable', () => expect(result.stable).toBe(true));
    test('ρ = 2/3', () => expect(result.rho).toBeCloseTo(2 / 3, 10));
    test('P₀ is positive and less than 1', () => {
      expect(result.P0).toBeGreaterThan(0);
      expect(result.P0).toBeLessThan(1);
    });
    test('Lq is non-negative', () => expect(result.Lq).toBeGreaterThanOrEqual(0));
    test('Ws > Wq (sojourn time includes service time)', () => {
      expect(result.Ws).toBeGreaterThan(result.Wq);
    });
    test('Ws − Wq = 1/μ in minutes = 1 min', () => {
      expect(result.Ws - result.Wq).toBeCloseTo(60 / 60, 10);
    });
  });
});

// ─────────────────────────────────────────────────────────
// computeMMc — M/M/3 (c = 3)
// ─────────────────────────────────────────────────────────
describe('computeMMc — M/M/3 (c = 3)', () => {
  // λ=10, μ=10, c=3 → ρ=1/3
  describe('lam=10, mu=10, c=3, rho=1/3', () => {
    let result;
    beforeAll(() => { result = computeMMc(10, 10, 3); });

    test('is stable', () => expect(result.stable).toBe(true));
    test('ρ = 1/3', () => expect(result.rho).toBeCloseTo(1 / 3, 10));
    test('P₀ = 4/11', () => expect(result.P0).toBeCloseTo(4 / 11, 10));
    test('Lq = 1/22', () => expect(result.Lq).toBeCloseTo(1 / 22, 10));
    test('Wq ≈ 0.2727 min', () => expect(result.Wq).toBeCloseTo(1 / 22 / 10 * 60, 10));
    test('Ws ≈ 6.2727 min', () => expect(result.Ws).toBeCloseTo(1 / 22 / 10 * 60 + 6, 10));
  });
});

// ─────────────────────────────────────────────────────────
// computeMMc — general invariants (any stable system)
// ─────────────────────────────────────────────────────────
describe('computeMMc — structural invariants', () => {
  const cases = [
    { lam: 10, mu: 20, c: 1, label: 'M/M/1 lam=10 mu=20' },
    { lam: 9,  mu: 10, c: 1, label: 'M/M/1 lam=9 mu=10'  },
    { lam: 10, mu: 10, c: 2, label: 'M/M/2 lam=10 mu=10' },
    { lam: 53, mu: 62, c: 2, label: 'M/M/2 lam=53 mu=62' },
    { lam: 10, mu: 10, c: 3, label: 'M/M/3 lam=10 mu=10' },
    { lam: 20, mu: 15, c: 2, label: 'M/M/2 lam=20 mu=15' },
    { lam: 5,  mu: 10, c: 5, label: 'M/M/5 lam=5 mu=10'  },
  ];

  test.each(cases)('$label: P₀ ∈ (0, 1)', ({ lam, mu, c }) => {
    const r = computeMMc(lam, mu, c);
    expect(r.P0).toBeGreaterThan(0);
    expect(r.P0).toBeLessThan(1);
  });

  test.each(cases)('$label: Lq ≥ 0', ({ lam, mu, c }) => {
    const r = computeMMc(lam, mu, c);
    expect(r.Lq).toBeGreaterThanOrEqual(0);
  });

  test.each(cases)('$label: Wq ≥ 0', ({ lam, mu, c }) => {
    const r = computeMMc(lam, mu, c);
    expect(r.Wq).toBeGreaterThanOrEqual(0);
  });

  test.each(cases)('$label: Ws > Wq', ({ lam, mu, c }) => {
    const r = computeMMc(lam, mu, c);
    expect(r.Ws).toBeGreaterThan(r.Wq);
  });

  test.each(cases)("$label: Ws \u2212 Wq = 60/\u03bc (service time component)", ({ lam, mu, c }) => {
    const r = computeMMc(lam, mu, c);
    expect(r.Ws - r.Wq).toBeCloseTo(60 / mu, 8);
  });

  test.each(cases)("$label: Little's law Lq = \u03bb\u00b7Wq/60", ({ lam, mu, c }) => {
    const r = computeMMc(lam, mu, c);
    // Wq is in minutes; λ is per hour → Lq = λ * (Wq/60)
    expect(r.Lq).toBeCloseTo(lam * (r.Wq / 60), 8);
  });

  test.each(cases)('$label: increasing c reduces Lq (adding a server helps)', ({ lam, mu, c }) => {
    const base  = computeMMc(lam, mu, c);
    const extra = computeMMc(lam, mu, c + 1);
    if (base.stable && extra.stable) {
      expect(extra.Lq).toBeLessThanOrEqual(base.Lq);
    }
  });
});

// ─────────────────────────────────────────────────────────
// computeMMc — monotonicity with load
// ─────────────────────────────────────────────────────────
describe('computeMMc — sensitivity to arrival rate', () => {
  test('higher λ → higher Lq (c=2, mu=10, lam 5→8)', () => {
    const low  = computeMMc(5,  10, 2);
    const high = computeMMc(8,  10, 2);
    expect(high.Lq).toBeGreaterThan(low.Lq);
  });

  test('higher λ → higher Wq (c=2, mu=10, lam 5→8)', () => {
    const low  = computeMMc(5,  10, 2);
    const high = computeMMc(8,  10, 2);
    expect(high.Wq).toBeGreaterThan(low.Wq);
  });

  test('higher μ → lower Lq (c=2, lam=10, mu 8→15)', () => {
    const slow = computeMMc(10, 8,  2);
    const fast = computeMMc(10, 15, 2);
    expect(fast.Lq).toBeLessThan(slow.Lq);
  });
});
