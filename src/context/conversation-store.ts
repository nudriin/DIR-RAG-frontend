import { createContext, useContext } from "react"
import type { Dispatch, SetStateAction } from "react"
import type { ConversationDetail, ConversationSummary } from "@/types/api"

export type ConversationState = {
    activeConversationId: number | null
    setActiveConversationId: (id: number | null) => void
    conversations: ConversationSummary[]
    setConversations: Dispatch<SetStateAction<ConversationSummary[]>>
    conversationDetail: ConversationDetail | null
    setConversationDetail: Dispatch<SetStateAction<ConversationDetail | null>>
    resetConversation: () => void
}

export const ConversationContext = createContext<ConversationState | null>(null)

export function useConversation() {
    const ctx = useContext(ConversationContext)
    if (!ctx) {
        throw new Error("useConversation must be used within ConversationProvider")
    }
    return ctx
}
