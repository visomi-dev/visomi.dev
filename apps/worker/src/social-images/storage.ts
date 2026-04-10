import { writeFile } from 'node:fs/promises';

import {
  createArtifactRecord,
  createSocialImageRunId,
  ensureParentDirectory,
  SOCIAL_IMAGE_RULES,
  writeSocialImageManifest,
} from '@visomi.dev/shared-social-images';
import type { SocialImageArtifact, SocialImageBatchResult, SocialImageTarget } from '@visomi.dev/shared-social-images';

type SocialImageStorage = {
  finalizeRun: (runId: string, artifacts: SocialImageArtifact[]) => Promise<SocialImageBatchResult>;
  prepareArtifact: (runId: string, target: SocialImageTarget) => Promise<SocialImageArtifact>;
};

const createLocalSocialImageStorage = (): SocialImageStorage => ({
  finalizeRun: async (runId, artifacts) => {
    const result: SocialImageBatchResult = {
      artifacts,
      generatedAt: new Date().toISOString(),
      manifestPath: '',
      ruleSet: SOCIAL_IMAGE_RULES,
      runId,
    };
    const manifestPath = await writeSocialImageManifest(result);

    return {
      ...result,
      manifestPath,
    };
  },
  prepareArtifact: async (runId, target) => {
    const artifact = createArtifactRecord(runId, target);

    await ensureParentDirectory(artifact.tempFilePath);
    await writeFile(artifact.tempFilePath, '');

    return artifact;
  },
});

const resolveRunId = (runId?: string) => runId ?? createSocialImageRunId();

export { createLocalSocialImageStorage, resolveRunId };
export type { SocialImageStorage };
