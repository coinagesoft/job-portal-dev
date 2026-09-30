'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { legalPagesService } from '../../../services/legalPagesService/legalPagesService'
import styles from './privacy.module.css'

export default function PrivacyPolicyPage() {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPage = async () => {
      try {
        const response =
          await legalPagesService.getPublicLegalPage('privacy')

        setPage(response.data)
      } catch (err) {
        console.error('Failed to load Privacy Policy:', err)
        setError('Unable to load Privacy Policy.')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [])

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 size={30} className="animate-spin" />
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
              {new Date(page.effectiveDate).toLocaleDateString('en-IN', {
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