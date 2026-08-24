// services/candidate/locationService.js
//
// Syncs the candidate's browser/device geolocation to the backend so it
// stays auto-updated once permission is granted. See useLocationSync hook
// for how/when this gets called.

import api from "../api";
import { getCandidateId } from "@/utils/authHelper";

export const getCandidateLocation = () => {
  const candidateId = getCandidateId();
  return api.get(`/api/candidate/profile/location?candidateId=${candidateId}`);
};

export const updateCandidateLocation = ({ latitude, longitude, permissionGranted = true }) => {
  const candidateId = getCandidateId();

  return api.put(`/api/candidate/profile/location?candidateId=${candidateId}`, {
    latitude,
    longitude,
    permissionGranted,
  });
};
