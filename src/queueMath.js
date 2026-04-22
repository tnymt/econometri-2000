/**
 * Pure mathematical functions for M/M/c queuing theory calculations.
 * These functions mirror the logic embedded in index.html's interactive
 * calculator so that the core formulae can be unit-tested independently
 * of the DOM.
 */

'use strict';

/**
 * Computes n! (factorial) for a non-negative integer n.
 *
 * @param {number} n - Non-negative integer.
 * @returns {number} n!
 */
function factorial(n) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/**
 * Computes M/M/c queue performance metrics.
 *
 * The model assumes:
 *   - Poisson arrivals at rate λ (lam) customers/hour
 *   - Exponential service times; each of the c servers has rate μ (mu)
 *     customers/hour
 *   - FCFS discipline, infinite queue capacity, infinite population
 *
 * When the system utilisation ρ = λ/(c·μ) ≥ 1 the queue is unstable and
 * only { stable: false, rho } is returned.
 *
 * @param {number} lam - Arrival rate λ (customers/hour).
 * @param {number} mu  - Per-server service rate μ (customers/hour).
 * @param {number} c   - Number of parallel servers (positive integer).
 * @returns {{ stable: boolean, rho: number, P0?: number, Lq?: number, Wq?: number, Ws?: number }}
 */
function computeMMc(lam, mu, c) {
  const r   = lam / mu;   // traffic intensity (Erlang)
  const rho = r / c;      // server utilisation

  if (rho >= 1) {
    return { stable: false, rho };
  }

  // P0: probability that the system is empty
  let sum = 0;
  for (let n = 0; n < c; n++) sum += Math.pow(r, n) / factorial(n);
  const last = Math.pow(r, c) / (factorial(c) * (1 - rho));
  const P0 = 1 / (sum + last);

  // Lq: expected number of customers waiting in queue
  const Lq = (Math.pow(r, c + 1) * P0) / (factorial(c - 1) * Math.pow(c - r, 2));

  // Wq: expected waiting time in queue (minutes)
  const Wq = (Lq / lam) * 60;

  // Ws: expected time in system / sojourn time (minutes)
  const Ws = Wq + 60 / mu;

  return { stable: true, rho, P0, Lq, Wq, Ws };
}

module.exports = { factorial, computeMMc };
