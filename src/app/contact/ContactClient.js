'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './contact.module.css';

const MUMBAI_OFFICE = {
  name: 'Mumbai Office',
  city: 'Mumbai, Maharashtra, India',
  address: '3610/3611, Marathon Futurex, NM Joshi Marg, Lower Parel, Mumbai 400013, India',
  phone: '+91 8424880365',
  email: 'info@vanshay.in',
  hours: 'Mon – Sat: 9:30 AM – 6:30 PM IST',
  mapQuery: 'Marathon Futurex, NM Joshi Marg, Lower Parel, Mumbai 400013, India',
};

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
    agreeTerms: true,
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const mapSectionRef = useRef(null);

  const handleScrollToMap = () => {
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message';
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms to proceed';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit enquiry. Please try again.');
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Contact submission error:', err);
      setSubmitError(
        err.message || 'Unable to send enquiry. Please contact us directly at info@vanshay.in.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      subject: 'General Inquiry',
      message: '',
      agreeTerms: true,
    });
    setErrors({});
    setSubmitError('');
    setIsSubmitted(false);
  };

  const googleMapsUrl =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3347.529569181477!2d72.82886728200647!3d18.99488605857379!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7cef3836311c1%3A0x8cfa9225e0aa9bca!2sMarathon%20Futurex!5e1!3m2!1sen!2sin!4v1791362900372!5m2!1sen!2sin';

  const googleMapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    MUMBAI_OFFICE.address
  )}`;

  return (
    <div className={styles.contactPage}>
      {/* 1. Hero Breadcrumb Section */}
      <section className={styles.heroBreadcrumb}>
        <div className="container">
          <div className="row align-items-center">
            <div className={`col-lg-7 col-md-8 ${styles.heroContent}`}>
              <h1 className={styles.heroTitle}>Contact Us</h1>
              <p className={styles.heroSubtitle}>
                Have questions or need assistance? Reach out to our team at our Mumbai office.
              </p>
            </div>
            <div className={`col-lg-5 col-md-4 text-md-end mt-3 mt-md-0 ${styles.heroContent}`}>
              <ul className={styles.breadcrumbNav}>
                <li className={styles.breadcrumbItem}>
                  <Link href="/">Home</Link>
                </li>
                <li className={styles.breadcrumbSeparator}>/</li>
                <li className={styles.breadcrumbItem}>Contact Us</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Single Office Section - Mumbai Head Office */}
      <section className={styles.infoSection}>
        <div className="container">
          <div className={styles.infoContainer}>
            <div className="row">
              {/* Card 1: Address */}
              <div className="col-lg-4 col-md-6 col-sm-12 mb-30">
                <div className={styles.infoCard}>
                  <span className={styles.badgeHq}>Head Office &bull; Mumbai</span>
                  <div className={styles.officeCardHeader}>
                    <div className={styles.officeIconBox}>
                      <i className="fi-rr-map-marker"></i>
                    </div>
                    <div>
                      <h5 className={styles.officeTitle}>Address</h5>
                      <span className={styles.officeSubtitle}>Lower Parel, Mumbai</span>
                    </div>
                  </div>
                  <p className={styles.officeAddress}>
                    {MUMBAI_OFFICE.address}
                  </p>
                  <button
                    type="button"
                    className={styles.viewMapLink}
                    onClick={handleScrollToMap}
                  >
                    View on map &darr;
                  </button>
                </div>
              </div>

              {/* Card 2: Call Us */}
              <div className="col-lg-4 col-md-6 col-sm-12 mb-30">
                <div className={styles.infoCard}>
                  <span className={styles.badgeHq}>Helpline & Support</span>
                  <div className={styles.officeCardHeader}>
                    <div className={styles.officeIconBox}>
                      <i className="fi-rr-phone-call"></i>
                    </div>
                    <div>
                      <h5 className={styles.officeTitle}>Call Us</h5>
                      <span className={styles.officeSubtitle}>Mon – Sat, 9:30 AM – 6:30 PM IST</span>
                    </div>
                  </div>
                  <div className={styles.contactDetailItem}>
                    <i className="fi-rr-phone-call"></i>
                    <a href={`tel:${MUMBAI_OFFICE.phone}`}>
                      {MUMBAI_OFFICE.phone}
                    </a>
                  </div>
                  <p className="font-xs color-text-paragraph-2 mt-15 mb-0">
                    Reach our dedicated support executives directly during business hours.
                  </p>
                </div>
              </div>

              {/* Card 3: Email */}
              <div className="col-lg-4 col-md-12 col-sm-12 mb-30">
                <div className={styles.infoCard}>
                  <span className={styles.badgeHq}>Online Assistance</span>
                  <div className={styles.officeCardHeader}>
                    <div className={styles.officeIconBox}>
                      <i className="fi-rr-envelope"></i>
                    </div>
                    <div>
                      <h5 className={styles.officeTitle}>Email</h5>
                      <span className={styles.officeSubtitle}>Official Inquiry Desk</span>
                    </div>
                  </div>
                  <div className={styles.contactDetailItem}>
                    <i className="fi-rr-envelope"></i>
                    <a href={`mailto:${MUMBAI_OFFICE.email}`}>
                      {MUMBAI_OFFICE.email}
                    </a>
                  </div>
                  <p className="font-xs color-text-paragraph-2 mt-15 mb-0">
                    Our team typically responds to inquiries within 24 business hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Get In Touch Form & Indian Corporate Illustration Section */}
      <section className={styles.formSection}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8 mb-40">
              <span className={styles.sectionBadge}>Contact Us</span>
              <h2 className={styles.sectionHeading}>Get in touch</h2>
              <p className={styles.sectionDesc}>
                Whether you are looking for top job opportunities or seeking to hire talent, we are here to assist you.
              </p>

              <div className={styles.formCard}>
                {isSubmitted ? (
                  <div className={styles.successMessageCard}>
                    <div className={styles.successIcon}>✓</div>
                    <h3 className={styles.successTitle}>Enquiry Sent Successfully!</h3>
                    <p className={styles.successDesc}>
                      Thank you for contacting us. Your message has been forwarded to our team (<strong>shivraj.b@coinage.in</strong>). We will get back to you shortly.
                    </p>
                    <button
                      type="button"
                      className="btn btn-default hover-up"
                      onClick={handleResetForm}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    {submitError && (
                      <div className="alert alert-danger mb-20" role="alert">
                        {submitError}
                      </div>
                    )}
                    <form onSubmit={handleSubmit} noValidate>
                    <div className="row">
                      <div className="col-lg-6 col-md-6">
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>
                            Full Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            className={`${styles.inputField} ${
                              errors.name ? styles.errorField : ''
                            }`}
                            placeholder="e.g. Rajesh Sharma"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                          {errors.name && (
                            <span className={styles.errorText}>{errors.name}</span>
                          )}
                        </div>
                      </div>

                      <div className="col-lg-6 col-md-6">
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>
                            Company Name <small className="text-muted">(Optional)</small>
                          </label>
                          <input
                            type="text"
                            name="company"
                            className={styles.inputField}
                            placeholder="e.g. Apex Enterprises"
                            value={formData.company}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="col-lg-6 col-md-6">
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>
                            Email Address <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            className={`${styles.inputField} ${
                              errors.email ? styles.errorField : ''
                            }`}
                            placeholder="e.g. rajesh.sharma@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                          {errors.email && (
                            <span className={styles.errorText}>{errors.email}</span>
                          )}
                        </div>
                      </div>

                      <div className="col-lg-6 col-md-6">
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            className={styles.inputField}
                            placeholder="e.g. +91 98765 43210"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="col-lg-12">
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Topic / Inquiry Type</label>
                          <select
                            name="subject"
                            className={styles.inputField}
                            value={formData.subject}
                            onChange={handleInputChange}
                            style={{ height: '50px' }}
                          >
                            <option value="General Inquiry">General Inquiry</option>
                            <option value="Candidate Support">Candidate & Job Application Support</option>
                            <option value="Employer Partnerships">Employer & Recruiter Solutions</option>
                            <option value="Billing & Invoices">Billing, Credits & Invoices</option>
                            <option value="Technical Support">Website / Account Technical Support</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-lg-12">
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>
                            Message <span className="text-danger">*</span>
                          </label>
                          <textarea
                            name="message"
                            className={`${styles.textareaField} ${
                              errors.message ? styles.errorField : ''
                            }`}
                            placeholder="Tell us how we can help you..."
                            value={formData.message}
                            onChange={handleInputChange}
                          ></textarea>
                          {errors.message && (
                            <span className={styles.errorText}>{errors.message}</span>
                          )}
                        </div>
                      </div>

                      <div className="col-lg-12">
                        <label className={styles.checkboxContainer}>
                          <input
                            type="checkbox"
                            name="agreeTerms"
                            checked={formData.agreeTerms}
                            onChange={handleInputChange}
                          />
                          <span>
                            By clicking send message, you agree to our{' '}
                            <Link href="/legalPages/privacypolicy" className="color-brand-2">
                              Privacy Policy
                            </Link>{' '}
                            and{' '}
                            <Link href="/legalPages/termscondition" className="color-brand-2">
                              Terms & Conditions
                            </Link>.
                          </span>
                        </label>
                        {errors.agreeTerms && (
                          <span
                            className={styles.errorText}
                            style={{ marginTop: '-15px', marginBottom: '15px' }}
                          >
                            {errors.agreeTerms}
                          </span>
                        )}

                        <div>
                          <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm mr-10"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Sending message...
                              </>
                            ) : (
                              <>
                                <i className="fi-rr-paper-plane mr-5"></i>
                                Send Message
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </>
              )}
              </div>
            </div>

            {/* Right Column: Indian Corporate Image & Quick Support Box */}
            <div className="col-lg-4 text-center d-none d-lg-block">
              <div className={styles.formImageWrapper}>
                <Image
                  src="/assets/imgs/page/contact/indian-contact.jpg"
                  alt="JobBox Mumbai Support Team"
                  width={380}
                  height={480}
                  className={styles.contactIllustration}
                  priority
                />
                <div className={styles.quickHelpBox}>
                  <h6 className={styles.quickHelpTitle}>
                    <i className="fi-rr-headset color-brand-2"></i>
                    Mumbai Support Desk
                  </h6>
                  <p className={styles.quickHelpText}>
                    Our customer success and technical team based in Mumbai is ready to assist candidates and employers.
                  </p>
                  <div className="d-flex align-items-center mb-10">
                    <i className="fi-rr-phone-call mr-10 color-brand-2"></i>
                    <a href="tel:+912248018106" className="font-xs color-text-paragraph">
                      +91 8424880365
                    </a>
                  </div>
                  <div className="d-flex align-items-center mb-10">
                    <i className="fi-rr-envelope mr-10 color-brand-2"></i>
                    <a href="mailto:info@vanshay.in" className="font-xs color-text-paragraph">
                      info@vanshay.in
                    </a>
                  </div>
                  <div className="d-flex align-items-center mb-10">
                    <i className="fi-rr-clock mr-10 color-brand-2"></i>
                    <span className="font-xs color-text-paragraph">
                      Mon – Sat, 9:30 AM – 6:30 PM IST
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="fi-rr-shield-check mr-10 color-brand-2"></i>
                    <span className="font-xs color-text-paragraph">
                      100% Confidential & Secure Support
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Integrated Map Section - Mumbai Office */}
      <section
        className={styles.mapSection}
        id="map-section"
        ref={mapSectionRef}
      >
        <div className="container">
          <div className={styles.mapContainer}>
            <div className={styles.mapHeader}>
              <div>
                <span className={styles.sectionBadge}>Location</span>
                <h3 className="font-h3 color-brand-1 font-weight-700 mb-5">
                  Visit Our Mumbai Office
                </h3>
                <p className="font-sm color-text-paragraph-2 mb-0">
                  {MUMBAI_OFFICE.address}
                </p>
              </div>

              <span className={styles.mumbaiBadge}>
                <i className="fi-rr-marker"></i>
                Lower Parel, Mumbai
              </span>
            </div>

            {/* Embedded Google Map centered on Mumbai Office */}
            <div className={styles.mapFrameWrapper}>
              <iframe
                title="Map of Marathon Futurex, Mumbai"
                src={googleMapsUrl}
                className={styles.mapIframe}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>

            {/* Bottom details bar with live directions button */}
            <div className={styles.mapFooterBar}>
              <div className={styles.mapCurrentInfo}>
                <div className={styles.mapIconCircle}>
                  <i className="fi-rr-map-marker"></i>
                </div>
                <div>
                  <h6 className={styles.mapCurrentName}>Marathon Futurex, Lower Parel</h6>
                  <p className={styles.mapCurrentAddress}>
                    {MUMBAI_OFFICE.address} &bull; {MUMBAI_OFFICE.phone} &bull; {MUMBAI_OFFICE.hours}
                  </p>
                </div>
              </div>

              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.directionsBtn}
              >
                <i className="fi-rr-location-arrow"></i>
                Get Directions in Google Maps &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Additional Support & Action Cards */}
      <section className={styles.supportCardsSection}>
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-30">
              <div className={styles.helpCard}>
                <div className={styles.helpCardIcon}>
                  <i className="fi-rr-briefcase"></i>
                </div>
                <h5 className={styles.helpCardTitle}>Looking for a Job?</h5>
                <p className={styles.helpCardDesc}>
                  Browse verified job listings from top employers across Mumbai and pan-India.
                </p>
                <Link href="/jobs-list" className={styles.helpCardLink}>
                  Explore Job Openings &rarr;
                </Link>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-30">
              <div className={styles.helpCard}>
                <div className={styles.helpCardIcon}>
                  <i className="fi-rr-users"></i>
                </div>
                <h5 className={styles.helpCardTitle}>Hiring Top Talent?</h5>
                <p className={styles.helpCardDesc}>
                  Post job openings, search pre-screened candidate profiles, and manage applicants with ease.
                </p>
                <Link href="/register?type=employer" className={styles.helpCardLink}>
                  Register as Employer &rarr;
                </Link>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-30">
              <div className={styles.helpCard}>
                <div className={styles.helpCardIcon}>
                  <i className="fi-rr-interrogation"></i>
                </div>
                <h5 className={styles.helpCardTitle}>Need Help & FAQ?</h5>
                <p className={styles.helpCardDesc}>
                  Find quick solutions, raise support tickets, and consult our knowledge base guides.
                </p>
                <Link
                  href="/candidate-profile/settings/help-support"
                  className={styles.helpCardLink}
                >
                  Visit Support Center &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
