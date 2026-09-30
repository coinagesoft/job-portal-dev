'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer
      className="footer my-50"
     
    >
      <div className="container">
        <div className="footer-bottom">
          <div className="row">
            <div className="col-md-6">
              <span className="font-xs color-text-paragraph">
                Copyright © 2026. JobBox all right reserved
              </span>
            </div>

            <div className="col-md-6 text-md-end text-start">
              <div className="footer-social">
                <Link
                  className="font-xs color-text-paragraph"
                  href="/legalPages/privacypolicy"
                >
                  Privacy Policy
                </Link>

                <Link
                  className="font-xs color-text-paragraph mr-30 ml-30"
                  href="/legalPages/termscondition"
                >
                  Terms & Conditions
                </Link>

                <a
                  className="font-xs color-text-paragraph"
                  href="#"
                >
                  Security
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;