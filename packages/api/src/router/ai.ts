/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * ai.ts
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

// Import AI provider - we need to create a way to access myProvider from the API package
// For now, we'll create a simple provider configuration here
import { createAzure } from '@ai-sdk/azure'
import { checkAndUpdateEnhanceUsage } from '@libra/auth/utils/subscription-limits'
import { log, tryCatch } from '@libra/common'
import { TRPCError } from '@trpc/server'
import { customProvider, generateText } from 'ai'
import { z } from 'zod/v4'
import { createTRPCRouter, organizationProcedure, protectedProcedure } from '../trpc'

// Environment variables access - we'll need to handle this properly
const env = {
  AZURE_RESOURCE_NAME: process.env['AZURE_RESOURCE_NAME'],
  AZURE_API_KEY: process.env['AZURE_API_KEY'],
  AZURE_DEPLOYMENT_NAME: process.env['AZURE_DEPLOYMENT_NAME'],
  AZURE_BASE_URL: process.env['AZURE_BASE_URL'],
  CLOUDFLARE_ACCOUNT_ID: process.env['CLOUDFLARE_ACCOUNT_ID'],
  CLOUDFLARE_AIGATEWAY_NAME: process.env['CLOUDFLARE_AIGATEWAY_NAME'],
  REASONING_ENABLED: process.env['REASONING_ENABLED'] === 'true',
}

// Azure configuration
type AzureConfig = {
  resourceName: string
  apiKey: string
  apiVersion: string
  baseURL?: string
}

// Only create Azure provider if required environment variables are set
const azure = env.AZURE_RESOURCE_NAME && env.AZURE_API_KEY
  ? createAzure({
      resourceName: env.AZURE_RESOURCE_NAME,
      apiKey: env.AZURE_API_KEY,
      apiVersion: 'preview',
      ...(env.AZURE_BASE_URL && {
        baseURL: (() => {
          const baseUrl = env.AZURE_BASE_URL.endsWith('/') ? env.AZURE_BASE_URL : `${env.AZURE_BASE_URL}/`
          // AI SDK v5 expects baseURL without /v1 suffix, it will add /v1{path} automatically
          return `${baseUrl}${env.CLOUDFLARE_ACCOUNT_ID}/${env.CLOUDFLARE_AIGATEWAY_NAME}/azure-openai/${env.AZURE_RESOURCE_NAME}/openai`
        })()
      })
    })
  : null

// Create AI provider
const myProvider = azure ? customProvider({
  languageModels: {
    'chat-model-reasoning-azure': azure('gpt-5-mini'),
  },
}) : null

export const aiRouter = createTRPCRouter({
  generateText: organizationProcedure
    .input(
      z.object({
        prompt: z.string().min(1, 'Prompt cannot be empty'),
        modelId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const orgId = ctx.orgId
      const context = { userId, organizationId: orgId, operation: 'generateText' }

      log.ai('info', 'Starting AI text generation', {
        ...context,
        promptLength: input.prompt.length,
        modelId: input.modelId || 'default',
        reasoningEnabled: env.REASONING_ENABLED,
      })

      const [result, error] = await tryCatch(async () => {
        // Check if AI provider is configured
        if (!myProvider) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'AI provider not configured. Please check Azure environment variables.',
          })
        }

        // Check and deduct enhance quota before processing
        const canUseEnhance = await checkAndUpdateEnhanceUsage(orgId)
        if (!canUseEnhance) {
          log.ai('warn', 'AI generation quota exceeded', context)
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              'Enhance quota exceeded. Please upgrade your plan or wait for next billing cycle.',
          })
        }

        const selectedModel = 'chat-model-reasoning-azure'

        log.ai('info', 'Processing AI prompt', {
          ...context,
          model: selectedModel,
          promptPreview: input.prompt.substring(0, 100) + (input.prompt.length > 100 ? '...' : ''),
        })

        // Generate text using AI SDK
        const result = await generateText({
          model: myProvider.languageModel(selectedModel),
          prompt: `Generate an enhanced version of this prompt (reply with only the enhanced prompt - no conversation, explanations, lead-in, bullet points, placeholders, or surrounding quotes):
                   ${input.prompt}`,
          providerOptions: {
            openai: {
              ...(env.REASONING_ENABLED ? { reasoningEffort: 'medium' } : {}),
            },
          },
        })

        log.ai('info', 'AI text generation completed successfully', {
          ...context,
          model: selectedModel,
          inputTokens: result.usage?.inputTokens || 0,
          outputTokens: result.usage?.outputTokens || 0,
          totalTokens: result.usage?.totalTokens || 0,
          finishReason: result.finishReason,
          responseLength: result.text.length,
        })

        return {
          text: result.text,
          usage: result.usage,
          finishReason: result.finishReason,
        }
      })

      if (error) {
        // Enhanced error logging with context
        if (error instanceof TRPCError) {
          if (error.code === 'FORBIDDEN') {
            // Quota errors are warnings, not system errors
            log.ai('warn', 'AI generation blocked by quota', context, error)
          } else {
            log.ai('error', 'AI generation failed with TRPC error', context, error)
          }
          throw error
        }

        // Log AI service failures as errors
        log.ai(
          'error',
          'AI service failure during text generation',
          {
            ...context,
            model: 'chat-model-reasoning-azure',
            errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          },
          error instanceof Error ? error : new Error(String(error))
        )

        // Wrap other errors
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate enhanced text',
          cause: error,
        })
      }

      return result
    }),
})
