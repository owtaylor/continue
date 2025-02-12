import { ConfigResult, AssistantUnrolled } from "@continuedev/config-yaml";

import { ControlPlaneClient } from "../../control-plane/client.js";
import { ContinueConfig, IDE, IdeSettings, ILLMLogger } from "../../index.js";

import { ProfileDescription } from "../ProfileLifecycleManager.js";

import doLoadConfig from "./doLoadConfig.js";
import { IProfileLoader } from "./IProfileLoader.js";

/**
 * Metadata about the package that is currently being loaded
 * If this is `undefined`, it's not a config from the platform,
 * could be local for example.
 */
export interface PlatformConfigMetadata {
  ownerSlug: string;
  packageSlug: string;
}

export default class PlatformProfileLoader implements IProfileLoader {
  static RELOAD_INTERVAL = 1000 * 5; // 5 seconds

  description: ProfileDescription;

  constructor(
    private configResult: ConfigResult<AssistantUnrolled>,
    private readonly ownerSlug: string,
    private readonly packageSlug: string,
    private readonly iconUrl: string,
    versionSlug: string,
    private readonly controlPlaneClient: ControlPlaneClient,
    private readonly ide: IDE,
    private ideSettingsPromise: Promise<IdeSettings>,
    private llmLogger: ILLMLogger,
    private readonly onReload: () => void,
  ) {
    this.description = {
      id: `${ownerSlug}/${packageSlug}`,
      profileType: "platform",
      fullSlug: {
        ownerSlug,
        packageSlug,
        versionSlug,
      },
      title: configResult.config?.name ?? `${ownerSlug}/${packageSlug}`,
      errors: configResult.errors,
      iconUrl: this.iconUrl,
    };
  }

  async doLoadConfig(): Promise<ConfigResult<ContinueConfig>> {
    if (this.configResult.errors?.length) {
      return {
        config: undefined,
        errors: this.configResult.errors,
        configLoadInterrupted: false,
      };
    }

    const results = await doLoadConfig(
      this.ide,
      this.ideSettingsPromise,
      this.controlPlaneClient,
      this.llmLogger,
      undefined,
      this.configResult.config,
      {
        ownerSlug: this.ownerSlug,
        packageSlug: this.packageSlug,
      },
      this.description.id,
    );

    return {
      ...results,
      errors: [], // Don't do config validation here, it happens in admin panel
    };
  }

  setIsActive(isActive: boolean): void {}
}
