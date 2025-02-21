import { NullableLocation, Location } from "../../types";
import Color from "colorjs.io";

export const isPartiallyNullablePoint = (
  point: NullableLocation,
): point is Location => {
  return typeof point.lat === "number" && typeof point.lon === "number";
};

export const getDotSizeFactor = (count: number) => {
  if (!(count >= 0)) return 1;
  return Math.max(1, Math.log(count) / Math.log(2.2) + 1);
};

export const getDotColor = ({
  today,
  pubDate,
}: {
  today: Date;
  pubDate: Date;
}): string => {
  const daysDiff =
    (today.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
  const percentage = Math.E ** -Math.abs(daysDiff / 3.2);
  return getColorFromPercentage({ percentage });
};

const getColorFromPercentage = ({
  percentage,
  minHue = 195,
  maxHue = 260,
}: {
  percentage: number;
  minHue?: number;
  maxHue?: number;
}): string => {
  const hue = percentage * (maxHue - minHue) + minHue;
  const a = 40 + percentage * 20;
  const color = new Color(`hsl(${hue} 100% 50% / ${a}%)`);
  return color.toString({format: 'hex'});
};
