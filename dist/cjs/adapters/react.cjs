"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerProvider = LoggerProvider;
exports.useLogger = useLogger;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const singleton_1 = require("../singleton");
/**
 * React adapter: provides a logger instance via context.
 * This is optional — core logger is NOT React-dependent.
 */
const LoggerContext = (0, react_1.createContext)(null);
function LoggerProvider(props) {
    const value = (0, react_1.useMemo)(() => props.logger ?? singleton_1.logger, [props.logger]);
    return (0, jsx_runtime_1.jsx)(LoggerContext.Provider, { value: value, children: props.children });
}
function useLogger(scope) {
    const ctx = (0, react_1.useContext)(LoggerContext);
    const base = ctx ?? singleton_1.logger;
    return (0, react_1.useMemo)(() => (scope ? base.child(scope) : base), [base, scope]);
}
//# sourceMappingURL=react.js.map