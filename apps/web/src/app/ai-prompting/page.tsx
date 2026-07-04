'use client';

// Re-export the exact same component as /ai-assistant
// This allows both routes to display the showcase perfectly.
import AIAssistantPage from '../ai-assistant/page';

export default function AIPromptingPage() {
  return <AIAssistantPage />;
}
