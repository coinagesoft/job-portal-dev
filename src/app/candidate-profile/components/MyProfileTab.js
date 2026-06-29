'use client';
import { useToast } from '@/components/Toast';
'use client';
import React, { useState, useEffect } from "react";
// import Image from "next/image";
import { mockProfile } from "./data";

const MyProfileTab = () => {
  const showToast = useToast();
  const [profile, setProfile] = useState(mockProfile);
  const [skillsInput, setSkillsInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setProfile({ ...profile, [name]: checked });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (skillsInput.trim() && profile.skills.length < 15) {
      setProfile({
        ...profile,
        skills: [...profile.skills, skillsInput.trim()]
      });
      setSkillsInput("");
    }
  };

  const removeSkill = (index) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((_, i) => i !== index)
    });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Mock save
    showToast("Profile saved successfully!", "success");
  };

  return (
    <>
      <h3 className="mt-0 mb-15 color-brand-1">My Account</h3>
      <a className="font-md color-text-paragraph-2" href="#">Update your profile</a>
      
      <div className="mt-35 mb-40 box-info-profie">
        <div className="image-profile">
          <Image 
            src={avatarPreview} 
            alt="Profile" 
            width={100} 
            height={100}
            className="img-responsive"
          />
        </div>
        <input 
          type="file" 
          id="avatar-upload" 
          onChange={handleAvatarUpload}
          accept="image/jpeg,image/png,image/jpg"
          style={{display: "none"}}
        />
        <label htmlFor="avatar-upload" className="btn btn-apply" style={{ cursor: "pointer" }}>Upload Avatar</label>
        <button className="btn btn-border btn-sm" type="button">Delete</button>
      </div>

      <div className="row form-contact">
        <div className="col-lg-6 col-md-12">
          <div className="form-group">
            <label className="font-sm color-text-mutted mb-10">Full Name *</label>
            <input 
              className="form-control" 
              type="text" 
              value={profile.name}
              onChange={handleInputChange}
              name="name"
              required
            />
          </div>

          <div className="form-group">
            <label className="font-sm color-text-mutted mb-10">Email *</label>
            <input 
              className="form-control" 
              type="email" 
              value={profile.email}
              onChange={handleInputChange}
              name="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="font-sm color-text-mutted mb-10">Contact number</label>
            <input 
              className="form-control" 
              type="text" 
              value={profile.phone}
              onChange={handleInputChange}
              name="phone"
            />
          </div>

          <div className="form-group">
            <label className="font-sm color-text-mutted mb-10">Bio</label>
            <textarea 
              className="form-control" 
              rows="4"
              value={profile.bio}
              onChange={handleInputChange}
              name="bio"
            />
          </div>

          <div className="form-group">
            <label className="font-sm color-text-mutted mb-10">Personal website</label>
            <input 
              className="form-control" 
              type="url" 
              value={profile.website}
              onChange={handleInputChange}
              name="website"
            />
          </div>

          <div className="row">
            <div className="col-lg-6">
              <div className="form-group">
                <label className="font-sm color-text-mutted mb-10">Country</label>
                <input 
                  className="form-control" 
                  type="text" 
                  value={profile.country}
                  onChange={handleInputChange}
                  name="country"
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="form-group">
                <label className="font-sm color-text-mutted mb-10">State</label>
                <input 
                  className="form-control" 
                  type="text" 
                  value={profile.state}
                  onChange={handleInputChange}
                  name="state"
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="form-group">
                <label className="font-sm color-text-mutted mb-10">City</label>
                <input 
                  className="form-control" 
                  type="text" 
                  value={profile.city}
                  onChange={handleInputChange}
                  name="city"
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="form-group">
                <label className="font-sm color-text-mutted mb-10">Zip code</label>
                <input 
                  className="form-control" 
                  type="text" 
                  value={profile.zip}
                  onChange={handleInputChange}
                  name="zip"
                />
              </div>
            </div>
          </div>

          <div className="border-bottom pt-10 pb-10 mb-30"></div>
          <h6 className="color-orange mb-20">Change your password</h6>
          <div className="row">
            <div className="col-lg-6">
              <div className="form-group">
                <label className="font-sm color-text-mutted mb-10">Password</label>
                <input 
                  className="form-control" 
                  type="password" 
value={profile.password || ''}
                  onChange={handleInputChange}
                  name="password"
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="form-group">
                <label className="font-sm color-text-mutted mb-10">Re-Password *</label>
                <input 
                  className="form-control" 
                  type="password" 
value={profile.rePassword || ''}
                  onChange={handleInputChange}
                  name="rePassword"
                />
              </div>
            </div>
          </div>
          <div className="border-bottom pt-10 pb-10"></div>

          <div className="box-agree mt-30">
            <label className="lbl-agree font-xs color-text-paragraph-2">
              <input 
                className="lbl-checkbox" 
                type="checkbox" 
                name="availableFreelance"
                checked={profile.availableFreelance}
                onChange={handleInputChange}
              />
              Available for freelancers
            </label>
          </div>
          <div className="box-button mt-15">
            <button className="btn btn-apply-big font-md font-bold" onClick={handleSave}>
              Save All Changes
            </button>
          </div>
        </div>

        <div className="col-lg-6 col-md-12">
          <div className="box-skills">
            <h5 className="mt-0 color-brand-1">Skills</h5>
            <div className="form-contact">
              <form onSubmit={addSkill} className="form-group">
                <input 
                  className="form-control search-icon" 
                  type="text" 
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="E.g. Angular, Laravel..."
                />
              </form>
            </div>
            <div className="box-tags mt-30">
              {profile.skills.map((skill, index) => (
                <a key={index} className="btn btn-grey-small mr-10" href="#">
                  {skill}
                  <span 
                    className="close-icon" 
                    onClick={() => removeSkill(index)}
                    style={{cursor: "pointer", marginLeft: "5px"}}
                  >
                    ×
                  </span>
                </a>
              ))}
            </div>
            <div className="mt-40">
              <span className="card-info font-sm color-text-paragraph-2">
                You can add up to 15 skills ({profile.skills.length}/15)
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyProfileTab;

