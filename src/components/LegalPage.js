'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { legalPagesService } from '../../src/services/legalPagesService/legalPagesService'

export default function LegalPage({ pageType }) {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await legalPagesService.getPublicLegalPage(pageType)

        setPage(response.data)
      } catch (err) {
        console.error(`Failed to load ${pageType} page:`, err)
        setError('Unable to load this page.')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [pageType])

  if (loading) {
    return (
      <div className="legal-page-loading">
        <Loader2 size={30} className="animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <section className="legal-page">
        <div className="container legal-page-container">
          <div className="alert alert-danger mb-0">
            {error}
          </div>
        </div>
      </section>
    )
  }

  if (!page) return null

  return (
  <section className="legal-page">
    <div className="container legal-page-container">

      <header className="legal-page-header">
        <h1>{page.title}</h1>

        {page.effectiveDate && (
          <p className="legal-effective-date">
            Effective date:{' '}
            {new Date(page.effectiveDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
      </header>

      <div
        className="legal-page-content"
        dangerouslySetInnerHTML={{
          __html: page.content,
        }}
      />

    </div>
  </section>
)
}