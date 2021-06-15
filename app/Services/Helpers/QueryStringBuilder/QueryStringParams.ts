export class QueryStringParams {
  constructor(private qs: Record<string, any>) {}

  public all() {
    return this.qs
  }

  public fields() {
    return this.qs.fields
  }

  public preloaders() {
    return this.toJson(this.qs.preload)
  }

  public whereIn() {
    return this.toJson(this.qs.in)
  }

  public greaterOrEquals() {
    return this.toJson(this.qs.gte)
  }

  public greaterThan() {
    return this.toJson(this.qs.gt)
  }

  public lessOrEquals() {
    return this.toJson(this.qs.lte)
  }

  public lessThan() {
    return this.toJson(this.qs.lt)
  }

  public whereBetween() {
    return this.toJson(this.qs.between)
  }

  private toJson(v: any) {
    if (typeof v === 'string') return JSON.parse(v)
    return v || undefined
  }

  public limit() {
    return this.qs.limit
  }

  public offset() {
    return this.qs.offset
  }
}
