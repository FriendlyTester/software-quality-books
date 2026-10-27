// A creator persists a model produced by a builder and returns what was created
export interface Creator<TModel, TResult> {
  create(model: TModel): Promise<TResult>
}
