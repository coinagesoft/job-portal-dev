const axios = require("axios");

const candidateId = "b4b5eeca-648e-487a-b99d-f8e77f6c8a14"; // from previous screenshot
const url = `https://jobportal.coinage.in/api/candidate/profile/completion?candidateId=${candidateId}`;

axios.get(url)
  .then(res => {
    console.log("Success:", res.data);
  })
  .catch(err => {
    console.error("Error:", err.response ? err.response.status : err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
    }
  });
