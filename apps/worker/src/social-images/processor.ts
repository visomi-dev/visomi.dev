import { renderPng } from './browser.js';
import { createLocalSocialImageStorage, resolveRunId } from './storage.js';

import {
  GENERATE_PAGE_SOCIAL_IMAGE_JOB_NAME,
  GENERATE_WEBSITE_SOCIAL_IMAGES_JOB_NAME,
  getAllWebsiteSocialImageTargets,
  getWebsiteSocialImageCard,
  normalizeSocialImageCard,
  renderSocialImageHtml,
  type GeneratePageSocialImageJob,
  type GenerateWebsiteSocialImagesJob,
  type SocialImageBatchResult,
  type SocialImageTarget,
} from '@visomi.dev/shared-social-images';

const storage = createLocalSocialImageStorage();

const generateArtifacts = async (targets: SocialImageTarget[], runId: string, executablePath?: string) => {
  const artifacts = [];

  for (const target of targets) {
    const artifact = await storage.prepareArtifact(runId, target);
    const card = normalizeSocialImageCard(getWebsiteSocialImageCard(target));
    const html = renderSocialImageHtml(card);

    await renderPng(html, artifact.tempFilePath, executablePath);
    artifacts.push(artifact);
  }

  return artifacts;
};

const processSocialImageJob = async (
  name: string,
  data: GeneratePageSocialImageJob | GenerateWebsiteSocialImagesJob,
  executablePath?: string,
): Promise<SocialImageBatchResult> => {
  if (name === GENERATE_PAGE_SOCIAL_IMAGE_JOB_NAME) {
    const payload = data as GeneratePageSocialImageJob;
    const runId = resolveRunId(payload.runId);
    const artifacts = await generateArtifacts([payload.target], runId, executablePath);

    return storage.finalizeRun(runId, artifacts);
  }

  if (name === GENERATE_WEBSITE_SOCIAL_IMAGES_JOB_NAME) {
    const payload = data as GenerateWebsiteSocialImagesJob;
    const runId = resolveRunId(payload.runId);
    const targets = payload.targets?.length ? payload.targets : getAllWebsiteSocialImageTargets();
    const artifacts = await generateArtifacts(targets, runId, executablePath);

    return storage.finalizeRun(runId, artifacts);
  }

  throw new Error(`Unsupported social image job: ${name}`);
};

export { processSocialImageJob };
