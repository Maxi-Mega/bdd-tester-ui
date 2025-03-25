export class StaticInfo {
  // @ts-expect-error
  public windowTitle: string;
  // @ts-expect-error
  public applicationTitle: string;
  // @ts-expect-error
  public faviconBase64: string;
  // @ts-expect-error
  public logoBase64: string;

  constructor() {}
}
