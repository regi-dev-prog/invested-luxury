// =============================================================================
// Publish action for articles: stamps publishedAt when it is missing.
// =============================================================================
// Wraps Studio's built-in Publish. When an article with status "published" is
// published and publishedAt is empty, publishedAt is set to now first. An
// existing publishedAt is never touched, so republishing keeps the original
// date. updatedAt is not set here: it is only for substantive updates.
// =============================================================================

import {useDocumentOperation, type DocumentActionComponent} from 'sanity'
import {needsPublishDate} from '../../lib/articleDates.mjs'

export function withPublishDate(original: DocumentActionComponent): DocumentActionComponent {
  const PublishWithDate: DocumentActionComponent = (props) => {
    const {patch} = useDocumentOperation(props.id, props.type)
    const result = original(props)
    if (!result) return result

    return {
      ...result,
      onHandle: () => {
        const doc = (props.draft || props.published) as {status?: string; publishedAt?: string} | null
        if (needsPublishDate(doc)) {
          patch.execute([{set: {publishedAt: new Date().toISOString()}}])
        }
        result.onHandle?.()
      },
    }
  }
  PublishWithDate.action = original.action
  PublishWithDate.displayName = 'PublishWithDate'
  return PublishWithDate
}
