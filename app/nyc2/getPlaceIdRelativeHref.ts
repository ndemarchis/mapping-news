export const getPlaceIdRelativeHref = (placeId?: string | null) => {
  if (!placeId) return "/nyc2";
  return `/nyc2/${placeId}`;
};
