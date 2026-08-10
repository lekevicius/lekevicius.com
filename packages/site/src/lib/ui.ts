/**
 * Small, framework-free UI helpers.
 *
 * Declarative hooks:
 * - `data-tooltip="Text"` with optional `data-tooltip-title="Title"`
 * - `data-copy="Text"` with optional `data-copy-toast="Copied!"`
 * - `data-menu`, containing `data-menu-toggle` and `data-menu-panel`
 *
 * `copyText` and `showToast` are also exported for imperative use.
 */

const TOOLTIP_SELECTOR = "[data-tooltip]";
const COPY_SELECTOR = "[data-copy]";
const MENU_SELECTOR = "[data-menu]";
const MENU_TOGGLE_SELECTOR = "[data-menu-toggle]";
const MENU_PANEL_SELECTOR = "[data-menu-panel]";
const TOOLTIP_ID = "ui-tooltip";

const TOOLTIP_SHOW_DELAY = 400;
const TOOLTIP_SWITCH_GRACE_PERIOD = 250;
const TOOLTIP_TRANSITION_DURATION = 150;
const TOAST_TRANSITION_DURATION = 200;

let started = false;
let menuId = 0;

let tooltip: HTMLElement | null = null;
let tooltipTarget: HTMLElement | null = null;
let tooltipTargetDescription: string | null = null;
let tooltipTargetDescriptionCaptured = false;
let tooltipTargetWasDescribed = false;
let tooltipShowTimer: number | undefined;
let tooltipHideTimer: number | undefined;
let tooltipPositionFrame: number | undefined;
let lastTooltipCloseTime = 0;

let toast: HTMLElement | null = null;
let toastHideTimer: number | undefined;
let toastRemoveTimer: number | undefined;

const codeCopyResetTimers = new WeakMap<HTMLButtonElement, number>();

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

export async function copyText(text: string) {
  if (!navigator.clipboard?.writeText) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function showToast(message: string, duration = 2000) {
  if (!message) return;

  removeToast();

  const element = document.createElement("div");
  element.className = "toast";
  element.textContent = message;
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "polite");
  document.body.appendChild(element);
  toast = element;

  void element.offsetHeight;
  requestAnimationFrame(() => {
    if (element.isConnected) element.classList.add("toast-show");
  });

  toastHideTimer = window.setTimeout(() => {
    element.classList.add("toast-hide");
    toastRemoveTimer = window.setTimeout(() => {
      if (toast === element) toast = null;
      element.remove();
    }, TOAST_TRANSITION_DURATION);
  }, duration);
}

function removeToast() {
  if (toastHideTimer !== undefined) window.clearTimeout(toastHideTimer);
  if (toastRemoveTimer !== undefined) window.clearTimeout(toastRemoveTimer);
  toastHideTimer = undefined;
  toastRemoveTimer = undefined;
  toast?.remove();
  toast = null;
}

function getTooltip() {
  if (tooltip?.isConnected) return tooltip;

  tooltip = document.createElement("div");
  tooltip.id = TOOLTIP_ID;
  tooltip.className = "tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.hidden = true;
  document.body.appendChild(tooltip);
  return tooltip;
}

function renderTooltip(element: HTMLElement, target: HTMLElement) {
  const title = target.dataset.tooltipTitle;
  const text = target.dataset.tooltip ?? "";
  const content = document.createDocumentFragment();

  if (title) {
    const strong = document.createElement("strong");
    strong.textContent = title;
    content.append(strong, document.createElement("br"));
  }

  content.append(document.createTextNode(text));
  element.replaceChildren(content);
}

function positionTooltip() {
  tooltipPositionFrame = undefined;
  if (!tooltipTarget?.isConnected || !tooltip?.isConnected) return;

  const targetRect = tooltipTarget.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const gap = 8;
  const viewportPadding = 8;
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;

  let left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
  left = Math.max(
    viewportPadding,
    Math.min(left, viewportWidth - tooltipRect.width - viewportPadding),
  );

  let top = targetRect.top - tooltipRect.height - gap;
  if (top < viewportPadding) top = targetRect.bottom + gap;
  top = Math.max(
    viewportPadding,
    Math.min(top, viewportHeight - tooltipRect.height - viewportPadding),
  );

  tooltip.style.left = `${Math.round(left)}px`;
  tooltip.style.top = `${Math.round(top)}px`;
}

function scheduleTooltipPosition() {
  if (!tooltipTarget || tooltipPositionFrame !== undefined) return;
  tooltipPositionFrame = requestAnimationFrame(positionTooltip);
}

function describeTooltipTarget(target: HTMLElement) {
  tooltipTargetDescription = target.getAttribute("aria-describedby");
  tooltipTargetDescriptionCaptured = true;
  tooltipTargetWasDescribed = target.hasAttribute("aria-describedby");
  const descriptionIds =
    tooltipTargetDescription?.split(/\s+/).filter(Boolean) ?? [];

  if (!descriptionIds.includes(TOOLTIP_ID)) {
    target.setAttribute(
      "aria-describedby",
      [...descriptionIds, TOOLTIP_ID].join(" "),
    );
  }
}

function restoreTooltipTarget(target: HTMLElement | null) {
  if (!target || !tooltipTargetDescriptionCaptured) return;

  if (tooltipTargetWasDescribed) {
    target.setAttribute("aria-describedby", tooltipTargetDescription ?? "");
  } else {
    target.removeAttribute("aria-describedby");
  }

  tooltipTargetDescription = null;
  tooltipTargetDescriptionCaptured = false;
  tooltipTargetWasDescribed = false;
}

function openTooltip(target: HTMLElement) {
  if (!target.dataset.tooltip || target === tooltipTarget) return;

  if (tooltipTarget) closeTooltip();
  if (tooltipHideTimer !== undefined) window.clearTimeout(tooltipHideTimer);
  tooltipHideTimer = undefined;
  tooltipTarget = target;

  const timeSinceLastClose = Date.now() - lastTooltipCloseTime;
  const delay =
    timeSinceLastClose < TOOLTIP_SWITCH_GRACE_PERIOD ? 0 : TOOLTIP_SHOW_DELAY;

  tooltipShowTimer = window.setTimeout(() => {
    tooltipShowTimer = undefined;
    if (tooltipTarget !== target || !target.isConnected) return;

    const element = getTooltip();
    renderTooltip(element, target);
    describeTooltipTarget(target);
    element.hidden = false;
    positionTooltip();
    void element.offsetHeight;
    element.classList.add("tooltip-visible");
  }, delay);
}

function closeTooltip(target?: HTMLElement) {
  if (target && target !== tooltipTarget) return;
  if (tooltipShowTimer !== undefined) window.clearTimeout(tooltipShowTimer);
  if (tooltipPositionFrame !== undefined)
    cancelAnimationFrame(tooltipPositionFrame);
  tooltipShowTimer = undefined;
  tooltipPositionFrame = undefined;

  const previousTarget = tooltipTarget;
  tooltipTarget = null;
  restoreTooltipTarget(previousTarget);
  lastTooltipCloseTime = Date.now();

  if (!tooltip) return;
  tooltip.classList.remove("tooltip-visible");
  if (tooltipHideTimer !== undefined) window.clearTimeout(tooltipHideTimer);
  tooltipHideTimer = window.setTimeout(() => {
    tooltipHideTimer = undefined;
    if (!tooltipTarget && tooltip) tooltip.hidden = true;
  }, TOOLTIP_TRANSITION_DURATION);
}

function resetTooltip() {
  if (tooltipShowTimer !== undefined) window.clearTimeout(tooltipShowTimer);
  if (tooltipHideTimer !== undefined) window.clearTimeout(tooltipHideTimer);
  if (tooltipPositionFrame !== undefined)
    cancelAnimationFrame(tooltipPositionFrame);
  restoreTooltipTarget(tooltipTarget);
  tooltipShowTimer = undefined;
  tooltipHideTimer = undefined;
  tooltipPositionFrame = undefined;
  tooltipTarget = null;
  tooltip?.remove();
  tooltip = null;
}

function shouldKeepTooltipOpen(target: HTMLElement) {
  return (
    target.matches(":hover") ||
    (document.activeElement instanceof Node &&
      target.contains(document.activeElement))
  );
}

function syncMenu(menu: HTMLElement, open: boolean) {
  const toggle = menu.querySelector<HTMLElement>(MENU_TOGGLE_SELECTOR);
  const panel = menu.querySelector<HTMLElement>(MENU_PANEL_SELECTOR);
  if (!toggle || !panel) return;

  if (!panel.id) panel.id = `ui-menu-${++menuId}`;
  menu.dataset.state = open ? "open" : "closed";
  toggle.setAttribute("aria-controls", panel.id);
  toggle.setAttribute("aria-expanded", String(open));
  panel.setAttribute("aria-hidden", String(!open));
  panel.inert = !open;
}

function setMenuOpen(menu: HTMLElement, open: boolean) {
  if (open) closeMenus(menu);
  syncMenu(menu, open);
}

function closeMenus(except?: HTMLElement) {
  document
    .querySelectorAll<HTMLElement>(`${MENU_SELECTOR}[data-state="open"]`)
    .forEach((menu) => {
      if (menu !== except) syncMenu(menu, false);
    });
}

function enhanceMenus(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(MENU_SELECTOR).forEach((menu) => {
    syncMenu(menu, menu.dataset.state === "open");
  });
}

function enhanceCodeBlocks(root: ParentNode) {
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
    wrapper.appendChild(button);
  });
}

async function copyCodeBlock(button: HTMLButtonElement) {
  const pre = button
    .closest<HTMLElement>(".code-block")
    ?.querySelector<HTMLElement>("pre");
  if (!pre) return;

  const copied = await copyText(pre.textContent ?? "");
  button.innerHTML = copied ? checkIcon : copyIcon;
  button.setAttribute(
    "aria-label",
    copied ? "Code copied" : "Copy failed. Try again",
  );
  button.title = copied ? "Copied" : "Try again";

  const previousTimer = codeCopyResetTimers.get(button);
  if (previousTimer !== undefined) window.clearTimeout(previousTimer);
  const resetTimer = window.setTimeout(() => {
    button.innerHTML = copyIcon;
    button.setAttribute("aria-label", "Copy code to clipboard");
    button.title = "Copy code";
    codeCopyResetTimers.delete(button);
  }, 2500);
  codeCopyResetTimers.set(button, resetTimer);
}

async function copyFromElement(element: HTMLElement) {
  const text = element.dataset.copy;
  if (text === undefined) return;

  const copied = await copyText(text);
  showToast(
    copied
      ? (element.dataset.copyToast ?? "Copied!")
      : (element.dataset.copyError ?? "Couldn’t copy"),
  );
}

function closestElement(target: EventTarget | null, selector: string) {
  return target instanceof Element
    ? target.closest<HTMLElement>(selector)
    : null;
}

function handleDocumentClick(event: MouseEvent) {
  const codeCopyButton = closestElement(
    event.target,
    ".code-copy-button",
  ) as HTMLButtonElement | null;
  if (codeCopyButton) {
    event.preventDefault();
    void copyCodeBlock(codeCopyButton);
    return;
  }

  const copyTarget = closestElement(event.target, COPY_SELECTOR);
  if (copyTarget) {
    event.preventDefault();
    void copyFromElement(copyTarget);
    return;
  }

  const menuToggle = closestElement(event.target, MENU_TOGGLE_SELECTOR);
  if (menuToggle) {
    const menu = menuToggle.closest<HTMLElement>(MENU_SELECTOR);
    if (!menu) return;
    event.preventDefault();
    setMenuOpen(menu, menu.dataset.state !== "open");
    return;
  }

  const clickedMenu = closestElement(event.target, MENU_SELECTOR);
  if (!clickedMenu) {
    closeMenus();
  } else if (closestElement(event.target, "a[href]")) {
    setMenuOpen(clickedMenu, false);
  }
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape") return;

  const activeMenu =
    document.activeElement instanceof Element
      ? document.activeElement.closest<HTMLElement>(
          `${MENU_SELECTOR}[data-state="open"]`,
        )
      : null;
  if (!activeMenu) {
    closeMenus();
    closeTooltip();
    return;
  }

  syncMenu(activeMenu, false);
  activeMenu.querySelector<HTMLElement>(MENU_TOGGLE_SELECTOR)?.focus();
}

function handleTooltipEnter(event: MouseEvent | FocusEvent) {
  const target = closestElement(event.target, TOOLTIP_SELECTOR);
  if (!target) return;
  const relatedTarget = event.relatedTarget;
  if (relatedTarget instanceof Node && target.contains(relatedTarget)) return;
  openTooltip(target);
}

function handleTooltipLeave(event: MouseEvent | FocusEvent) {
  const target = closestElement(event.target, TOOLTIP_SELECTOR);
  if (!target) return;
  const relatedTarget = event.relatedTarget;
  if (relatedTarget instanceof Node && target.contains(relatedTarget)) return;

  requestAnimationFrame(() => {
    if (!shouldKeepTooltipOpen(target)) closeTooltip(target);
  });
}

function initializeUi(root: ParentNode = document) {
  if (tooltipTarget && !tooltipTarget.isConnected) resetTooltip();
  if (toast && !toast.isConnected) toast = null;
  enhanceMenus(root);
  enhanceCodeBlocks(root);
}

function resetTransientUi() {
  resetTooltip();
  removeToast();
}

export function startUi() {
  initializeUi();
  if (started) return;
  started = true;

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleDocumentKeydown);
  document.addEventListener("mouseover", handleTooltipEnter);
  document.addEventListener("mouseout", handleTooltipLeave);
  document.addEventListener("focusin", handleTooltipEnter);
  document.addEventListener("focusout", handleTooltipLeave);
  document.addEventListener("scroll", scheduleTooltipPosition, true);
  document.addEventListener("astro:page-load", () => initializeUi());
  document.addEventListener("astro:before-swap", resetTransientUi);
  window.addEventListener("resize", scheduleTooltipPosition);
}
