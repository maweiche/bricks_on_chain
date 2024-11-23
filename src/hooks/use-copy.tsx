import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function useCopy(text: string) {
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      toast({
        title: 'Copied!',
        description: `${text.slice(0, 120)} ${text.length > 120 ? '...' : ''}`,
      })
    } catch (err) {
      setIsCopied(false)
      toast({
        title: 'Error',
        description: 'Failed to copy text to clipboard.',
        variant: 'destructive',
      })
    }
  }

  return { isCopied, copyToClipboard }
}
