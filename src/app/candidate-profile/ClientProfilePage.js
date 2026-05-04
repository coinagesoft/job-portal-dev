"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileTabs from "./components/ProfileTabs";
import { mockProfile } from "./components/data.js";
import { useToast } from "@/components/Toast";

const SECTION_IDS = ["personal", "documents", "work", "education", "skills", "languages", "cv"];

const DEFAULT_DOCUMENT_STATUS = {
  nationalId: "verified",
  passport: "missing",
  itiCertificate: "verified",
  experienceLetter: "optional",
  medicalFitness: "optional",
  cv: "optional",
};

const formatFileSize = (sizeInBytes) => {
  if (sizeInBytes < 1024) return `${sizeInBytes} B`;
  if (sizeInBytes < 1024 * 1024) return `${Math.round(sizeInBytes / 1024)} KB`;
  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
};

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const syncSkillMatrixWithSelected = (profile) => {
  const matrixByName = new Map((profile.skillMatrix || []).map((entry) => [entry.name, entry]));
  const syncedSkillMatrix = (profile.selectedSkills || []).map((name) => (
    matrixByName.get(name) || { id: createId("skill"), name, proficiency: "Beginner", years: 1 }
  ));
  return { ...profile, skillMatrix: syncedSkillMatrix };
};

const CandidateProfilePage = () => {
  const showToast = useToast();
  const [profileData, setProfileData] = useState(() => syncSkillMatrixWithSelected(mockProfile));
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [newWorkEntry, setNewWorkEntry] = useState({});

  const [activeSection, setActiveSection] = useState("personal");
  const sectionRefs = useRef({});

  const completionPercent = useMemo(() => {
    const checks = [
      Boolean(profileData.firstName && profileData.lastName),
      Boolean(profileData.mobile),
      Boolean(profileData.trade),
      Boolean(profileData.city && profileData.state),
      profileData.workHistory.length > 0,
      profileData.education.length > 0,
      profileData.selectedSkills.length >= 3,
      Boolean(profileData.documents.nationalId.frontFile),
      Boolean(profileData.documents.passport.file),
      Boolean(profileData.salaryExpectation),
      Boolean(profileData.isITI !== undefined),
      Boolean(profileData.passportNumber),
      Boolean(profileData.passportExpiry),
      profileData.workHistory.every(entry => entry.startDate && entry.endDate),
      (profileData.languages || []).length > 0,
      Boolean(profileData.documents.cv && profileData.documents.cv.file),
    ];
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [profileData]);

  const documentSummary = useMemo(() => {
    const docs = [...Object.values(profileData.documents), ...profileData.customDocuments];
    let verified = 0;
    let pending = 0;
    docs.forEach((doc) => {
      if (doc.status === "verified" || doc.status === "uploaded") verified += 1;
      if (doc.status === "missing") pending += 1;
    });
    return { verified, pending };
  }, [profileData.documents, profileData.customDocuments]);

  const registerSectionRef = useCallback((sectionId, node) => {
    if (node) sectionRefs.current[sectionId] = node;
  }, []);

  const onSectionChange = useCallback((sectionId) => {
    const target = sectionRefs.current[sectionId];
    if (!target) return;
    const nextTop = target.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: nextTop, behavior: "smooth" });
    setActiveSection(sectionId);
  }, []);

  useEffect(() => {
    const updateActiveSection = () => {
      let currentSection = SECTION_IDS[0];
      SECTION_IDS.forEach((sectionId) => {
        const sectionNode = sectionRefs.current[sectionId];
        if (sectionNode && window.scrollY + 150 >= sectionNode.offsetTop) {
          currentSection = sectionId;
        }
      });
      setActiveSection(currentSection);
    };
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const jumpToHashSection = () => {
      const hashValue = window.location.hash.replace("#", "");
      if (!hashValue || !SECTION_IDS.includes(hashValue)) return;
      const target = sectionRefs.current[hashValue];
      if (!target) return;
      const nextTop = target.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: nextTop, behavior: "smooth" });
      setActiveSection(hashValue);
    };
    const timer = window.setTimeout(jumpToHashSection, 120);
    window.addEventListener("hashchange", jumpToHashSection);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", jumpToHashSection);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const initProfileCircle = () => {
      const $ = window.jQuery || window.$;
      if (!$ || typeof $.fn.circliful !== "function") return;
      const circleNode = $("#circle-staticstic-demo");
      if (!circleNode.length) return;
      const percent = Number.isFinite(completionPercent) ? completionPercent : 0;
      circleNode.empty();
      circleNode.circliful({
        animation: 1, foregroundBorderWidth: 10, backgroundBorderWidth: 10,
        percent, percentageTextSize: 20,
        textStyle: "font-size: 20px; font-weight: bold; font-family: 'Plus Jakarta Sans', sans-serif",
        fontColor: "#05264E", fillColor: "#d8e0fd", backgroundColor: "#d8e0fd",
        multiPercentage: 0, targetTextSize: 20
      });
    };
    const $ = window.jQuery || window.$;
    let pluginScript = document.getElementById("assets2-circliful-plugin");
    let onLoadHandler = null;
    if ($ && typeof $.fn.circliful === "function") { initProfileCircle(); return; }
    onLoadHandler = () => {
      if (pluginScript) pluginScript.setAttribute("data-loaded", "true");
      initProfileCircle();
    };
    if (!pluginScript) {
      pluginScript = document.createElement("script");
      pluginScript.id = "assets2-circliful-plugin";
      pluginScript.src = "/assets2/js/plugins/jquery.circliful.js";
      pluginScript.async = true;
      pluginScript.addEventListener("load", onLoadHandler);
      document.body.appendChild(pluginScript);
    } else if (pluginScript.getAttribute("data-loaded") === "true") {
      initProfileCircle();
    } else {
      pluginScript.addEventListener("load", onLoadHandler);
    }
    return () => {
      if (pluginScript && onLoadHandler) pluginScript.removeEventListener("load", onLoadHandler);
    };
  }, [completionPercent]);

  const updateProfileField = useCallback((field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateWorkEntry = useCallback((entryId, field, value) => {
    setProfileData((prev) => ({
      ...prev,
      workHistory: prev.workHistory.map((entry) =>
        entry.id === entryId ? { ...entry, [field]: value } : entry
      )
    }));
  }, []);

  const addWorkEntry = useCallback(() => {
    setProfileData((prev) => ({
      ...prev,
      workHistory: [...prev.workHistory, {
        id: createId("work"), title: "New Role", company: "Company Name",
        startDate: "", endDate: "", period: "Start - End",
        location: "City, State", current: false, description: "Add role details."
      }]
    }));
  }, []);

  const removeWorkEntry = useCallback((entryId) => {
    setProfileData((prev) => ({
      ...prev,
      workHistory: prev.workHistory.filter((entry) => entry.id !== entryId)
    }));
    showToast("Work entry removed.", "info");
  }, [showToast]);

  const updateEducationEntry = useCallback((entryId, field, value) => {
    setProfileData((prev) => ({
      ...prev,
      education: prev.education.map((entry) =>
        entry.id === entryId ? { ...entry, [field]: value } : entry
      )
    }));
  }, []);

  const addEducationEntry = useCallback(() => {
    setProfileData((prev) => ({
      ...prev,
      education: [...prev.education, {
        id: createId("edu"), title: "New Qualification",
        institution: "Institute Name", meta: "Passed: Year", verified: false
      }]
    }));
    showToast("New education entry added.", "info");
  }, [showToast]);

  const removeEducationEntry = useCallback((entryId) => {
    setProfileData((prev) => ({
      ...prev,
      education: prev.education.filter((entry) => entry.id !== entryId)
    }));
    showToast("Education entry removed.", "info");
  }, [showToast]);

  const toggleAvailability = useCallback(() => {
    setProfileData((prev) => ({ ...prev, availableForWork: !prev.availableForWork }));
  }, []);

  const toggleSkill = useCallback((skill) => {
    setProfileData((prev) => {
      const isSelected = prev.selectedSkills.includes(skill);
      const nextSkills = isSelected
        ? prev.selectedSkills.filter((item) => item !== skill)
        : [...prev.selectedSkills, skill];
      const nextSkillMatrix = isSelected
        ? prev.skillMatrix.filter((entry) => entry.name !== skill)
        : prev.skillMatrix.some((entry) => entry.name === skill)
          ? prev.skillMatrix
          : [
              ...prev.skillMatrix,
              { id: createId("skill"), name: skill, proficiency: "Beginner", years: 1 }
            ];
      return { ...prev, selectedSkills: nextSkills, skillMatrix: nextSkillMatrix };
    });
  }, []);

  const updateSkillEntry = useCallback((entryId, field, value) => {
    setProfileData((prev) => ({
      ...prev,
      skillMatrix: prev.skillMatrix.map((entry) =>
        entry.id === entryId ? { ...entry, [field]: value } : entry
      )
    }));
  }, []);

  // Language preference handlers
  const addLanguage = useCallback((lang) => {
    setProfileData((prev) => {
      if ((prev.languages || []).find(l => l.name === lang.name)) return prev;
      return { ...prev, languages: [...(prev.languages || []), lang] };
    });
    showToast(`Language "${lang.name}" added.`, "success");
  }, [showToast]);

  const removeLanguage = useCallback((langName) => {
    setProfileData((prev) => ({
      ...prev,
      languages: (prev.languages || []).filter(l => l.name !== langName)
    }));
    showToast("Language removed.", "info");
  }, [showToast]);

  const updateLanguage = useCallback((langName, field, value) => {
    setProfileData((prev) => ({
      ...prev,
      languages: (prev.languages || []).map(l =>
        l.name === langName ? { ...l, [field]: value } : l
      )
    }));
  }, []);

  const handleDocumentUpload = useCallback((docKey, file, fieldKey = "file") => {
    if (!file) return;
    const fileData = { name: file.name, size: formatFileSize(file.size) };
    setProfileData((prev) => {
      const currentDoc = prev.documents[docKey];
      if (!currentDoc) return prev;
      const nextDoc = { ...currentDoc, [fieldKey]: fileData };
      if (docKey === "nationalId") {
        nextDoc.status = nextDoc.frontFile ? "verified" : "missing";
      } else if (docKey !== "itiCertificate") {
        nextDoc.status = "uploaded";
      }
      return { ...prev, documents: { ...prev.documents, [docKey]: nextDoc } };
    });
    showToast(`${file.name} uploaded successfully.`, "success");
  }, [showToast]);

  const clearDocumentUpload = useCallback((docKey, fieldKey = "file") => {
    setProfileData((prev) => {
      const currentDoc = prev.documents[docKey];
      if (!currentDoc) return prev;
      const nextDoc = { ...currentDoc, [fieldKey]: null };
      if (docKey === "nationalId") {
        nextDoc.status = nextDoc.frontFile ? "verified" : "missing";
      } else if (docKey !== "itiCertificate") {
        nextDoc.status = DEFAULT_DOCUMENT_STATUS[docKey] || "optional";
      }
      return { ...prev, documents: { ...prev.documents, [docKey]: nextDoc } };
    });
    showToast("File removed.", "info");
  }, [showToast]);

  const addCustomDocument = useCallback(() => {
    setProfileData((prev) => ({
      ...prev,
      customDocuments: [...prev.customDocuments, {
        id: createId("doc"),
        label: `Additional Document ${prev.customDocuments.length + 1}`,
        status: "optional", type: "single",
        description: "Upload any additional certificate, license, or support document.",
        metaLines: ["Optional supporting document."], file: null, footerNote: "Optional document"
      }]
    }));
    showToast("New document slot added.", "info");
  }, [showToast]);

  const uploadCustomDocument = useCallback((docId, file) => {
    if (!file) return;
    const fileData = { name: file.name, size: formatFileSize(file.size) };
    setProfileData((prev) => ({
      ...prev,
      customDocuments: prev.customDocuments.map((doc) =>
        doc.id === docId ? { ...doc, file: fileData, status: "uploaded" } : doc
      )
    }));
    showToast(`${file.name} uploaded successfully.`, "success");
  }, [showToast]);

  const clearCustomDocument = useCallback((docId) => {
    setProfileData((prev) => ({
      ...prev,
      customDocuments: prev.customDocuments.map((doc) =>
        doc.id === docId ? { ...doc, file: null, status: "optional" } : doc
      )
    }));
    showToast("File removed.", "info");
  }, [showToast]);

  const saveSection = useCallback((sectionId) => {
    const sectionNames = {
      personal: "Personal Information",
      documents: "Documents",
      work: "Work History",
      education: "Education",
      skills: "Skills",
      languages: "Language Preferences",
      cv: "CV",
    };
    showToast(`${sectionNames[sectionId] || sectionId} saved successfully!`, "success");
  }, [showToast]);

  const WORK_ENTRY_TEMPLATE = {
    title: "", company: "", startDate: "", endDate: "",
    location: "", description: "", current: false
  };

  const openWorkModal = useCallback(() => {
    setNewWorkEntry(WORK_ENTRY_TEMPLATE);
    setShowWorkModal(true);
  }, []);

  const closeWorkModal = useCallback(() => {
    setShowWorkModal(false);
    setNewWorkEntry({});
  }, []);

  const updateNewWorkField = useCallback((field, value) => {
    setNewWorkEntry(prev => ({ ...prev, [field]: value }));
  }, []);

  const saveWorkEntry = useCallback(() => {
    if (!newWorkEntry.title || !newWorkEntry.company) {
      showToast("Role title and company name are required.", "error");
      return;
    }
    const entryWithId = { ...newWorkEntry, id: createId("work") };
    setProfileData(prev => ({ ...prev, workHistory: [...prev.workHistory, entryWithId] }));
    closeWorkModal();
    showToast("Work experience added successfully!", "success");
  }, [newWorkEntry, closeWorkModal, showToast]);

  return (
    <main className="main candidate-profile-v2">
      <section className="section-box mt-50 mb-50">
        <div className="container">
          <div className="row candidate-profile-v2-layout">
            <div className="col-lg-3 col-md-4 col-sm-12 candidate-profile-v2-left-col candidate-profile-v2-left-col-sticky">
              <ProfileSidebar
                profileData={profileData}
                completionPercent={completionPercent}
                activeSection={activeSection}
                onSectionChange={onSectionChange}
                onToggleAvailability={toggleAvailability}
              />
            </div>
            <div className="col-lg-9 col-md-8 col-sm-12">
              <ProfileTabs
                profileData={profileData}
                completionPercent={completionPercent}
                documentSummary={documentSummary}
                registerSectionRef={registerSectionRef}
                updateProfileField={updateProfileField}
                updateWorkEntry={updateWorkEntry}
                addWorkEntry={addWorkEntry}
                removeWorkEntry={removeWorkEntry}
                updateEducationEntry={updateEducationEntry}
                addEducationEntry={addEducationEntry}
                removeEducationEntry={removeEducationEntry}
                toggleSkill={toggleSkill}
                updateSkillEntry={updateSkillEntry}
                handleDocumentUpload={handleDocumentUpload}
                clearDocumentUpload={clearDocumentUpload}
                addCustomDocument={addCustomDocument}
                uploadCustomDocument={uploadCustomDocument}
                clearCustomDocument={clearCustomDocument}
                saveSection={saveSection}
                showWorkModal={showWorkModal}
                newWorkEntry={newWorkEntry}
                openWorkModal={openWorkModal}
                closeWorkModal={closeWorkModal}
                updateNewWorkField={updateNewWorkField}
                saveWorkEntry={saveWorkEntry}
                addLanguage={addLanguage}
                removeLanguage={removeLanguage}
                updateLanguage={updateLanguage}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CandidateProfilePage;
