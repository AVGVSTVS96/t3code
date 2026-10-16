import { sign as signApplication, type SignOptions } from "@electron/osx-sign";

interface Packager {
  readonly appInfo: { readonly id: string };
}

export default async function sign(options: SignOptions, packager?: Packager): Promise<void> {
  await signApplication({
    ...options,
    ...(options.identity === "-" && packager ? adHoc(options, packager.appInfo.id) : {}),
    batchCodesignCalls: true,
  });
}

// Squirrel.Mac installs an update only if it satisfies the running app's
// designated requirement. An ad-hoc signature's default requirement is its own
// cdhash, which no later build can match, so the app pins it to its bundle id.
function adHoc(options: SignOptions, appId: string): Pick<SignOptions, "optionsForFile"> {
  return {
    optionsForFile: (filePath, context) => ({
      ...options.optionsForFile?.(filePath, context),
      timestamp: "none",
      ...(filePath === options.app ? { requirements: `=designated => identifier "${appId}"` } : {}),
    }),
  };
}
