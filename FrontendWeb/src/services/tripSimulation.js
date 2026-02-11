export class TripSimulationService {
  static simulateTripMovement(startCoords, endCoords, progress) {
    const [startLat, startLng] = startCoords;
    const [endLat, endLng] = endCoords;
    
    const progressRatio = progress / 100;
    
    const lat = startLat + (endLat - startLat) * progressRatio;
    const lng = startLng + (endLng - startLng) * progressRatio;
    
    return [lat, lng];
  }
  
  static calculateRemainingTime(totalDuration, progress) {
    const remainingPercentage = 100 - progress;
    return Math.round((totalDuration * remainingPercentage) / 100);
  }
  
  static calculateDistance(startCoords, endCoords) {
    const R = 6371;
    const [lat1, lon1] = startCoords.map(coord => coord * Math.PI / 180);
    const [lat2, lon2] = endCoords.map(coord => coord * Math.PI / 180);
    
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }
}