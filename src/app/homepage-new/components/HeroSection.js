"use client";

import React from "react";

export default function HeroSection() {
  return (
    <div>
      <section className="section-box">
        <div className="banner-hero hero-2">
          <div className="banner-inner">
            <div className="block-banner">
              <h1 className="text-42 color-white wow animate__animated animate__fadeInUp">
                India’s #1 <span className="color-green">Golbal</span>
                <br className="d-none d-lg-block" />
                Job Portal for Skilled Workers
              </h1>

              <div
                className="font-lg font-regular color-white mt-20 wow animate__animated animate__fadeInUp"
                data-wow-delay=".1s"
              >
                Find verified opportunities across India, UAE, Saudi Arabia,
                Qatar, and Singapore for technicians, engineers, drivers,
                construction professionals, marine staff, and skilled workers.
              </div>

              <div
                className="form-find mt-40 wow animate__animated animate__fadeIn"
                data-wow-delay=".2s"
              >
                <form>
                  <div className="box-industry">
                    <select className="form-input mr-10 select-active input-industry">
                      <option value="0">Select Trade</option>
                      <option value="1">Welder</option>
                      <option value="2">HVAC Technician</option>
                      <option value="3">Pipe Fitter</option>
                      <option value="4">Driver</option>
                      <option value="5">Electrician</option>
                      <option value="6">Construction</option>
                      <option value="7">Marine Jobs</option>
                    </select>
                  </div>

                  <select className="form-input mr-10 select-active">
                    <option value="">Location</option>
                    <option value="AX">Aland Islands</option>
                    <option value="AF">Afghanistan</option>
                    <option value="AL">Albania</option>
                    <option value="DZ">Algeria</option>
                    <option value="AD">Andorra</option>
                    <option value="AO">Angola</option>
                    <option value="AI">Anguilla</option>
                    <option value="AQ">Antarctica</option>
                    <option value="AG">Antigua and Barbuda</option>
                  </select>

                  <input
                    className="form-input input-keysearch mr-10"
                    type="text"
                    placeholder="Your keyword... "
                  />

                  <button className="btn btn-default btn-find font-sm">
                    Search
                  </button>
                </form>
              </div>

              <div
                className="list-tags-banner mt-20 wow animate__animated animate__fadeInUp"
                data-wow-delay=".3s"
              >
                <strong>Popular Searches:</strong>
                <a href="#">Welder</a>, <a href="#">HVAC</a>,{" "}
                <a href="#">Driver</a>, <a href="#">Electrician</a>,{" "}
                <a href="#">Pipe Fitter</a>, <a href="#">Construction</a>,{" "}
                <a href="#">Marine</a>
              </div>
            </div>

            <div className="mt-60">
              <div className="row">
                <div className="col-lg-3 col-sm-3 col-6 text-center mb-20">
                  <div className="d-inline-block text-start">
                    <h4 className="color-white">
                      <span className="count">265</span>
                      <span> K+</span>
                    </h4>
                    <p className="font-sm color-text-mutted">
                      Daily Jobs Posted
                    </p>
                  </div>
                </div>

                <div className="col-lg-3 col-sm-3 col-6 text-center mb-20">
                  <div className="d-inline-block text-start">
                    <h4 className="color-white">
                      <span className="count">17</span>
                      <span> K+</span>
                    </h4>
                    <p className="font-sm color-text-mutted">Recruiters</p>
                  </div>
                </div>

                <div className="col-lg-3 col-sm-3 col-6 text-center mb-20">
                  <div className="d-inline-block text-start">
                    <h4 className="color-white">
                      <span className="count">15</span>
                      <span> K+</span>
                    </h4>
                    <p className="font-sm color-text-mutted">Freelancers</p>
                  </div>
                </div>

                <div className="col-lg-3 col-sm-3 col-6 text-center mb-20">
                  <div className="d-inline-block text-start">
                    <h4 className="color-white">
                      <span className="count">28</span>
                      <span> K+</span>
                    </h4>
                    <p className="font-sm color-text-mutted">Blog Tips</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
