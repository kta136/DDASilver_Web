"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  clampRateFontSizeStep,
  rateFontSizePercent,
  type FlashStyle,
  type MarketDataView,
  type PersonalRateFontFamily,
} from "@/lib/rates/personal-view";

import styles from "./rate-experience.module.css";

type PersonalSettingsDrawerProps = {
  open: boolean;
  onClose: () => void;
  fontFamily: PersonalRateFontFamily;
  fontSizeStep: number;
  onFontFamilyChange: (value: PersonalRateFontFamily) => void;
  onFontSizeStepChange: (value: number) => void;
  hasBuyingRates: boolean;
  hideBuyingColumn: boolean;
  onToggleBuyingColumn: () => void;
  marketDataView: MarketDataView;
  onMarketDataViewChange: (value: MarketDataView) => void;
  marketDataFontSizeStep: number;
  onMarketDataFontSizeStepChange: (value: number) => void;
  flashStyle: FlashStyle;
  onFlashStyleChange: (value: FlashStyle) => void;
  onReset: () => void;
  onDone: () => void;
};

export function PersonalSettingsDrawer({
  open,
  onClose,
  fontFamily,
  fontSizeStep,
  onFontFamilyChange,
  onFontSizeStepChange,
  hasBuyingRates,
  hideBuyingColumn,
  onToggleBuyingColumn,
  marketDataView,
  onMarketDataViewChange,
  marketDataFontSizeStep,
  onMarketDataFontSizeStepChange,
  flashStyle,
  onFlashStyleChange,
  onReset,
  onDone,
}: PersonalSettingsDrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const frame = requestAnimationFrame(() => panelRef.current?.focus());

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown, true);
      setConfirmReset(false);
      previouslyFocused.current?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className={styles.drawerRoot}>
      <button
        type="button"
        className={styles.drawerScrim}
        aria-label="Close rate settings"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={styles.drawerPanel}
        tabIndex={-1}
      >
        <header className={styles.drawerHeader}>
          <div>
            <span className={styles.drawerEyebrow}>Personalize</span>
            <h2 id={titleId} className={styles.drawerTitle}>
              Rates display
            </h2>
          </div>
          <button
            type="button"
            className={styles.drawerClose}
            aria-label="Close settings"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className={styles.drawerBody}>
          <DrawerSection
            title="Display"
            hint="Adjust how rate numbers look. Changes save automatically."
          >
            <SizeControl
              label="Rate text size"
              value={fontSizeStep}
              onChange={onFontSizeStepChange}
            />
            <SegmentedControl
              label="Rate font"
              value={fontFamily}
              options={[
                ["sans", "Sans"],
                ["serif", "Serif"],
                ["mono", "Mono"],
              ]}
              onChange={onFontFamilyChange}
            />
            <SegmentedControl
              label="Tick flash style"
              value={flashStyle}
              options={[
                ["soft", "Soft"],
                ["bold", "Bold"],
              ]}
              onChange={onFlashStyleChange}
            />
          </DrawerSection>

          {hasBuyingRates ? (
            <DrawerSection title="Columns">
              <SettingRow
                label="Buying rate column"
                hint="Show the BUY column alongside the live rate."
              >
                <button
                  type="button"
                  className={styles.drawerActionButton}
                  onClick={onToggleBuyingColumn}
                >
                  {hideBuyingColumn ? "Show BUY" : "Hide BUY"}
                </button>
              </SettingRow>
            </DrawerSection>
          ) : null}

          <DrawerSection
            title="Market data"
            hint="Show the MCX feed below the rates as cards or a table."
          >
            <SegmentedControl
              label="Market data view"
              value={marketDataView}
              options={[
                ["cards", "Cards"],
                ["table", "Table"],
              ]}
              onChange={onMarketDataViewChange}
            />
            {marketDataView === "table" ? (
              <SizeControl
                label="Market data text size"
                value={marketDataFontSizeStep}
                onChange={onMarketDataFontSizeStepChange}
              />
            ) : null}
          </DrawerSection>

          <DrawerSection title="Layout">
            <SettingRow
              label="Reset personal view"
              hint="Restore default order, display options, and every rate."
            >
              {confirmReset ? (
                <div className={styles.resetConfirm}>
                  <button
                    type="button"
                    className={styles.drawerDangerButton}
                    onClick={() => {
                      onReset();
                      setConfirmReset(false);
                    }}
                  >
                    Confirm reset
                  </button>
                  <button
                    type="button"
                    className={styles.drawerActionButton}
                    onClick={() => setConfirmReset(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.drawerActionButton}
                  onClick={() => setConfirmReset(true)}
                >
                  Reset
                </button>
              )}
            </SettingRow>
          </DrawerSection>
        </div>

        <footer className={styles.drawerFooter}>
          <span>Drag rows in the table to reorder.</span>
          <button
            type="button"
            className={styles.drawerDone}
            aria-label="Finish editing rates table"
            onClick={onDone}
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}

function DrawerSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.drawerSection}>
      <h3>{title}</h3>
      {hint ? <p>{hint}</p> : null}
      {children}
    </section>
  );
}

function SettingRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.settingRow}>
      <span>
        <strong>{label}</strong>
        <small>{hint}</small>
      </span>
      {children}
    </div>
  );
}

function SizeControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const clamped = clampRateFontSizeStep(value);
  return (
    <div className={styles.sizeControl} role="group" aria-label={label}>
      <button
        type="button"
        aria-label={`Decrease ${label.toLocaleLowerCase("en-IN")}`}
        disabled={clamped <= -3}
        onClick={() => onChange(clampRateFontSizeStep(clamped - 1))}
      >
        A-
      </button>
      <span aria-live="polite">{rateFontSizePercent(clamped)}%</span>
      <button
        type="button"
        aria-label={`Increase ${label.toLocaleLowerCase("en-IN")}`}
        disabled={clamped >= 8}
        onClick={() => onChange(clampRateFontSizeStep(clamped + 1))}
      >
        A+
      </button>
      <button type="button" disabled={clamped === 0} onClick={() => onChange(0)}>
        Reset text size
      </button>
    </div>
  );
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<readonly [T, string]>;
  onChange: (value: T) => void;
}) {
  return (
    <div className={styles.segmentedGroup} role="group" aria-label={label}>
      {options.map(([optionValue, optionLabel]) => (
        <button
          key={optionValue}
          type="button"
          aria-pressed={value === optionValue}
          onClick={() => onChange(optionValue)}
        >
          {optionLabel}
        </button>
      ))}
    </div>
  );
}
