import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'Why should I trust our platform?',
        answer:
          'We are a fully regulated and compliant platform with years of experience in real estate tokenization. Our team consists of industry experts, and we undergo regular audits to ensure the highest standards of security and transparency.',
      },
      {
        question: 'What does fractional ownership mean?',
        answer:
          'Fractional ownership allows you to own a portion of a property through tokenization. Each token represents a share of the property, enabling you to invest with lower capital requirements while still enjoying proportional benefits like rental income and appreciation.',
      },
      {
        question: 'How are projects sourced?',
        answer:
          'We source the best properties through our extensive real estate network, which includes agents, brokers, and investors. Our team carefully underwrites each deal, focusing on stable, cash-flowing properties in prime locations.',
      },
    ],
  },
  {
    category: 'Investment Process',
    questions: [
      {
        question: 'Is there a minimum investment?',
        answer:
          'Yes, the minimum investment varies by property but typically starts at $5,000 to ensure accessibility while maintaining efficient operation costs.',
      },
      {
        question: 'What happens if a property is not fully funded?',
        answer:
          "If a property doesn't reach its funding goal within the specified timeframe, all investments are returned to the investors with no fees charged.",
      },
      {
        question: 'What is the lockup period to sell the token?',
        answer:
          'The standard lockup period is 12 months, after which you can freely trade your tokens on our secondary marketplace, subject to regulatory requirements.',
      },
    ],
  },
  {
    category: 'Technical Details',
    questions: [
      {
        question: 'Why use blockchain to fractionalize a property?',
        answer:
          'Blockchain technology provides transparency, security, and ease of transfer for property ownership. It also enables automated distribution of rental income and maintains an immutable record of ownership.',
      },
      {
        question: 'Why do I need a crypto wallet to hold tokens?',
        answer:
          'A crypto wallet securely stores your property tokens and enables you to receive rental distributions. It provides a secure, self-custodial solution for managing your real estate investments.',
      },
      {
        question: 'What happens if I lose my property tokens?',
        answer:
          'Your ownership is recorded on the blockchain and can be recovered through our backup processes. We recommend enabling multi-factor authentication and keeping secure backups of your wallet credentials.',
      },
    ],
  },
]

export default function FAQSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeQuestions, setActiveQuestions] = useState<string[]>([])

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0)

  const toggleQuestion = (question: string) => {
    setActiveQuestions((prev) =>
      prev.includes(question)
        ? prev.filter((q) => q !== question)
        : [...prev, question]
    )
  }

  const toggleCategory = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category)
  }

  return (
    <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white/10 px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">
            Everything you need to know about our real estate investment
            platform
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search questions..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-6">
          {filteredFaqs.map((category) => (
            <motion.div
              key={category.category}
              initial={false}
              animate={{
                backgroundColor:
                  activeCategory === category.category
                    ? 'var(--accent)'
                    : 'transparent',
              }}
              className="overflow-hidden rounded-lg"
            >
              <motion.button
                onClick={() => toggleCategory(category.category)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-accent/50"
              >
                <span className="text-lg font-semibold">
                  {category.category}
                </span>
                <motion.div
                  animate={{
                    rotate: activeCategory === category.category ? 180 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {activeCategory === category.category && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {category.questions.map((faq) => (
                      <div key={faq.question} className="border-t">
                        <motion.button
                          onClick={() => toggleQuestion(faq.question)}
                          className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-accent/50"
                        >
                          <span className="font-medium">{faq.question}</span>
                          <motion.div
                            animate={{
                              rotate: activeQuestions.includes(faq.question)
                                ? 180
                                : 0,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </motion.div>
                        </motion.button>

                        <AnimatePresence>
                          {activeQuestions.includes(faq.question) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <p className="px-6 py-4 text-muted-foreground">
                                {faq.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
