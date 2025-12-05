// Utility functions for location tracking
// This can be integrated with Google Maps API for real-time tracking

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

export const getLocationFromCoordinates = async (latitude, longitude) => {
  // This would typically use Google Maps Geocoding API
  // For now, return a placeholder
  try {
    if (process.env.GOOGLE_MAPS_API_KEY) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
    }
    return `Lat: ${latitude}, Lng: ${longitude}`;
  } catch (error) {
    console.error('Error getting location:', error);
    return `Lat: ${latitude}, Lng: ${longitude}`;
  }
};

export const updateOrderLocation = async (order, latitude, longitude, status) => {
  const address = await getLocationFromCoordinates(latitude, longitude);
  
  order.locationUpdates.push({
    location: {
      latitude,
      longitude,
      address,
    },
    status: status || order.status,
    timestamp: new Date(),
  });

  await order.save();
  return order;
};

