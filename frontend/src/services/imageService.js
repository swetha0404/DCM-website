
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
console.log("API Base:", API_BASE);

/**
 * Upload object detection result image to S3 and update res_url + res_count in DB
 * @param {FormData} formData - Includes result image file + imageName + count
 * @param {string} token - Auth token from sessionStorage
 */
export const uploadDetectionResult = async (formData, token) => {
  try {
    const res = await fetch(`${API_BASE}/image/detect?imageName=${formData.get("imageName")}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Don't set Content-Type when using FormData
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Failed to upload detection result:", data);
    }

    return { success: res.ok, ...data };
  } catch (err) {
    console.error("❌ Network error during result upload:", err);
    return { success: false, message: "Detection result upload failed" };
  }
};
