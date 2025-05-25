import { WelcomeDialog } from "./welcome-dialog"
import { AiLabGuide } from "./ai-lab-guide"
import { PromptWritingGuide } from "./prompt-writing-guide"
import { GalleryGuide } from "./gallery-guide"
import { SubscriptionGuide } from "./subscription-guide"
import { CompletionDialog } from "./completion-dialog"

export function Onboarding() {
  return (
    <>
      <WelcomeDialog />
      <AiLabGuide />
      <PromptWritingGuide />
      <GalleryGuide />
      <SubscriptionGuide />
      <CompletionDialog />
    </>
  )
}
