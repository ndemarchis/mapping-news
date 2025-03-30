export const getPlaceIdRelativeHref = (placeId?: string | null) => {
  if (!placeId) return "/nyc";
  return `/nyc/${placeId}`;
};
