'use client';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const HeroBanner = () => {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [industries, setIndustries] = useState([]);

  const handleIndustryChange = (event) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value).filter(Boolean);
    setIndustries(selected);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (keyword.trim()) params.set('q', keyword.trim());
    if (location) params.set('location', location);
    industries.forEach((industry) => params.append('industry', industry));

    const query = params.toString();
    router.push(query ? `/jobs-list?${query}` : '/jobs-list');
  };

  return (
    <section className="section-box mb-70">
      <div className="banner-hero hero-1 banner-homepage5">
        <div className="banner-inner">
          <div className="row">
            <div className="col-xl-7 col-lg-12">
              <div className="block-banner hero-banner-content">
                <h1 className="heading-banner wow animate__animated animate__fadeInUp">
                  Find Jobs,<br className="d-none d-lg-block" />
                  Hire Skilled Talent
                </h1>
                <div className="banner-description mt-20 wow animate__animated animate__fadeInUp" data-wow-delay=".1s">
                  Connect employers and candidates across domestic and international opportunities with faster shortlisting and verified profiles.
                </div>
                <div className="mt-30">
                  <a className="btn btn-default mr-15" href="#">
                    Get Started
                  </a>
                  <a className="btn btn-border-brand-2" href="#">
                    Learn more
                  </a>
                </div>
                <div className="mt-50 mb-20">
                  <span className="font-md color-text-paragraph-2">Trusted by</span>
                </div>
                <div className="box-logos-485">
                  <div className="box-swiper">
                    <Swiper
                      modules={[Navigation]}
                      spaceBetween={30}
                      slidesPerView={4}
                      loop={true}
                      className="swiper-group-4-banner swiper"
                    >
                      <SwiperSlide>
                        <a href="#"><Image src="/assets/imgs/page/homepage3/microsoft.svg" alt="Microsoft" width={100} height={40} /></a>
                      </SwiperSlide>
                      <SwiperSlide>
                        <a href="#"><Image src="/assets/imgs/page/homepage3/sony.svg" alt="Sony" width={100} height={40} /></a>
                      </SwiperSlide>
                      <SwiperSlide>
                        <a href="#"><Image src="/assets/imgs/page/homepage3/acer.svg" alt="Acer" width={100} height={40} /></a>
                      </SwiperSlide>
                      <SwiperSlide>
                        <a href="#"><Image src="/assets/imgs/page/homepage3/nokia.svg" alt="Nokia" width={100} height={40} /></a>
                      </SwiperSlide>
                      <SwiperSlide>
                        <a href="#"><Image src="/assets/imgs/page/homepage3/asus.svg" alt="Asus" width={100} height={40} /></a>
                      </SwiperSlide>
                      <SwiperSlide>
                        <a href="#"><Image src="/assets/imgs/page/homepage3/casio.svg" alt="Casio" width={100} height={40} /></a>
                      </SwiperSlide>
                      <SwiperSlide>
                        <a href="#"><Image src="/assets/imgs/page/homepage3/dell.svg" alt="Dell" width={100} height={40} /></a>
                      </SwiperSlide>
                    </Swiper>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-5 col-lg-12 d-none d-xl-block col-md-6">
              <div className="banner-imgs">
<div className="banner-1 shape-1">
                  <Image 
                    src="/assets/imgs/page/homepage5/banner1.png" 
                    alt="Banner 1" 
                    width={320} 
                    height={420} 
                    style={{ objectFit: 'contain' }} 
                    className="img-responsive" 
                  />
                </div>
<div className="banner-2 shape-2">
                  <Image 
                    src="/assets/imgs/page/homepage5/banner2.png" 
                    alt="Banner 2" 
                    width={320} 
                    height={420} 
                    style={{ objectFit: 'contain' }} 
                    className="img-responsive" 
                  />
                </div>
<div className="banner-3 shape-3">
                  <Image 
                    src="/assets/imgs/page/homepage5/banner3.png" 
                    alt="Banner 3" 
                    width={320} 
                    height={420} 
                    style={{ objectFit: 'contain' }} 
                    className="img-responsive" 
                  />
                </div>
<div className="banner-4 shape-3">
                  <Image 
                    src="/assets/imgs/page/homepage5/banner4.png" 
                    alt="Banner 4" 
                    width={320} 
                    height={420} 
                    style={{ objectFit: 'contain' }} 
                    className="img-responsive" 
                  />
                </div>
<div className="banner-5 shape-2">
                  <Image 
                    src="/assets/imgs/page/homepage5/banner5.png" 
                    alt="Banner 5" 
                    width={320} 
                    height={420} 
                    style={{ objectFit: 'contain' }} 
                    className="img-responsive" 
                  />
                </div>
<div className="banner-6 shape-1">
                  <Image 
                    src="/assets/imgs/page/homepage5/banner6.png" 
                    alt="Banner 6" 
                    width={320} 
                    height={420} 
                    style={{ objectFit: 'contain' }} 
                    className="img-responsive" 
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="box-search-2">
            <div className="block-banner">
              <div className="form-find mt-40 wow animate__animated animate__fadeIn" data-wow-delay=".2s">
                <form className="dashboard-search-form" onSubmit={handleSearch}>
                  <input
                    className="form-input input-keysearch mr-10 dashboard-search-text"
                    type="text"
                    placeholder="Search by role, skill, or company"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                  />
                  <select
                    className="form-input mr-10 select-active dashboard-select-arrow"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  >
                    <option value="">Location</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Delhi / NCR">Delhi / NCR</option>
                    <option value="Bengaluru">Bengaluru</option>
                  </select>
                  <div className="box-industry">
                    <select
                      className="form-input mr-10 input-industry dashboard-industry-multi"
                      
                      value={industries}
                      onChange={handleIndustryChange}
                      title="Select one or more industries"
                    >
                      <option value="Construction">Construction</option>
                      <option value="Marine">Marine</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Oil and Gas">Oil and Gas</option>
                    </select>
                  </div>
                  <button className="btn btn-default btn-find font-sm" type="submit">Search</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
