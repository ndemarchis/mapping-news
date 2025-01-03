import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import { useCallback } from "react";
import { FeatureLike } from "ol/Feature";
import Style from "ol/style/Style";
import { Circle } from "ol/geom";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";


const sizeDependentDotStyles = {
  radius: viewportSize.width < 768 ? 5 : 3,
  strokeWidth: viewportSize.width < 768 ? 2 : 1.5,
};

const dotStyle = 
  (feature: FeatureLike) =>
    new Style({
      image: new Circle({
        stroke: new Stroke({
          width: sizeDependentDotStyles.strokeWidth,
          color: "rgba(255, 255, 255, 0.5)",
        }),
        fill: new Fill({
          color: "rgba(0, 0, 255, 0.5)",
        }),
        radius: sizeDependentDotStyles.radius,
      }),
    }),


function initializeMap() {
    const osmLayer = new TileLayer({
      preload: Infinity,
      source: new OSM(),
    });

    const vectorSource = new VectorSource({
      url: "/nyc/live/locations",
      format: new GeoJSON(),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature, other) => {
        return dotStyle(feature);
      },
    });

    const map = new Map({
      target: mapElement.current,
      layers: [osmLayer, vectorLayer],
      view: new View({
        center: [-8233189, 4966723],
        zoom: 11,
        projection: "EPSG:3857",
      }),
    });

    const selectClick = new Select({
      condition: click,
      // style: selectStyle,
    });

    map.addInteraction(selectClick);
    selectClick.on("select", async (e) => {
      const features = e.selected;
      const feature = features?.[0];
      await handleFeatureClick(feature);
    });

    return () => map.setTarget(undefined);
  }

  export default initializeMap;