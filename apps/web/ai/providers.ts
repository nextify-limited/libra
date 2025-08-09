/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * providers.ts
 * Copyright (C) 2025 Nextify Limited
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 */

import { env } from '@/env.mjs'
import { DEFAULT_AZURE_DEPLOYMENT } from '@/configs/ai-models'
import { anthropic } from '@ai-sdk/anthropic'
import { createAzure } from '@ai-sdk/azure'
import { xai } from '@ai-sdk/xai'
import { createOpenRouter, openrouter } from '@openrouter/ai-sdk-provider'
import { customProvider } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

/**
 * Define the configuration type, ensuring the baseURL type is correct.
 */
type AzureConfig = {
  resourceName: string
  apiKey: string
  apiVersion: string
  baseURL?: string // Set as optional property
}

/**
 * Decide configuration options based on whether AZURE_BASE_URL exists.
 */
const azureConfig: AzureConfig = {
  resourceName: env.AZURE_RESOURCE_NAME || '',
  apiKey: env.AZURE_API_KEY || '',
  apiVersion: 'preview',
}

/**
 * Only add custom baseURL if AZURE_BASE_URL exists.
 */
if (env.AZURE_BASE_URL) {
  // Fix URL concatenation, ensure no line breaks and correct path structure
  const baseUrl = env.AZURE_BASE_URL.endsWith('/') ? env.AZURE_BASE_URL : `${env.AZURE_BASE_URL}/`
  const accountId = env.CLOUDFLARE_ACCOUNT_ID
  const gatewayName = env.CLOUDFLARE_AIGATEWAY_NAME
  const resourceName = env.AZURE_RESOURCE_NAME

  // Construct the complete baseURL for AI SDK v5, ensuring correct path separators
  // AI SDK v5 expects baseURL without /v1 suffix, it will add /v1{path} automatically
  azureConfig.baseURL = `${baseUrl}${accountId}/${gatewayName}/azure-openai/${resourceName}/openai`
} else {
}

const azure = createAzure(azureConfig)

/**
 * OpenRouter configuration for Claude and Gemini models
 */
const openrouterConfig = {
  apiKey: env.OPENROUTER_API_KEY || '',
  headers: {
    'HTTP-Referer': 'https://libra.dev',
    'X-Title': 'Libra AI',
  },
}

const openrouterProvider = createOpenRouter(openrouterConfig)

/**
 * Databricks Claude configuration using OpenAI-compatible endpoint
 */
const databricksClaude = createOpenAI({
  baseURL: env.DATABRICKS_BASE_URL,
  apiKey: env.DATABRICKS_TOKEN,
})

/**
 * Provider separation architecture:
 * - Azure OpenAI: All OpenAI models (gpt-4, etc.)
 * - OpenRouter: Claude and Gemini models
 * - Databricks: Claude models via OpenAI-compatible endpoint
 * - XAI: Grok models (kept for compatibility)
 */
export const myProvider = customProvider({
  languageModels: {

    // Azure OpenAI models
    'chat-model-reasoning-azure': azure(DEFAULT_AZURE_DEPLOYMENT),
    'chat-model-reasoning-azure-mini': azure('gpt-5-mini'),
    'chat-model-reasoning-azure-nano': azure('gpt-5-nano'),
    // Databricks Claude models
    'chat-model-databricks-claude': databricksClaude('databricks-claude-3-7-sonnet'),
    'chat-model-reasoning-anthropic': openrouterProvider('anthropic/claude-sonnet-4'),
    'chat-model-reasoning-google': openrouterProvider('google/gemini-2.5-pro-preview'),

    // XAI models (kept for compatibility)
    'chat-model-reasoning-xai': xai('grok-3-fast-beta'),
  },
  imageModels: {
    'small-model-xai': xai.image('grok-2-image'),
  },
})
