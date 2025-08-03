import * as React from "react";
import {
  useFloating,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  useMergeRefs,
  FloatingPortal,
  FloatingFocusManager,
  FloatingOverlay,
  useId
} from "@floating-ui/react";

interface FullscreenMenuOptions {
  initialOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useFullscreenMenu({
  initialOpen = false,
  open: controlledOpen,
  onOpenChange: setControlledOpen
}: FullscreenMenuOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);
  const [labelId, setLabelId] = React.useState<string | undefined>();
  const [descriptionId, setDescriptionId] = React.useState<
    string | undefined
  >();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    open,
    onOpenChange: setOpen
  });

  const context = data.context;

  const click = useClick(context, {
    enabled: controlledOpen == null
  });
  const dismiss = useDismiss(context, { outsidePressEvent: "mousedown" });
  const role = useRole(context);

  const interactions = useInteractions([click, dismiss, role]);

  return React.useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId
    }),
    [open, setOpen, interactions, data, labelId, descriptionId]
  );
}

type ContextType =
  | (ReturnType<typeof useFullscreenMenu> & {
    setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
    setDescriptionId: React.Dispatch<
      React.SetStateAction<string | undefined>
    >;
  })
  | null;

const FullscreenMenuContext = React.createContext<ContextType>(null);

export const useFullscreenMenuContext = () => {
  const context = React.useContext(FullscreenMenuContext);

  if (context == null) {
    throw new Error("FullscreenMenu components must be wrapped in <FullscreenMenu />");
  }

  return context;
};

export function FullscreenMenu({
  children,
  ...options
}: {
  children: React.ReactNode;
} & FullscreenMenuOptions) {
  const FullscreenMenu = useFullscreenMenu(options);
  return (
    <FullscreenMenuContext.Provider value={FullscreenMenu}>{children}</FullscreenMenuContext.Provider>
  );
}

interface FullscreenMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const FullscreenMenuTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLProps<HTMLElement> & FullscreenMenuTriggerProps
>(function FullscreenMenuTrigger({ children, asChild = false, ...props }, propRef) {
  const context = useFullscreenMenuContext();
  const childrenRef = (children as any).ref;
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

  // `asChild` allows the user to pass any element as the anchor
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children,
      context.getReferenceProps({
        ref,
        ...props,
        ...children.props,
        "data-state": context.open ? "open" : "closed"
      })
    );
  }

  return (
    <button
      ref={ref}
      // The user can style the trigger based on the state
      data-state={context.open ? "open" : "closed"}
      {...context.getReferenceProps(props)}
    >
      {children}
    </button>
  );
});

export const FullscreenMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(function FullscreenMenuContent(props, propRef) {
  const { context: floatingContext, ...context } = useFullscreenMenuContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  if (!floatingContext.open) return null;

  return (
    <FloatingPortal>
      <FloatingOverlay className="FullscreenMenu-overlay" lockScroll>
        <FloatingFocusManager context={floatingContext}>
          <div
            ref={ref}
            aria-labelledby={context.labelId}
            aria-describedby={context.descriptionId}
            {...context.getFloatingProps(props)}
          >
            {props.children}
          </div>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  );
});

export const FullscreenMenuHeading = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLProps<HTMLHeadingElement>
>(function FullscreenMenuHeading({ children, ...props }, ref) {
  const { setLabelId } = useFullscreenMenuContext();
  const id = useId();

  // Only sets `aria-labelledby` on the FullscreenMenu root element
  // if this component is mounted inside it.
  React.useLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  return (
    <h2 {...props} ref={ref} id={id}>
      {children}
    </h2>
  );
});

export const FullscreenMenuDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLProps<HTMLParagraphElement>
>(function FullscreenMenuDescription({ children, ...props }, ref) {
  const { setDescriptionId } = useFullscreenMenuContext();
  const id = useId();

  // Only sets `aria-describedby` on the FullscreenMenu root element
  // if this component is mounted inside it.
  React.useLayoutEffect(() => {
    setDescriptionId(id);
    return () => setDescriptionId(undefined);
  }, [id, setDescriptionId]);

  return (
    <p {...props} ref={ref} id={id}>
      {children}
    </p>
  );
});

export const FullscreenMenuClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function FullscreenMenuClose(props, ref) {
  const { setOpen } = useFullscreenMenuContext();
  return (
    <button type="button" {...props} ref={ref} onClick={() => setOpen(false)} />
  );
});
