import { sign as signApplication, type SignOptions } from "@electron/osx-sign";
import { expect, it, vi } from "vite-plus/test";

import sign from "./sign-macos.ts";

vi.mock("@electron/osx-sign", () => ({ sign: vi.fn() }));

it("batches codesign calls without changing existing signing options", async () => {
  const options = {
    app: "/tmp/T3 Code.app",
    identity: "Developer ID Application: T3 Tools, Inc.",
    keychain: "/tmp/t3code.keychain",
    provisioningProfile: "/tmp/t3code.provisionprofile",
    optionsForFile: () => ({
      entitlements: "/tmp/t3code.entitlements.plist",
      hardenedRuntime: true,
    }),
  } satisfies SignOptions;

  await sign(options);

  expect(signApplication).toHaveBeenCalledExactlyOnceWith({
    ...options,
    batchCodesignCalls: true,
  });
});

it("pins ad-hoc builds to their bundle id so later builds can update them", async () => {
  const options = {
    app: "/tmp/T3 Code.app",
    identity: "-",
    optionsForFile: () => ({ entitlements: "/tmp/t3code.entitlements.plist" }),
  } satisfies SignOptions;

  await sign(options, { appInfo: { id: "com.t3tools.t3code" } });

  const { optionsForFile } = vi.mocked(signApplication).mock.lastCall![0];
  const context = { platform: "darwin" } as const;
  expect(optionsForFile!("/tmp/T3 Code.app", context)).toEqual({
    entitlements: "/tmp/t3code.entitlements.plist",
    timestamp: "none",
    requirements: '=designated => identifier "com.t3tools.t3code"',
  });
  expect(
    optionsForFile!("/tmp/T3 Code.app/Contents/Frameworks/T3 Code Helper.app", context),
  ).toEqual({ entitlements: "/tmp/t3code.entitlements.plist", timestamp: "none" });
});
