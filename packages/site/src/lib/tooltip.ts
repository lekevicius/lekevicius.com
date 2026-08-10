import {
  computePosition,
  autoUpdate,
  offset,
  flip,
  shift,
} from "@floating-ui/dom";

type TooltipPair = {
  ref: HTMLElement;
  float: HTMLElement;
  cleanup: (() => void) | null;
  showTimeout: ReturnType<typeof setTimeout> | null;
};

const SHOW_DELAY = 400;
const SWITCH_GRACE_PERIOD = 250;

let lastCloseTime = 0;

function setOpen(t: TooltipPair, open: boolean) {
  // Clear any pending show timeout
  if (t.showTimeout) {
    clearTimeout(t.showTimeout);
    t.showTimeout = null;
  }

  if (!open) {
    t.float.classList.remove("tt-float-visible");
    lastCloseTime = Date.now();

    // Delay hiding until transition completes
    setTimeout(() => {
      if (!t.float.classList.contains("tt-float-visible")) {
        t.float.hidden = true;
        t.cleanup?.();
        t.cleanup = null;
      }
    }, 150);
    return;
  }

  // Skip delay if switching quickly between tooltips
  const timeSinceLastClose = Date.now() - lastCloseTime;
  const delay = timeSinceLastClose < SWITCH_GRACE_PERIOD ? 0 : SHOW_DELAY;

  t.showTimeout = setTimeout(() => {
    t.float.hidden = false;
    // Force reflow before adding visible class for transition
    void t.float.offsetHeight;
    t.float.classList.add("tt-float-visible");

    const update = async () => {
      const { x, y } = await computePosition(t.ref, t.float, {
        placement: "top",
        middleware: [offset(8), flip(), shift({ padding: 8 })].filter(
          Boolean,
        ) as any,
      });

      Object.assign(t.float.style, { left: `${x}px`, top: `${y}px` });
    };

    update();
    t.cleanup = autoUpdate(t.ref, t.float, update);
  }, delay);
}

export function wireTooltips(root: ParentNode = document) {
  const refs = root.querySelectorAll<HTMLElement>(".tt-ref");

  for (const ref of refs) {
    const float = ref.parentElement?.querySelector<HTMLElement>(".tt-float");
    if (!float) continue;

    const t: TooltipPair = { ref, float, cleanup: null, showTimeout: null };

    const open = () => setOpen(t, true);
    const close = () => setOpen(t, false);

    ref.addEventListener("mouseenter", open);
    ref.addEventListener("mouseleave", close);
    ref.addEventListener("focusin", open);
    ref.addEventListener("focusout", close);
  }
}
