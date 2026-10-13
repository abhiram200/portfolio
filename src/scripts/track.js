// Visitor analytics events, sent to GoatCounter (abhiram.goatcounter.com).
// Only the name of the action is sent, never anything a visitor typed.
// GoatCounter ignores localhost, so local testing isn't counted.
export function track(name, title = name) {
  try {
    window.goatcounter?.count?.({ path: name, title, event: true });
  } catch {
    /* analytics must never break the page */
  }
}
