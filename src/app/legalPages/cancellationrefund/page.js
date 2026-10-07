'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { legalPagesService } from '../../../services/legalPagesService/legalPagesService'
import styles from '../privacypolicy/privacy.module.css'

export default function CancellationRefundPage() {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPage = async () => {
      try {
        const response =
          await legalPagesService.getPublicLegalPage(
            'cancellation-refund'
          )

        setPage(response.data)
      } catch (err) {
        console.error(
          'Failed to load Cancellation & Refund Policy:',
          err
        )

        setError(
          'Unable to load Cancellation & Refund Policy.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [])

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2
          size={30}
          className="animate-spin"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`container ${styles.container}`}>
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    )
  }

  if (!page) return null

  return (
    <section className={styles.page}>
      <div className={`container ${styles.container}`}>

        <div className={styles.header}>
          <h1>{page.title}</h1>

          {page.effectiveDate && (
            <p className={styles.date}>
              Effective date:{' '}
              {new Date(
                page.effectiveDate
              ).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>

        <div
          className={styles.content}
          dangerouslySetInnerHTML={{
            __html: page.content,
          }}
        />

      </div>
    </section>
  )
}