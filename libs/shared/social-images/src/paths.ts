import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

import type { SocialImageArtifact, SocialImageBatchResult, SocialImageTarget } from './types';

const DEFAULT_SOCIAL_IMAGE_TEMP_DIR = 'tmp/og-images';

const getWorkspaceRoot = () => process.env['WORKSPACE_ROOT'] ?? process.cwd();

const createSocialImageRunId = () => randomUUID();

const getSocialImageTempRoot = () => {
  const configuredPath = process.env['OG_IMAGE_STORAGE_DIR']?.trim();

  return resolve(
    getWorkspaceRoot(),
    configuredPath && configuredPath.length > 0 ? configuredPath : DEFAULT_SOCIAL_IMAGE_TEMP_DIR,
  );
};

const getSocialImageRunDirectory = (runId: string) => resolve(getSocialImageTempRoot(), runId);

const getSocialImagePublicRelativePath = ({ locale, page }: SocialImageTarget) => `images/seo/${locale}/${page}.png`;

const getSocialImageTempFilePath = (runId: string, target: SocialImageTarget) =>
  resolve(getSocialImageRunDirectory(runId), target.locale, `${target.page}.png`);

const getSocialImageManifestPath = (runId: string) => resolve(getSocialImageRunDirectory(runId), 'manifest.json');

const getWebsitePublicAssetPath = (target: SocialImageTarget) =>
  resolve(getWorkspaceRoot(), 'apps/website/public', getSocialImagePublicRelativePath(target));

const getWebsitePublicAssetRoot = () => resolve(getWorkspaceRoot(), 'apps/website/public');

const getWebsiteBuiltAssetPath = (target: SocialImageTarget) =>
  resolve(getWorkspaceRoot(), 'dist/apps/website/client', getSocialImagePublicRelativePath(target));

const getWebsiteBuiltAssetRoot = () => resolve(getWorkspaceRoot(), 'dist/apps/website/client');

const ensureParentDirectory = async (filePath: string) => {
  await mkdir(dirname(filePath), { recursive: true });
};

const writeSocialImageManifest = async (result: SocialImageBatchResult) => {
  const manifestPath = getSocialImageManifestPath(result.runId);

  await ensureParentDirectory(manifestPath);
  await writeFile(manifestPath, JSON.stringify(result, null, 2));

  return manifestPath;
};

const readSocialImageManifest = async (runId: string) => {
  const manifestPath = getSocialImageManifestPath(runId);
  const manifestContent = await readFile(manifestPath, 'utf8');

  return JSON.parse(manifestContent) as SocialImageBatchResult;
};

const pathExists = async (filePath: string) => {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
};

const createArtifactRecord = (runId: string, target: SocialImageTarget): SocialImageArtifact => ({
  locale: target.locale,
  page: target.page,
  publicRelativePath: getSocialImagePublicRelativePath(target),
  tempFilePath: getSocialImageTempFilePath(runId, target),
});

export {
  createArtifactRecord,
  createSocialImageRunId,
  ensureParentDirectory,
  getSocialImageManifestPath,
  getSocialImageRunDirectory,
  getSocialImageTempFilePath,
  getSocialImageTempRoot,
  getWebsiteBuiltAssetPath,
  getWebsiteBuiltAssetRoot,
  getWebsitePublicAssetPath,
  getWebsitePublicAssetRoot,
  pathExists,
  readSocialImageManifest,
  writeSocialImageManifest,
};
