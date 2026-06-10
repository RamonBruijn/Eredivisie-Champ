// Central ad switchboard.
// Flip these back to `true` when ads become useful/rendabel again.
export const ADS_ENABLED = false;
export const SECOND_HALF_AD_GATE_ENABLED = false;

export function shouldLoadAdScripts() {
  return ADS_ENABLED;
}

export function shouldUseSecondHalfAdGate() {
  return ADS_ENABLED && SECOND_HALF_AD_GATE_ENABLED;
}
