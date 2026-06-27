export const uploadEducationCertificate = async (
  educationData,
  file
) => {
  const candidateId = getCandidateId();

  const formData = new FormData();

  formData.append(
    "EducationLevel",
    educationData.title
  );

  formData.append(
    "InstituteName",
    educationData.institution
  );

  formData.append(
    "MarksPercentage",
    educationData.marksPercentage || ""
  );

  formData.append(
    "PassoutYear",
    educationData.passoutYear || ""
  );

  formData.append(
    "CertificateNumber",
    educationData.certificateNumber || ""
  );

  formData.append("certificate", file);

  return api.post(
    `/api/candidate/profile/documents/education-certificate?candidateId=${candidateId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const deleteEducationCertificate = async (
  educationId
) => {
  const candidateId = getCandidateId();

  return api.delete(
    `/api/candidate/profile/documents/education-certificate/${educationId}?candidateId=${candidateId}`
  );
};

export const getEducationCertificates = async () => {
  const candidateId = getCandidateId();

  return api.get(
    `/api/candidate/profile/documents/education-certificate?candidateId=${candidateId}`
  );
};