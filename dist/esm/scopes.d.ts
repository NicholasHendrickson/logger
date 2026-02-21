export type ScopeTree = {
    readonly [k: string]: true | ScopeTree;
};
type BuiltScopes<T extends ScopeTree, Root extends string> = {
    readonly [K in keyof T]: T[K] extends true ? `${Root}/${Extract<K, string>}` : T[K] extends ScopeTree ? BuiltScopes<T[K], `${Root}/${Extract<K, string>}`> : never;
};
export declare function defineScopes<const Root extends string, const T extends ScopeTree>(root: Root, tree: T): BuiltScopes<T, Root>;
export {};
//# sourceMappingURL=scopes.d.ts.map