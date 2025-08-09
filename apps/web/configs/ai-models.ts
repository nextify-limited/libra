/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * ai-models.ts
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

// AI model type definitions
type AIModelProvider = 'anthropic' | 'openai' | 'google'

// Plan types for subscription requirements
export const PLAN_TYPES = {
  FREE: 'libra free',
  PRO: 'libra pro',
  MAX: 'libra max',
} as const

export type PlanType = (typeof PLAN_TYPES)[keyof typeof PLAN_TYPES]

export type AIModel = {
  id: string
  name: string
  icon: string
  provider: AIModelProvider
  requiredPlan: PlanType
}
// Global default Azure OpenAI deployment model for OpenAI provider
export const DEFAULT_AZURE_DEPLOYMENT = 'gpt-5'


export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-5',
    name: 'GPT 5',
    icon: '/openai.svg',
    provider: 'openai',
    requiredPlan: PLAN_TYPES.FREE,
  },
  {
    id: 'claude-4-0-sonnet',
    name: 'Claude 4.0 Sonnet',
    icon: '/anthropic.svg',
    provider: 'anthropic',
    requiredPlan: PLAN_TYPES.PRO,
  },
  {
    id: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    icon: '/google.svg',
    provider: 'google',
    requiredPlan: PLAN_TYPES.PRO,
  },
]

export const getDefaultModel = (): AIModel => {
  return (
    AI_MODELS[0] ?? {
      id: 'gpt-5',
      name: 'GPT 5',
      icon: '/openai.svg',
      provider: 'openai',
      requiredPlan: PLAN_TYPES.FREE,
    }
  )
}

export const findModelById = (id: string): AIModel => {
  const foundModel = AI_MODELS.find((model) => model.id === id)
  return foundModel !== undefined ? foundModel : getDefaultModel()
}

// Helper function to check if a plan can access another plan's features
const canAccessPlan = (userPlan: string, requiredPlan: PlanType): boolean => {
  // Normalize user plan to match our constants
  const normalizedUserPlan = userPlan.toLowerCase()

  // Define plan hierarchy (higher index = higher tier)
  const planHierarchy = [PLAN_TYPES.FREE, PLAN_TYPES.PRO, PLAN_TYPES.MAX]

  const userPlanIndex = planHierarchy.findIndex((plan) => plan.toLowerCase() === normalizedUserPlan)
  const requiredPlanIndex = planHierarchy.findIndex((plan) => plan === requiredPlan)

  // If user plan not found, default to FREE (index 0)
  const userIndex = userPlanIndex >= 0 ? userPlanIndex : 0
  const requiredIndex = requiredPlanIndex >= 0 ? requiredPlanIndex : 0

  return userIndex >= requiredIndex
}

// Get available models based on user's subscription plan
export const getAvailableModels = (userPlan: string): AIModel[] => {
  return AI_MODELS.filter((model) => canAccessPlan(userPlan, model.requiredPlan))
}

// Check if user can access a specific model
export const canAccessModel = (userPlan: string, modelId: string): boolean => {
  const model = findModelById(modelId)
  return canAccessPlan(userPlan, model.requiredPlan)
}

// Get default model for user's plan (first available model)
export const getDefaultModelForPlan = (userPlan: string): AIModel => {
  const availableModels = getAvailableModels(userPlan)
  return availableModels[0] ?? getDefaultModel()
}
