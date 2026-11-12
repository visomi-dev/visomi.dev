import { UnrecoverableError } from 'bullmq';

import { socialImagePageInput, socialImageWebsiteInput } from '@visomi.dev/shared-social-images/validation';
import {
  GENERATE_PAGE_SOCIAL_IMAGE_JOB_NAME,
  GENERATE_WEBSITE_SOCIAL_IMAGES_JOB_NAME,
} from '@visomi.dev/shared-social-images/types';
import {
  getAllWebsiteSocialImageTargets,
  getWebsiteSocialImageCard,
} from '@visomi.dev/shared-social-images/website-pages';
import { normalizeSocialImageCard } from '@visomi.dev/shared-social-images/rules';
import { renderSocialImageHtml } from '@visomi.dev/shared-social-images/template';
import type { SocialImageBatchResult, SocialImageTarget } from '@visomi.dev/shared-social-images/types';

import { renderPng } from './browser';
import { createLocalSocialImageStorage, resolveRunId } from './storage';

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
  data: unknown,
  executablePath?: string,
): Promise<SocialImageBatchResult> => {
  if (name === GENERATE_PAGE_SOCIAL_IMAGE_JOB_NAME) {
    const parsed = socialImagePageInput.safeParse(data);

    if (!parsed.success) {
      throw new UnrecoverableError('social_image_input_invalid');
    }

    const payload = parsed.data;
    const runId = resolveRunId(payload.runId);
    const artifacts = await generateArtifacts([payload.target], runId, executablePath);

    return storage.finalizeRun(runId, artifacts);
  }

  if (name === GENERATE_WEBSITE_SOCIAL_IMAGES_JOB_NAME) {
    const parsed = socialImageWebsiteInput.safeParse(data);

    if (!parsed.success) {
      throw new UnrecoverableError('social_image_input_invalid');
    }

    const payload = parsed.data;
    const runId = resolveRunId(payload.runId);
    const targets = payload.targets?.length ? payload.targets : getAllWebsiteSocialImageTargets();
    const artifacts = await generateArtifacts(targets, runId, executablePath);

    return storage.finalizeRun(runId, artifacts);
  }

  throw new UnrecoverableError('social_image_job_invalid');
};

export { processSocialImageJob };
