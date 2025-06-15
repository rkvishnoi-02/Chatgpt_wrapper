import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  // Create sample agents
  const astrologerAgent = await prisma.agent.upsert({
    where: { id: 'astrologer-agent-id' },
    update: {},
    create: {
      id: 'astrologer-agent-id',
      name: 'AI Astrologer',
      description: 'Professional astrology readings and insights based on birth charts, planetary alignments, and cosmic energies.',
      instructions: 'You are a professional astrologer with deep knowledge of Western astrology, Vedic astrology, and numerology. Provide accurate, insightful readings while being respectful of different beliefs. Always ask for birth date, time, and location for accurate readings.',
      model: 'gpt-4',
      provider: 'openai',
      category: 'lifestyle',
      type: 'SPECIALIST',
      isPublic: true,
      capabilities: ['text-generation', 'personality-analysis'],
      metadata: {
        specialties: ['birth charts', 'daily horoscopes', 'relationship compatibility', 'career guidance'],
        tone: 'mystical yet grounded',
        expertise_level: 'professional'
      }
    }
  })
  const fashionAgent = await prisma.agent.upsert({
    where: { id: 'fashion-agent-id' },
    update: {},
    create: {
      id: 'fashion-agent-id',
      name: 'AI Fashion Designer',
      description: 'Personal styling assistant that creates custom outfit recommendations based on your style preferences, body type, and occasion.',
      instructions: 'You are a professional fashion consultant and stylist. Provide personalized fashion advice considering body type, skin tone, personal style, budget, and occasion. Be encouraging and help build confidence through style.',
      model: 'gpt-4',
      provider: 'openai',
      category: 'lifestyle',
      type: 'SPECIALIST',
      isPublic: true,
      capabilities: ['text-generation', 'image-analysis'],
      metadata: {
        specialties: ['personal styling', 'color analysis', 'outfit coordination', 'wardrobe planning'],
        tone: 'encouraging and stylish',      expertise_level: 'professional'
      }
    }
  })

  const hairstyleAgent = await prisma.agent.upsert({
    where: { id: 'hairstyle-agent-id' },
    update: {},
    create: {
      id: 'hairstyle-agent-id',
      name: 'AI Hairstyle Consultant',
      description: 'Expert hairstyle recommendations based on face shape, hair type, lifestyle, and current trends.',
      instructions: 'You are a professional hairstylist and beauty consultant with expertise in face shape analysis, hair cutting, coloring, and styling. Provide personalized hairstyle recommendations considering face shape, hair texture, lifestyle, maintenance preferences, and current trends.',
      model: 'gpt-4',
      provider: 'openai',
      category: 'beauty',
      type: 'SPECIALIST',
      isPublic: true,
      capabilities: ['text-generation', 'image-analysis'],
      metadata: {
        specialties: ['face shape analysis', 'hair cutting', 'color consultation', 'styling tips'],
        tone: 'professional and friendly',
        expertise_level: 'expert'
      }
    }
  })

  const fitnessAgent = await prisma.agent.upsert({
    where: { name: 'AI Fitness Coach' },
    update: {},
    create: {
      name: 'AI Fitness Coach',
      description: 'Personalized workout plans, nutrition advice, and fitness motivation tailored to your goals and fitness level.',
      instructions: 'You are a certified personal trainer and nutritionist. Create safe, effective workout plans and provide evidence-based nutrition advice. Always prioritize safety and gradual progression. Ask about current fitness level, goals, equipment availability, and any health conditions.',
      model: 'gpt-4',
      provider: 'openai',
      category: 'health',
      isPublic: true,
      capabilities: ['text-generation', 'workout-planning'],
      metadata: {
        specialties: ['workout planning', 'nutrition guidance', 'form correction', 'goal tracking'],
        tone: 'motivational and supportive',
        expertise_level: 'certified'
      }
    }
  })

  const therapistAgent = await prisma.agent.upsert({
    where: { name: 'AI Wellness Companion' },
    update: {},
    create: {
      name: 'AI Wellness Companion',
      description: 'Supportive mental wellness companion offering mindfulness techniques, stress management, and emotional support.',
      instructions: 'You are a compassionate wellness companion trained in mindfulness, stress management, and emotional support techniques. Provide a safe, non-judgmental space while encouraging professional help when needed. Never diagnose or replace professional therapy.',
      model: 'claude-3-sonnet',
      provider: 'anthropic',
      category: 'health',
      isPublic: true,
      capabilities: ['text-generation', 'emotional-support'],
      metadata: {
        specialties: ['mindfulness', 'stress management', 'emotional support', 'breathing exercises'],
        tone: 'compassionate and gentle',
        expertise_level: 'supportive'
      }
    }
  })

  // Create a sample workflow (Multi-agent lifestyle makeover)
  const lifestyleMakeoverWorkflow = await prisma.workflow.upsert({
    where: { name: 'Complete Lifestyle Makeover' },
    update: {},
    create: {
      name: 'Complete Lifestyle Makeover',
      description: 'A comprehensive makeover experience combining fashion, beauty, fitness, and wellness advice from multiple AI specialists.',
      category: 'lifestyle',
      isPublic: true,
      estimatedDuration: 1800, // 30 minutes
      metadata: {
        stages: ['assessment', 'fashion_analysis', 'beauty_consultation', 'fitness_planning', 'wellness_guidance'],
        outcome: 'complete_makeover_plan'
      }
    }
  })

  // Link agents to the workflow
  await prisma.workflowAgent.createMany({
    data: [
      {
        workflowId: lifestyleMakeoverWorkflow.id,
        agentId: fashionAgent.id,
        order: 1,
        role: 'primary'
      },
      {
        workflowId: lifestyleMakeoverWorkflow.id,
        agentId: hairstyleAgent.id,
        order: 2,
        role: 'specialist'
      },
      {
        workflowId: lifestyleMakeoverWorkflow.id,
        agentId: fitnessAgent.id,
        order: 3,
        role: 'specialist'
      },
      {
        workflowId: lifestyleMakeoverWorkflow.id,
        agentId: therapistAgent.id,
        order: 4,
        role: 'supporting'
      }
    ]
  })

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created agents:`)
  console.log(`   - ${astrologerAgent.name}`)
  console.log(`   - ${fashionAgent.name}`)
  console.log(`   - ${hairstyleAgent.name}`)
  console.log(`   - ${fitnessAgent.name}`)
  console.log(`   - ${therapistAgent.name}`)
  console.log(`🔄 Created workflow: ${lifestyleMakeoverWorkflow.name}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
