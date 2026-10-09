'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="footer my-50">
      <div className="container">
        <div className="footer-bottom">
          <div className="row align-items-center">
            {/* Copyright */}
            <div className="col-lg-5 col-md-12 mb-2 mb-lg-0">
              <span className="font-xs color-text-paragraph">
                Copyright © 2026. JobBox all right reserved
              </span>
            </div>

            {/* Footer Links */}
            <div className="col-lg-7 col-md-12">
              <div
                className="footer-social d-flex flex-wrap align-items-center justify-content-start"
                style={{
                  gap: '8px 16px',
                  width: '100%',
                }}
              >
                <Link
                  className="font-xs color-text-paragraph"
                  href="/contact"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Contact Us
                </Link>

                <Link
                  className="font-xs color-text-paragraph"
                  href="/legalPages/privacypolicy"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Privacy Policy
                </Link>

                <Link
                  className="font-xs color-text-paragraph"
                  href="/legalPages/termscondition"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Terms &amp; Conditions
                </Link>

                <Link
                  className="font-xs color-text-paragraph"
                  href="/legalPages/cancellationrefund"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Cancellation &amp; Refund Policy
                </Link>

                <Link
                  className="font-xs color-text-paragraph"
                  href="/legalPages/shippinganddelivery"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Shipping &amp; Delivery Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;