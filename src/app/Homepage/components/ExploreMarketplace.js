'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

const ExploreMarketplace = () => {
  const categories = [
    { title: 'Marine & Offshore', jobs: '286', bg: '/assets/imgs/page/homepage-bluecollar/card-1.png' },
    { title: 'Welding & Fabrication', jobs: '341', bg: '/assets/imgs/page/homepage-bluecollar/card-2.png' },
    { title: 'Electrical & HVAC', jobs: '298', bg: '/assets/imgs/page/homepage-bluecollar/card-3.png' },
    { title: 'Construction Trades', jobs: '412', bg: '/assets/imgs/page/homepage-bluecollar/card-4.png' },
    { title: 'Logistics & Transport', jobs: '265', bg: '/assets/imgs/page/homepage-bluecollar/card-5.png' },
    { title: 'Facility & Maintenance', jobs: '224', bg: '/assets/imgs/page/homepage-bluecollar/card-6.png' },
  ];

  return (
    <section className="section-box mt-50 mb-30 bg-brand-2 pt-60 pb-60">
      <div className="container">
        <div className="row">
          <div className="col-xl-5">
            <div className="pt-70">
              <h2 className="color-white mb-20">Explore the Marketplace</h2>
              <p className="color-white mb-30">
                Search and connect with the right candidates faster. Tell us what you&apos;ve looking for and we&apos;ll get to work for you.
              </p>
              <div className="mt-20">
                <a className="btn btn-brand-1 btn-icon-more hover-up" href="#">
                  Explore
                </a>
              </div>
            </div>
          </div>
          <div className="col-xl-7">
            <div className="box-swiper mt-50 layout-brand-1">
              <Swiper
                modules={[Navigation]}
                spaceBetween={30}
                slidesPerView={3}
                loop={true}
                className="swiper-group-3-explore mh-none swiper"
                style={{ paddingBottom: '70px', paddingTop: '5px' }}
              >
                {categories.map((category, index) => (
                  <SwiperSlide key={index} className="hover-up">
                    <div 
                      className="card-grid-5 card-category hover-up" 
                      style={{ backgroundImage: `url(${category.bg})` }}
                    >
                      <a href="/jobs-list">
                        <div className="box-cover-img">
                          <div className="content-bottom">
                            <h6 className="color-white mb-5">{category.title}</h6>
                            <p className="color-white font-xs">
                              <span>{category.jobs}</span>
                              <span> Jobs Available</span>
                            </p>
                          </div>
                        </div>
                      </a>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="swiper-button-next swiper-button-next-1"></div>
              <div className="swiper-button-prev swiper-button-prev-1"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreMarketplace;

