interface FeedbackMessageProps {
  type: 'success' | 'error'
  message: string
}

export function FeedbackMessage({ type, message }: FeedbackMessageProps) {
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`fixed right-4 top-20 z-[60] max-w-sm rounded-md border px-4 py-3 text-sm font-medium shadow-lg ${
        type === 'success'
          ? 'border-green-200 bg-green-50 text-green-800'
          : 'border-red-300 bg-red-50 text-red-800'
      }`}
    >
      {message}
    </div>
  )
}
