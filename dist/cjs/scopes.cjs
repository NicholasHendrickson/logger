"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineScopes = defineScopes;
function defineScopes(root, tree) {
    const build = (base, obj) => {
        const out = {};
        for (const k of Object.keys(obj)) {
            const v = obj[k];
            const next = `${base}/${k}`;
            out[k] = v === true ? next : build(next, v);
        }
        return out;
    };
    return build(root, tree);
}
//# sourceMappingURL=scopes.js.map