const debug = require('debug')('geojson-to-gtfs');
const uniqBy = require('lodash.uniqby');
const distanceBetween = require('@turf/distance').default;
const secondsToTime = require('./secondsToTime');
const createConfig = require('./config');

module.exports = function transform(input, userConfig) {
  const { type, features } = input;
  const config = createConfig(userConfig);
  const {
    serviceWindows,
    mapAgency, // feature, featureIndex
    mapStop, // coords, coordsIndex, feature, featureIndex
    mapShapePoint, // coords, coordsIndex, feature, featureIndex, distance
    mapRoute, // feature, featureIndex
    mapTrip, // serviceWindow, feature, featureIndex
    mapStopTime, // trip, stop, stopSequence, time
    mapFrequency, // trip, feature, featureIndex
    mapService, // serviceWindow
    mapVehicleSpeed, // feature, featureIndex
  } = config;

  if (type !== 'FeatureCollection') {
    throw `Expected FeatureCollection, found ${type}, Aborting`;
  }

  if (config.prepareGeojsonFeature) {
    debug('Preparing GeoJSON features');
    features.forEach(config.prepareGeojsonFeature);
  }

  const agencies = features.map(mapAgency);
  const calendar = features.map(value=>value.services).reduce((accumulator, currentValue) => accumulator.concat(currentValue));
  const routes = features.map(mapRoute);
  const trips = [];
  const frequencies = [];
  const stops = [];
  const stopTimes = [];
  const shapePoints = [];

  features.forEach((feature, featureIndex) => {
    debug('Processing GeoJSON feature %d', featureIndex);

    const routeStops = [];
    const vehicleSpeed = mapVehicleSpeed(feature, featureIndex);
    const speed = vehicleSpeed / 60 / 60 * 1000;
    let previousCoords = null;
    let totalDistance = 0;

    // Generate a stop for each GeoJSON point
    feature.geometry.coordinates.forEach((coords, coordsIndex) => {
      let distance = 0;

      if (previousCoords) {
        distance = distanceBetween(previousCoords, coords, { units: 'kilometers' });
        totalDistance += distance;

        // if (distance <= config.skipStopsWithinDistance) {
        //   debug('Skipped stop %d (distance to previous stop is less or equal %d)', coordsIndex, config.skipStopsWithinDistance);
        //   return;
        // }
      }

      const stop = mapStop(coords, coordsIndex, feature, featureIndex);
      const shapePoint = mapShapePoint(coords, coordsIndex, feature, featureIndex, totalDistance);
      stop._distance = distance;
      stops.push(stop);
      routeStops.push(stop);
      shapePoints.push(shapePoint);
      previousCoords = coords;
    });

    // Generate a trip per service window
    feature.services.forEach(serviceWindow => {
      const trip = mapTrip(serviceWindow, feature, featureIndex);
      trips.push(trip);

      // @todo generate multiple frequencies per trip
      const frequency = mapFrequency(trip, feature, featureIndex);
      frequencies.push(frequency);

      let seconds = 0;

      routeStops.forEach((stop, stopSequence) => {
        seconds += Math.ceil((stop._distance * 1000) / speed);

        const arrivalTime = secondsToTime(seconds);
        const departureTime = secondsToTime(seconds + config.stopDuration);
        const stopTime = mapStopTime(trip, stop, stopSequence, arrivalTime, departureTime);
        stopTimes.push(stopTime);
      });
    });
  });

  return {
    agency: uniqBy(agencies, 'agency_id'),
    calendar: uniqBy(calendar, 'service_id'),
    routes: uniqBy(routes, 'route_id'),
    trips: uniqBy(trips, 'trip_id'),
    frequencies,
    stops: uniqBy(stops, 'stop_id'),
    'stop_times': stopTimes,
    shapes: shapePoints,
  };
};
