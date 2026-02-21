import React, { createContext, useContext, useMemo } from "react";
import type { Logger } from "../types";
import { logger as singletonLogger } from "../singleton";

/**
 * React adapter: provides a logger instance via context.
 * This is optional — core logger is NOT React-dependent.
 */
const LoggerContext = createContext<Logger | null>(null);

export function LoggerProvider(props: { logger?: Logger; children: React.ReactNode }) {
  const value = useMemo(() => props.logger ?? singletonLogger, [props.logger]);
  return <LoggerContext.Provider value={value}>{props.children}</LoggerContext.Provider>;
}

export function useLogger(scope?: string): Logger {
  const ctx = useContext(LoggerContext);
  const base = ctx ?? singletonLogger;
  return useMemo(() => (scope ? base.child(scope) : base), [base, scope]);
}
