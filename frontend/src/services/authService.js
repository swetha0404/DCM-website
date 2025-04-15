
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
console.log("API Base:", API_BASE);

/** Login with identifier (email or username) + password */
export const loginUser = async (credentials) => {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    return {
      success: res.ok,
      ...data,
      message: data.message || (res.ok ? "Login successful" : "Login failed"),
    };
  } catch (err) {
    return {
      success: false,
      message: "Something went wrong. Try again later.",
    };
  }
};
/** Register new user */
export const registerUser = async (userData) => {
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    return {
      success: res.ok,
      ...data,
      message: data.message || (res.ok ? "Registered successfully" : "Registration failed"),
    };
  } catch (err) {
    return {
      success: false,
      message: "Network error during registration",
    };
  }
};

/** Logout user by clearing token */
export const logoutUser = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

/** Update user account information */
export const updateAccountSettings = async (formData, token) => {
  try {
    const res = await fetch(`${API_BASE}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    return { success: res.ok, ...data };
  } catch {
    return { success: false, message: "Account update failed" };
  }
};

/** Get all users (admin access, token required) */
export const getAllUsers = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return { success: res.ok, ...data };
  } catch (err) {
    return { success: false, message: "Failed to load users" };
  }
};


/** Upload image to S3 bucket */
export const uploadUserImage = async (file, imageName, token) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/upload-image?imageName=${imageName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data;
};

/** Get images uploaded by the user */
export const getUserImages = async (token) => {
  try {
    const res = await fetch(`${API_BASE}/images`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return { success: res.ok, images: Array.isArray(data) ? data : [] }; 
  } catch (err) {
    return { success: false, message: "Failed to load images" };
  }
};

export const updateImageName = async (oldName, newName, token) => {
  const res = await fetch(`${API_BASE}/image/update-name`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldName, newName }),
  });

  const data = await res.json();
  return { success: res.ok, ...data };
};

export const updateImageFile = async (imageName, file, token) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/image/update-file?imageName=${imageName}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  return { success: res.ok, ...data };
};

export const deleteImage = async (imageName, token) => {
  const res = await fetch(`${API_BASE}/image/${imageName}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return { success: res.ok, ...data };
};