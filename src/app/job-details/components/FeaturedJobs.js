'use client';
import React from 'react';
import Link from 'next/link';
import { featuredJobs } from '../data.js';

const FeaturedJobs = () => {
  const formatHourlyPrice = (value) => {
    const text = String(value || '').trim();
    if (!text) return '';
    return text.includes('$') ? text : `$${text}`;
  };

  return (
    <section className="section-box mt-50 mb-50">
      <div className="container">
        <div className="text-left">
          <h2 className="section-title mb-10 wow animate__animated animate__fadeInUp">Featured Jobs</h2>
          <p className="font-lg color-text-paragraph-2 wow animate__animated animate__fadeInUp">
            Get the latest news, updates and tips
          </p>
        </div>
        <div className="mt-50">
          <div className="box-swiper style-nav-top">
            <div className="swiper-container swiper-group-4 swiper">
              <div className="swiper-wrapper pb-10 pt-5">
                {featuredJobs.map((job) => (
                  <div key={job.id} className="swiper-slide">
                    <div className="card-grid-2 hover-up">
                      <div className="card-grid-2-image-left">
                        <span className="flash"></span>
                        <div className="image-box">
                          <img src={job.img} alt="jobBox" />
                        </div>
                        <div className="right-info">
                          <Link className="name-job" href="/company-details">{job.company}</Link>
                          <span className="location-small">{job.location}</span>
                        </div>
                      </div>
                      <div className="card-block-info">
                        <h6>
                          <Link href="/job-details">{job.title}</Link>
                        </h6>
                        <div className="mt-5">
                          <span className="card-briefcase">{job.type}</span>
                          <span className="card-time">
                            <span>{job.time.split(' ')[0]}</span>
                            <span>{job.time.split(' ')[1]} ago</span>
                          </span>
                        </div>
                        {job.desc && (
                          <p className="font-sm color-text-paragraph mt-15">
                            {job.desc}
                          </p>
                        )}
                        <div className="mt-30">
                          {job.tags.map((tag, idx) => (
                            <a key={idx} className="btn btn-grey-small mr-5" href="/jobs-grid">
                              {tag}
                            </a>
                          ))}
                        </div>
                        <div className="card-2-bottom mt-30">
                          <div className="row">
                            <div className="col-lg-7 col-7">
                              <span className="card-text-price">{formatHourlyPrice(job.price)}</span>
                              <span className="text-muted">/Hour</span>
                            </div>
                            <div className="col-lg-5 col-5 text-end">
                              <div className="btn btn-apply-now">Apply now</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="swiper-button-next swiper-button-next-4"></div>
            <div className="swiper-button-prev swiper-button-prev-4"></div>
          </div>
          <div className="text-center">
            <a className="btn btn-grey" href="#">Load more posts</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;

