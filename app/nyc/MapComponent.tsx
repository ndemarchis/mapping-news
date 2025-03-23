import { getLocations } from "./utils/server";
import MapComponentClient from "./MapComponentClient";

async function MapComponent() {
  const locationsData = await getLocations();

  return <MapComponentClient locationsData={locationsData} />;
}

export default MapComponent;
