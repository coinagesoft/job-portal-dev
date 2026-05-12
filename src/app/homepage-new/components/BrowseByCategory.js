"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "./BrowseByCategory.css";

export default function BrowseByCategory() {
  return (
    <section className="section-box mt-80">
      <div className="section-box wow animate__animated animate__fadeIn">
        <div className="container">
          <div className="text-center">
            <h2 className="section-title mb-10 wow animate__animated animate__fadeInUp">Browse by category</h2>
            <p className="font-lg color-text-paragraph-2 wow animate__animated animate__fadeInUp">
              Find the job that&apos;s perfect for you. about 800+ new jobs everyday
            </p>
          </div>
          <div className="box-swiper mt-50">
            <Swiper
              modules={[Navigation]}
              slidesPerView={5}
              navigation={{ nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }}
              breakpoints={{
                320: { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                992: { slidesPerView: 4 },
                1200: { slidesPerView: 5 },
              }}
              className="swiper-container swiper-group-5 swiper"
              wrapperClass="swiper-wrapper pb-70 pt-5"
            >
              <SwiperSlide className="hover-up">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left"><img alt="jobBox" src="/assets/imgs/page/homepage1/marketing.svg" /></div>
                    <div className="text-info-right">
                      <h4>Marketing &amp; Sale</h4>
                      <p className="font-xs">1526<span> Jobs Available</span></p>
                    </div>
                  </div>
                </a>
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left"><img alt="jobBox" src="/assets/imgs/page/homepage1/customer.svg" /></div>
                    <div className="text-info-right">
                      <h4>Customer Help</h4>
                      <p className="font-xs">185<span> Jobs Available</span></p>
                    </div>
                  </div>
                </a>
              </SwiperSlide>

              <SwiperSlide className="hover-up">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left"><img alt="jobBox" src="/assets/imgs/page/homepage1/finance.svg" /></div>
                    <div className="text-info-right">
                      <h4>Finance</h4>
                      <p className="font-xs">168<span> Jobs Available</span></p>
                    </div>
                  </div>
                </a>
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left"><img alt="jobBox" src="/assets/imgs/page/homepage1/lightning.svg" /></div>
                    <div className="text-info-right">
                      <h4>Software</h4>
                      <p className="font-xs">1856<span> Jobs Available</span></p>
                    </div>
                  </div>
                </a>
              </SwiperSlide>

              <SwiperSlide className="hover-up">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left"><img alt="jobBox" src="/assets/imgs/page/homepage1/human.svg" /></div>
                    <div className="text-info-right">
                      <h4>Human Resource</h4>
                      <p className="font-xs">165<span> Jobs Available</span></p>
                    </div>
                  </div>
                </a>
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left"><img alt="jobBox" src="/assets/imgs/page/homepage1/management.svg" /></div>
                    <div className="text-info-right">
                      <h4>Management</h4>
                      <p className="font-xs">965<span> Jobs Available</span></p>
                    </div>
                  </div>
                </a>
              </SwiperSlide>

              <SwiperSlide className="hover-up">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left"><img alt="jobBox" src="/assets/imgs/page/homepage1/retail.svg" /></div>
                    <div className="text-info-right">
                      <h4>Retail &amp; Products</h4>
                      <p className="font-xs">563<span> Jobs Available</span></p>
                    </div>
                  </div>
                </a>
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left"><img alt="jobBox" src="/assets/imgs/page/homepage1/security.svg" /></div>
                    <div className="text-info-right">
                      <h4>Security Analyst</h4>
                      <p className="font-xs">254<span> Jobs Available</span></p>
                    </div>
                  </div>
                </a>
              </SwiperSlide>

              <SwiperSlide className="hover-up">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left"><img alt="jobBox" src="/assets/imgs/page/homepage1/content.svg" /></div>
                    <div className="text-info-right">
                      <h4>Content Writer</h4>
                      <p className="font-xs">142<span> Jobs Available</span></p>
                    </div>
                  </div>
                </a>
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left"><img alt="jobBox" src="/assets/imgs/page/homepage1/research.svg" /></div>
                    <div className="text-info-right">
                      <h4>Market Research</h4>
                      <p className="font-xs">532<span> Jobs Available</span></p>
                    </div>
                  </div>
                </a>
              </SwiperSlide>
            </Swiper>
            <div className="swiper-button-next"></div>
            <div className="swiper-button-prev"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
