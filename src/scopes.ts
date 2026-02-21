// logging/src/scopes.ts
export type ScopeTree = {
    readonly [k: string]: true | ScopeTree;
};
  
type BuiltScopes<T extends ScopeTree, Root extends string> = {
readonly [K in keyof T]:
    T[K] extends true
    ? `${Root}/${Extract<K, string>}`
    : T[K] extends ScopeTree
        ? BuiltScopes<T[K], `${Root}/${Extract<K, string>}`>
        : never;
};
  
export function defineScopes<const Root extends string, const T extends ScopeTree>(
    root: Root,
    tree: T
): BuiltScopes<T, Root> {
    const build = (base: string, obj: any): any => {
        const out: any = {};
        for (const k of Object.keys(obj)) {
        const v = obj[k];
        const next = `${base}/${k}`;
        out[k] = v === true ? next : build(next, v);
        }
        return out;
    };
    return build(root, tree);
}
  