import { copyFile } from 'node:fs/promises';

import {
  ensureParentDirectory,
  getWebsiteBuiltAssetPath,
  getWebsiteBuiltAssetRoot,
  getWebsitePublicAssetPath,
  getWebsitePublicAssetRoot,
  pathExists,
  readSocialImageManifest,
} from './paths';

type PromotionTarget = {
  destinationPath: string;
  kind: 'build' | 'source';
  publicRelativePath: string;
};

type PromotionResult = {
  copied: PromotionTarget[];
  missingTargets: Array<'build' | 'source'>;
  runId: string;
};

const promoteSocialImageRun = async (runId: string): Promise<PromotionResult> => {
  const manifest = await readSocialImageManifest(runId);
  const copied: PromotionTarget[] = [];
  const sourceAvailable = await pathExists(getWebsitePublicAssetRoot());
  const buildAvailable = await pathExists(getWebsiteBuiltAssetRoot());

  for (const artifact of manifest.artifacts) {
    if (sourceAvailable) {
      const destinationPath = getWebsitePublicAssetPath(artifact);

      await ensureParentDirectory(destinationPath);
      await copyFile(artifact.tempFilePath, destinationPath);
      copied.push({ destinationPath, kind: 'source', publicRelativePath: artifact.publicRelativePath });
    }

    if (buildAvailable) {
      const destinationPath = getWebsiteBuiltAssetPath(artifact);

      await ensureParentDirectory(destinationPath);
      await copyFile(artifact.tempFilePath, destinationPath);
      copied.push({ destinationPath, kind: 'build', publicRelativePath: artifact.publicRelativePath });
    }
  }

  return {
    copied,
    missingTargets: [sourceAvailable ? null : 'source', buildAvailable ? null : 'build'].filter(
      (value): value is 'build' | 'source' => value !== null,
    ),
    runId,
  };
};

export { promoteSocialImageRun };
