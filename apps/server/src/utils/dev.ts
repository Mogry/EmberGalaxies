export const DEV_MODE = process.env.DEV_MODE === 'true';

export function devBuildTimeMultiplier(): number {
  return DEV_MODE ? 0.1 : 1;
}
