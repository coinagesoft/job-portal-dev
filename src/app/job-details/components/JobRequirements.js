'use client';

import React from 'react';

const JobRequirements = ({ job = {} }) => {
    const languages = job.languagePreferred
        ? job.languagePreferred.split(',').map((item) => item.trim())
        : [];

    const certificates = job.requiredLicencesCertificates || [];

    if (!languages.length && !certificates.length) {
        return null;
    }

    return (
        <div
            className="job-overview employer-cv-surface-card no-static-border"
            style={{
                padding: '24px 30px',
                marginBottom: '30px',
            }}
        >
            <h5 className="border-bottom pb-15 mb-25">
                Requirements
            </h5>

            {languages.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h6 className="mb-15">Languages</h6>

                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                        }}
                    >
                        {languages.map((language) => (
                            <span
                                key={language}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #E0E6F7',
                                    borderRadius: '30px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#122359',
                                    background: '#F8F9FF',
                                }}
                            >
                                {language}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {certificates.length > 0 && (
                <div>
                    <h6 className="mb-15">Certificates & Licences</h6>

                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                        }}
                    >
                        {certificates.map((certificate) => (
                            <span
                                key={certificate}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #E0E6F7',
                                    borderRadius: '30px',
                                    fontSize: '14px',
                                    background: '#F8F9FF',
                                }}
                            >
                                {certificate}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobRequirements;