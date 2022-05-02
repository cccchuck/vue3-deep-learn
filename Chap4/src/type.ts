export type IDeps = Set<Function>;

export interface IEffectFn extends Function {
  deps: IDeps[];
}
