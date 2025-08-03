import * as React from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  // flip,
  shift,
  useHover,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  useTransitionStyles,
  useMergeRefs,
  type Placement,
  FloatingPortal,
  FloatingFocusManager,
  useId
} from "@floating-ui/react";

interface DropdownOptions {
  initialOpen?: boolean;
  placement?: Placement;
  modal?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useDropdown({
  initialOpen = false,
  placement = "bottom-start",
  modal,
  open: controlledOpen,
  onOpenChange: setControlledOpen
}: DropdownOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);
  const [labelId, setLabelId] = React.useState<string | undefined>();
  const [descriptionId, setDescriptionId] = React.useState<
    string | undefined
  >();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset({
        mainAxis: 4,
        crossAxis: -8
      }),
      // flip({
      //   crossAxis: placement.includes("-"),
      //   fallbackAxisSideDirection: "end",
      //   padding: 5
      // }),
      shift({ padding: 5 })
    ]
  });

  const context = data.context;

  // const hover = useHover(context, {
  //   enabled: controlledOpen == null,
  //   delay: {
  //     open: 75,
  //     close: 200,
  //   },
  //   mouseOnly: true
  // });
  const click = useClick(context, {
    enabled: controlledOpen == null,
    toggle: true,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const interactions = useInteractions([click, dismiss, role]);

  return React.useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      modal,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId
    }),
    [open, setOpen, interactions, data, modal, labelId, descriptionId]
  );
}

type ContextType =
  | (ReturnType<typeof useDropdown> & {
    setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
    setDescriptionId: React.Dispatch<
      React.SetStateAction<string | undefined>
    >;
  })
  | null;

const DropdownContext = React.createContext<ContextType>(null);

export const useDropdownContext = () => {
  const context = React.useContext(DropdownContext);

  if (context == null) {
    throw new Error("Dropdown components must be wrapped in <Dropdown />");
  }

  return context;
};

export function Dropdown({
  children,
  modal = false,
  ...restOptions
}: {
  children: React.ReactNode;
} & DropdownOptions) {
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const Dropdown = useDropdown({ modal, ...restOptions });
  return (
    <DropdownContext.Provider value={Dropdown}>
      {children}
    </DropdownContext.Provider>
  );
}

interface DropdownTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const DropdownTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLProps<HTMLElement> & DropdownTriggerProps
>(function DropdownTrigger({ children, asChild = false, ...props }, propRef) {
  const context = useDropdownContext();
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
      type="button"
      // The user can style the trigger based on the state
      data-state={context.open ? "open" : "closed"}
      {...context.getReferenceProps(props)}
    >
      {children}
    </button>
  );
});

export const DropdownContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(function DropdownContent({ style, ...props }, propRef) {
  const { context: floatingContext, ...context } = useDropdownContext();
  const { styles: transitionStyles } = useTransitionStyles(floatingContext, {
    initial: {
      opacity: 0,
      transform: 'translate(0, -16px) scaleY(0.95)',
    },
    common: ({ side }) => ({
      transformOrigin: {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left',
      }[side],
    }),
  });
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  if (!floatingContext.open) return null;

  return (
    <FloatingPortal>
      <FloatingFocusManager context={floatingContext} modal={context.modal}>
        <div
          ref={ref}
          style={{ ...context.floatingStyles }}
          aria-labelledby={context.labelId}
          aria-describedby={context.descriptionId}
          {...context.getFloatingProps(props)}
        >
          <div style={{
            ...transitionStyles,
            ...style
          }} className="Dropdown px-2 py-2">
            {props.children}
          </div>
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
});

export const DropdownHeading = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLProps<HTMLHeadingElement>
>(function DropdownHeading(props, ref) {
  const { setLabelId } = useDropdownContext();
  const id = useId();

  // Only sets `aria-labelledby` on the Dropdown root element
  // if this component is mounted inside it.
  React.useLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  return (
    <h2 {...props} ref={ref} id={id}>
      {props.children}
    </h2>
  );
});

export const DropdownDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLProps<HTMLParagraphElement>
>(function DropdownDescription(props, ref) {
  const { setDescriptionId } = useDropdownContext();
  const id = useId();

  // Only sets `aria-describedby` on the Dropdown root element
  // if this component is mounted inside it.
  React.useLayoutEffect(() => {
    setDescriptionId(id);
    return () => setDescriptionId(undefined);
  }, [id, setDescriptionId]);

  return <p {...props} ref={ref} id={id} />;
});

export const DropdownClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function DropdownClose(props, ref) {
  const { setOpen } = useDropdownContext();
  return (
    <button
      type="button"
      ref={ref}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        setOpen(false);
      }}
    />
  );
});
