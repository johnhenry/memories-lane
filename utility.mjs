// Parse command line arguments
const args = process.argv.slice(2);
const debug = args.includes("--debug");
// Helper functions for logging
export const log = debug
  ? (...args) => console.error("[DEBUG]", ...args)
  : () => {};
