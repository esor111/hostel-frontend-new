/**
 * Utility functions for unit conversion between meters and feet
 */

// Conversion constants
const METERS_TO_FEET = 3.28084;
const FEET_TO_METERS = 0.3048;

/**
 * Convert meters to feet
 * @param meters - Value in meters
 * @returns Value in feet
 */
export const metersToFeet = (meters: number): number => {
  return meters * METERS_TO_FEET;
};

/**
 * Convert feet to meters
 * @param feet - Value in feet
 * @returns Value in meters
 */
export const feetToMeters = (feet: number): number => {
  return feet * FEET_TO_METERS;
};

/**
 * Format meters as feet for display
 * @param meters - Value in meters
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string like "6.5 ft"
 */
export const formatMetersAsFeet = (meters: number, decimals: number = 1): string => {
  const feet = metersToFeet(meters);
  return `${feet.toFixed(decimals)} ft`;
};

/**
 * Format area in square meters as square feet for display
 * @param squareMeters - Area in square meters
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string like "70.5 sq ft"
 */
export const formatSquareMetersAsFeet = (squareMeters: number, decimals: number = 1): string => {
  const squareFeet = squareMeters * (METERS_TO_FEET * METERS_TO_FEET);
  return `${squareFeet.toFixed(decimals)} sq ft`;
};

/**
 * Format dimensions (width x height) from meters to feet
 * @param width - Width in meters
 * @param height - Height in meters
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string like "3.0 ft × 7.0 ft"
 */
export const formatDimensionsAsFeet = (width: number, height: number, decimals: number = 1): string => {
  const widthFt = metersToFeet(width);
  const heightFt = metersToFeet(height);
  return `${widthFt.toFixed(decimals)} ft × ${heightFt.toFixed(decimals)} ft`;
};