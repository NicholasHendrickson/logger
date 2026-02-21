import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useContext, useMemo } from "react";
import { logger as singletonLogger } from "../singleton";
/**
 * React adapter: provides a logger instance via context.
 * This is optional — core logger is NOT React-dependent.
 */
const LoggerContext = createContext(null);
export function LoggerProvider(props) {
    const value = useMemo(() => props.logger ?? singletonLogger, [props.logger]);
    return _jsx(LoggerContext.Provider, { value: value, children: props.children });
}
export function useLogger(scope) {
    const ctx = useContext(LoggerContext);
    const base = ctx ?? singletonLogger;
    return useMemo(() => (scope ? base.child(scope) : base), [base, scope]);
}
//# sourceMappingURL=react.js.map