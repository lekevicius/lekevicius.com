const copyText = async (text: string) => {
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const copyIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect width="14" height="14" x="8" y="8" rx="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
`;

const checkIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m5 12 4 4L19 6" />
  </svg>
`;

export const wireProse = (root: ParentNode) => {
  root.querySelectorAll<HTMLElement>(".prose pre").forEach((pre) => {
    if (pre.dataset.copyReady === "true") return;

    const wrapper = document.createElement("div");
    wrapper.className = "code-block";
    pre.before(wrapper);
    wrapper.appendChild(pre);
    pre.dataset.copyReady = "true";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy-button";
    button.innerHTML = copyIcon;
    button.setAttribute("aria-label", "Copy code to clipboard");
    button.title = "Copy code";
    button.setAttribute("aria-live", "polite");

    button.addEventListener("click", async () => {
      const copied = await copyText(pre.textContent ?? "");
      button.innerHTML = copied ? checkIcon : copyIcon;
      button.setAttribute(
        "aria-label",
        copied ? "Code copied" : "Copy failed. Try again",
      );
      button.title = copied ? "Copied" : "Try again";

      window.setTimeout(() => {
        button.innerHTML = copyIcon;
        button.setAttribute("aria-label", "Copy code to clipboard");
        button.title = "Copy code";
      }, 2500);
    });

    wrapper.appendChild(button);
  });
};
