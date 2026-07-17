"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

export default function TopRecruiters() {
  return (
    <section className="section-box mt-50">
      <div className="container">
        <div className="text-start">
          <h2 className="section-title mb-10 wow animate__animated animate__fadeInUp">
            Top Recruiters
          </h2>
          <p className="font-lg color-text-paragraph-2 wow animate__animated animate__fadeInUp">
            Discover your next career move, freelance gig, or internship
          </p>
        </div>
      </div>
      <div className="container">
        <div className="box-swiper mt-50">
          <Swiper
            modules={[Navigation]}
            slidesPerView={1}
            navigation={{
              nextEl: ".swiper-button-next-1",
              prevEl: ".swiper-button-prev-1",
            }}
            className="swiper-container swiper-group-1 swiper-style-2 swiper"
            wrapperClass="swiper-wrapper pt-5"
          >
            <SwiperSlide>
              <div className="item-5 hover-up wow animate__animated animate__fadeIn">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <img alt="jobBox" src="/assets/imgs/brands/brand-1.png" />
                    </div>
                    <div className="text-info-right">
                      <h4>Linkedin</h4>
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <span className="font-xs color-text-mutted ml-10">
                        <span>(</span>
                        <span>68</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="text-info-bottom mt-5">
                      <span className="font-xs color-text-mutted icon-location">
                        New York, US
                      </span>
                      <span className="font-xs color-text-mutted float-end mt-5">
                        25<span> Open Jobs</span>
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <div className="item-5 hover-up wow animate__animated animate__fadeIn">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <img alt="jobBox" src="/assets/imgs/brands/brand-2.png" />
                    </div>
                    <div className="text-info-right">
                      <h4>Adobe</h4>
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <span className="font-xs color-text-mutted ml-10">
                        <span>(</span>
                        <span>42</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="text-info-bottom mt-5">
                      <span className="font-xs color-text-mutted icon-location">
                        New York, US
                      </span>
                      <span className="font-xs color-text-mutted float-end mt-5">
                        17<span> Open Jobs</span>
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <div className="item-5 hover-up wow animate__animated animate__fadeIn">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <img alt="jobBox" src="/assets/imgs/brands/brand-3.png" />
                    </div>
                    <div className="text-info-right">
                      <h4>Dailymotion</h4>
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <span className="font-xs color-text-mutted ml-10">
                        <span>(</span>
                        <span>46</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="text-info-bottom mt-5">
                      <span className="font-xs color-text-mutted icon-location">
                        New York, US
                      </span>
                      <span className="font-xs color-text-mutted float-end mt-5">
                        65<span> Open Jobs</span>
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <div className="item-5 hover-up wow animate__animated animate__fadeIn">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <img alt="jobBox" src="/assets/imgs/brands/brand-4.png" />
                    </div>
                    <div className="text-info-right">
                      <h4>NewSum</h4>
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <span className="font-xs color-text-mutted ml-10">
                        <span>(</span>
                        <span>68</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="text-info-bottom mt-5">
                      <span className="font-xs color-text-mutted icon-location">
                        New York, US
                      </span>
                      <span className="font-xs color-text-mutted float-end mt-5">
                        25<span> Open Jobs</span>
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <div className="item-5 hover-up wow animate__animated animate__fadeIn">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <img alt="jobBox" src="/assets/imgs/brands/brand-5.png" />
                    </div>
                    <div className="text-info-right">
                      <h4>PowerHome</h4>
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <span className="font-xs color-text-mutted ml-10">
                        <span>(</span>
                        <span>87</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="text-info-bottom mt-5">
                      <span className="font-xs color-text-mutted icon-location">
                        New York, US
                      </span>
                      <span className="font-xs color-text-mutted float-end mt-5">
                        34<span> Open Jobs</span>
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <div className="item-5 hover-up wow animate__animated animate__fadeIn">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <img alt="jobBox" src="/assets/imgs/brands/brand-6.png" />
                    </div>
                    <div className="text-info-right">
                      <h4>Whop.com</h4>
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <span className="font-xs color-text-mutted ml-10">
                        <span>(</span>
                        <span>34</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="text-info-bottom mt-5">
                      <span className="font-xs color-text-mutted icon-location">
                        New York, US
                      </span>
                      <span className="font-xs color-text-mutted float-end mt-5">
                        56<span> Open Jobs</span>
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <div className="item-5 hover-up wow animate__animated animate__fadeIn">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <img alt="jobBox" src="/assets/imgs/brands/brand-7.png" />
                    </div>
                    <div className="text-info-right">
                      <h4>Greewood</h4>
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <span className="font-xs color-text-mutted ml-10">
                        <span>(</span>
                        <span>124</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="text-info-bottom mt-5">
                      <span className="font-xs color-text-mutted icon-location">
                        New York, US
                      </span>
                      <span className="font-xs color-text-mutted float-end mt-5">
                        78<span> Open Jobs</span>
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <div className="item-5 hover-up wow animate__animated animate__fadeIn">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <img alt="jobBox" src="/assets/imgs/brands/brand-8.png" />
                    </div>
                    <div className="text-info-right">
                      <h4>Kentucky</h4>
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <span className="font-xs color-text-mutted ml-10">
                        <span>(</span>
                        <span>54</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="text-info-bottom mt-5">
                      <span className="font-xs color-text-mutted icon-location">
                        New York, US
                      </span>
                      <span className="font-xs color-text-mutted float-end mt-5">
                        98<span> Open Jobs</span>
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <div className="item-5 hover-up wow animate__animated animate__fadeIn">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <img alt="jobBox" src="/assets/imgs/brands/brand-9.png" />
                    </div>
                    <div className="text-info-right">
                      <h4>Qeuity</h4>
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <span className="font-xs color-text-mutted ml-10">
                        <span>(</span>
                        <span>76</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="text-info-bottom mt-5">
                      <span className="font-xs color-text-mutted icon-location">
                        New York, US
                      </span>
                      <span className="font-xs color-text-mutted float-end mt-5">
                        90<span> Open Jobs</span>
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <div className="item-5 hover-up wow animate__animated animate__fadeIn">
                <a href="#">
                  <div className="item-logo">
                    <div
                      className="image-left"
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "18px",
                        background: "#f8f4ea",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        alt="jobBox"
                        src="/assets/imgs/brands/brand-1.png"
                        style={{
                          width: "38px",
                          height: "38px",
                          objectFit: "contain",
                          background: "transparent",
                        }}
                      />
                    </div>
                    <div className="text-info-right">
                      <h4>Honda</h4>
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <span className="font-xs color-text-mutted ml-10">
                        <span>(</span>
                        <span>89</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="text-info-bottom mt-5">
                      <span className="font-xs color-text-mutted icon-location">
                        New York, US
                      </span>
                      <span className="font-xs color-text-mutted float-end mt-5">
                        34<span> Open Jobs</span>
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <div className="item-5 hover-up wow animate__animated animate__fadeIn">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <img alt="jobBox" src="/assets/imgs/brands/brand-5.png" />
                    </div>
                    <div className="text-info-right">
                      <h4>Toyota</h4>
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <span className="font-xs color-text-mutted ml-10">
                        <span>(</span>
                        <span>34</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="text-info-bottom mt-5">
                      <span className="font-xs color-text-mutted icon-location">
                        New York, US
                      </span>
                      <span className="font-xs color-text-mutted float-end mt-5">
                        26<span> Open Jobs</span>
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <div className="item-5 hover-up wow animate__animated animate__fadeIn">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <img alt="jobBox" src="/assets/imgs/brands/brand-3.png" />
                    </div>
                    <div className="text-info-right">
                      <h4>Lexuxs</h4>
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <span className="font-xs color-text-mutted ml-10">
                        <span>(</span>
                        <span>27</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="text-info-bottom mt-5">
                      <span className="font-xs color-text-mutted icon-location">
                        New York, US
                      </span>
                      <span className="font-xs color-text-mutted float-end mt-5">
                        54<span> Open Jobs</span>
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <div className="item-5 hover-up wow animate__animated animate__fadeIn">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <img alt="jobBox" src="/assets/imgs/brands/brand-6.png" />
                    </div>
                    <div className="text-info-right">
                      <h4>Ondo</h4>
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <span className="font-xs color-text-mutted ml-10">
                        <span>(</span>
                        <span>54</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="text-info-bottom mt-5">
                      <span className="font-xs color-text-mutted icon-location">
                        New York, US
                      </span>
                      <span className="font-xs color-text-mutted float-end mt-5">
                        58<span> Open Jobs</span>
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <div className="item-5 hover-up wow animate__animated animate__fadeIn">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <img alt="jobBox" src="/assets/imgs/brands/brand-2.png" />
                    </div>
                    <div className="text-info-right">
                      <h4>Square</h4>
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <span className="font-xs color-text-mutted ml-10">
                        <span>(</span>
                        <span>16</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="text-info-bottom mt-5">
                      <span className="font-xs color-text-mutted icon-location">
                        New York, US
                      </span>
                      <span className="font-xs color-text-mutted float-end mt-5">
                        37<span> Open Jobs</span>
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              <div className="item-5 hover-up wow animate__animated animate__fadeIn">
                <a href="#">
                  <div className="item-logo">
                    <div className="image-left">
                      <img alt="jobBox" src="/assets/imgs/brands/brand-8.png" />
                    </div>
                    <div className="text-info-right">
                      <h4>Vista</h4>
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <img
                        alt="jobBox"
                        src="/assets/imgs/template/icons/star.svg"
                      />
                      <span className="font-xs color-text-mutted ml-10">
                        <span>(</span>
                        <span>97</span>
                        <span>)</span>
                      </span>
                    </div>
                    <div className="text-info-bottom mt-5">
                      <span className="font-xs color-text-mutted icon-location">
                        New York, US
                      </span>
                      <span className="font-xs color-text-mutted float-end mt-5">
                        43<span> Open Jobs</span>
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            </SwiperSlide>
          </Swiper>
          <div className="swiper-button-next swiper-button-next-1"></div>
          <div className="swiper-button-prev swiper-button-prev-1"></div>
        </div>
      </div>
    </section>
  );
}
