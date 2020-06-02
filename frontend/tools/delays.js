export const BURST_MS = 5;
export const WAIT_MS = 1;

let lastBurstStart = 0;

export async function burstingDelay() {
  if (Date.now() - lastBurstStart > BURST_MS) {
    await realDelay();
    lastBurstStart = Date.now();
  }
}

function realDelay() {
  return new Promise(resolve => setTimeout(resolve, WAIT_MS));
}
