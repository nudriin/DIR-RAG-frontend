import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import type { ConversationDetail, ConversationSummary } from "@/types/api"
import {
    ConversationContext,
    type ConversationState,
} from "./conversation-store"

export function ConversationProvider({ children }: { children: ReactNode }) {
    const [activeConversationId, setActiveConversationId] = useState<
        number | null
    >(null)
    const [conversations, setConversations] = useState<ConversationSummary[]>(
        [],
    )
    const [conversationDetail, setConversationDetail] =
        useState<ConversationDetail | null>(null)

    const resetConversation = () => {
        setActiveConversationId(null)
        setConversationDetail(null)
    }

    const value: ConversationState = useMemo(
        () => ({
            activeConversationId,
            setActiveConversationId,
            conversations,
            setConversations,
            conversationDetail,
            setConversationDetail,
            resetConversation,
        }),
        [activeConversationId, conversations, conversationDetail],
    )

    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    )
}
