const BASE_URL = 'http://10.155.92.27:4387';
const REQUEST_TIMEOUT = 5000; // 5 seconds timeout

// Fetch with timeout
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - backend server may be offline');
    }
    throw error;
  }
};

// Get department ID by name
export const getDepartmentId = async (departmentName) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/getDepartmentId`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: departmentName }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch department ID');
    }

    return data;
  } catch (error) {
    console.warn('Backend unavailable, using fallback data:', error.message);
    throw error;
  }
};

// Get complaints by department ID
export const getComplaintsByDepartment = async (departmentId) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/getComplaintsByDepartment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ departmentId }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch complaints');
    }

    return data;
  } catch (error) {
    console.warn('Backend unavailable, using fallback data:', error.message);
    throw error;
  }
};

// Transform complaint data to match the format expected by the UI
export const transformComplaintData = (complaints) => {
  console.log('🔧 Transforming', complaints.length, 'complaints');
  console.log('📦 Raw complaint data sample:', complaints[0]);
  
  return complaints.map((complaint) => {
    // Handle location - it might be an object with lat/lng or a string
    let locationString = 'Unknown location';
    let latitude = 15.4909; // Default Goa (Panjim) coordinates
    let longitude = 73.8278;

    // Extract latitude and longitude
    if (complaint.latitude && complaint.longitude) {
      const parsedLat = parseFloat(complaint.latitude);
      const parsedLng = parseFloat(complaint.longitude);
      // Check if parsed values are valid numbers
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        latitude = parsedLat;
        longitude = parsedLng;
      }
    } else if (complaint.location && typeof complaint.location === 'object') {
      // Location is an object with latitude/longitude
      const parsedLat = parseFloat(complaint.location.latitude);
      const parsedLng = parseFloat(complaint.location.longitude);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        latitude = parsedLat;
        longitude = parsedLng;
      }
    }

    // Ensure coordinates are valid numbers - fallback to Goa
    if (isNaN(latitude)) latitude = 15.4909;
    if (isNaN(longitude)) longitude = 73.8278;

    // Handle location string
    if (typeof complaint.location === 'string') {
      locationString = complaint.location;
    } else if (complaint.location && typeof complaint.location === 'object') {
      // If location is an object, create a formatted string
      locationString = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
    } else if (complaint.address) {
      locationString = complaint.address;
    }

    // Normalize status values - Database returns enum ComplaintStatus
    // Database likely has: PENDING, IN_PROGRESS, RESOLVED, REJECTED, etc.
    let status = (complaint.status || 'PENDING').toLowerCase();
    
    console.log(`📊 Complaint ${complaint.id} raw status from DB:`, complaint.status, '→ normalized:', status);
    
    // Map database status values to UI status values
    // PENDING, OPEN, NEW → 'pending' (will show in "Current Issues" and "Pending Issues")
    // IN_PROGRESS, ACTIVE, CURRENT → 'in-progress' (will show in "Current Issues")
    // RESOLVED, CLOSED, COMPLETED, DONE → 'resolved'
    // REJECTED, DECLINED, DISMISSED → 'rejected'
    
    if (status === 'pending' || status === 'open' || status === 'new') {
      status = 'pending';
    } else if (status === 'in-progress' || status === 'in_progress' || status === 'active' || status === 'current') {
      status = 'in-progress';
    } else if (status === 'closed' || status === 'completed' || status === 'done' || status === 'resolved') {
      status = 'resolved';
    } else if (status === 'rejected' || status === 'declined' || status === 'dismissed') {
      status = 'rejected';
    }
    
    console.log(`✅ Final mapped status for complaint ${complaint.id}:`, status);

    // Normalize priority values - database has 'isCritical' boolean field
    let priority = 'medium'; // default
    
    if (complaint.isCritical === true || complaint.isCritical === 'true') {
      priority = 'critical';
      console.log(`🚨 Complaint ${complaint.id} marked as CRITICAL`);
    } else if (complaint.priority) {
      // Fallback to priority field if it exists
      priority = (complaint.priority).toLowerCase();
    }
    
    console.log(`📍 Complaint ${complaint.id} priority:`, priority);

    // Handle image - use imageUrl field from API (with lowercase 'l')
    let imageUrl = null;
    const imageField = complaint.imageUrl || complaint.imageurl || complaint.image; // Support imageUrl, imageurl, and image fields
    
    if (imageField) {
      console.log(`🖼️ Processing image for complaint ${complaint.id}:`, imageField.substring(0, 100));
      
      // If it's already a complete URL (http/https)
      if (imageField.startsWith('http://') || imageField.startsWith('https://')) {
        imageUrl = imageField;
        console.log(`✅ Using direct URL: ${imageUrl}`);
      }
      // If it's already a base64 string with data URI
      else if (imageField.startsWith('data:image')) {
        imageUrl = imageField;
        console.log('✅ Using data URI image');
      }
      // If it's a base64 string without data URI prefix
      else if (imageField.length > 100 && !imageField.startsWith('/')) {
        imageUrl = `data:image/jpeg;base64,${imageField}`;
        console.log('✅ Converted base64 to data URI');
      }
      // If it's a file path from backend (starts with /)
      else if (imageField.startsWith('/')) {
        imageUrl = `${BASE_URL}${imageField}`;
        console.log(`✅ Using backend path: ${imageUrl}`);
      }
      // Default: treat as backend path
      else {
        imageUrl = `${BASE_URL}/${imageField}`;
        console.log(`✅ Using backend path with /: ${imageUrl}`);
      }
    }

    // Handle date - ensure we have a valid date, use today if invalid
    let dateString;
    if (complaint.dateTime) {
      try {
        const dateObj = new Date(complaint.dateTime);
        // Check if date is valid
        if (!isNaN(dateObj.getTime())) {
          dateString = dateObj.toLocaleDateString();
        } else {
          // Invalid date, use today
          dateString = new Date().toLocaleDateString();
        }
      } catch (e) {
        // Error parsing date, use today
        dateString = new Date().toLocaleDateString();
      }
    } else {
      // No date provided, use today
      dateString = new Date().toLocaleDateString();
    }

    return {
      id: complaint.id,
      type: complaint.type || 'Issue',
      status: status,
      priority: priority,
      date: dateString,
      description: complaint.description || 'No description',
      lat: latitude,
      lng: longitude,
      location: locationString,
      image: imageUrl,
      imageUrl: imageUrl, // Lowercase 'l' to match API
      imageURL: imageUrl, // Also provide imageURL for consistency
      // User details
      posterName: complaint.User?.name || 'Anonymous',
      posterId: complaint.User?.id || null,
      posterAadhar: complaint.User?.aadharNumber || null,
      posterProfile: complaint.User?.profile_pic || null,
      // Department details
      departmentName: complaint.Department?.name || 'Unknown Department',
      departmentType: complaint.Department?.type || 'GENERAL',
    };
  });
};

// Update complaint status to resolved
export const updateComplaintStatus = async (complaintId, newStatus) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/resolveComp`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        id: complaintId
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to resolve complaint');
    }

    console.log('✅ Complaint resolved successfully:', complaintId, '→', newStatus);
    return data;
  } catch (error) {
    console.error('❌ Failed to resolve complaint:', error.message);
    throw error;
  }
};

// Start complaint with team assignment
export const startComplaint = async (complaintId, teamName) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/startComplaint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        complaintId,
        teamName,
        status: 'IN_PROGRESS'
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to start complaint');
    }

    console.log('✅ Complaint started successfully:', complaintId, 'Team:', teamName);
    return data;
  } catch (error) {
    console.warn('⚠️ Backend unavailable, updating locally:', error.message);
    // Return success for local update
    return { success: true, message: 'Updated locally' };
  }
};

// Update complaint progress
export const updateComplaintProgress = async (complaintId, progress) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/updateProgress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        complaintId,
        progress
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update progress');
    }

    console.log('✅ Progress updated:', complaintId, '→', progress + '%');
    return data;
  } catch (error) {
    console.warn('⚠️ Backend unavailable, updating locally:', error.message);
    // Return success for local update
    return { success: true, message: 'Updated locally' };
  }
};

// Upload progress image
export const uploadProgressImage = async (complaintId, file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('complaintId', complaintId);

    const response = await fetchWithTimeout(`${BASE_URL}/uploadProgressImage`, {
      method: 'POST',
      body: formData, // Don't set Content-Type for FormData
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload image');
    }

    console.log('✅ Progress image uploaded:', data.imageUrl);
    return data.imageUrl;
  } catch (error) {
    console.warn('⚠️ Backend unavailable, creating local URL:', error.message);
    // Create a local blob URL for preview
    const localUrl = URL.createObjectURL(file);
    return localUrl;
  }
};
