const constants = require('./constants');

module.exports = function createConfig(userConfig) {
  const config = {
    agencyId: (feature, featureIndex) => featureIndex + 1,
    agencyName: "UNNAMED",
    agencyTimezone: "America/La_Paz",
    agencyLang: "es",
    agencyUrl: "",
    routeId: (feature, featureIndex) => featureIndex + 1,
    routeShortName: "UNNAMED",
    routeLongName: "",
    routeType: constants.routeType.BUS,
    routeColor: "FF0000",
    stopId: (coords, coordsIndex, feature, featureIndex) => `${featureIndex}-${coordsIndex}`,
    stopName: "UNNAMED",
    stopLat: (coords) => coords[1],
    stopLon: (coords) => coords[0],
    tripId: (serviceWindow, feature, featureIndex) => `${serviceWindow.serviceId}-${featureIndex + 1}`,
    shapeId: (feature, featureIndex) => featureIndex + 1,
    shapePtLat: (coords) => coords[1],
    shapePtLon: (coords) => coords[0],
    shapePtSequence: (coords, coordsIndex) => coordsIndex + 1,
    shapeDistTraveled: (coords, coordsIndex, feature, featureIndex, distance) => distance,
    frequencyStartTime: "00:00:00",
    frequencyEndTime: "24:00:00",
    frequencyHeadwaySecs: 600, // every 10 minutes
    serviceWindows: [{
      serviceId: "mon-sun",
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
      startDate: "20000101",
      endDate: "21000101",
    }],
    vehicleSpeed: 50,
    skipStopsWithinDistance: 0,
    stopDuration: 0,
    mapAgency,
    mapStop,
    mapRoute,
    mapTrip,
    mapStopTime,
    mapShapePoint,
    mapFrequency,
    mapService,
    mapVehicleSpeed,
    prepareInput: null,
    prepareGeojsonFeature: null,
    prepareOutput: null,
    ...userConfig,
  };

  return config;

  function getValueForKey(key, ...args) {
    const value = config[key];

    if (typeof value === "function") {
      return value(...args);
    }

    return value;
  }

  function mapAgency(feature, featureIndex) {
    return {
      agency_id: getValueForKey("agencyId", feature, featureIndex),
      agency_name: getValueForKey("agencyName", feature, featureIndex),
      agency_lang: getValueForKey("agencyLang", feature, featureIndex),
      agency_timezone: getValueForKey("agencyTimezone", feature, featureIndex),
      agency_url: getValueForKey("agencyUrl", feature, featureIndex),
    };
  }

  function mapStop(coords, coordsIndex, feature, featureIndex) {
    return {
      stop_id: getValueForKey("stopId", coords, coordsIndex, feature, featureIndex),
      stop_name: getValueForKey("stopName", coords, coordsIndex, feature, featureIndex),
      stop_lat: getValueForKey("stopLat", coords, coordsIndex, feature, featureIndex),
      stop_lon: getValueForKey("stopLon", coords, coordsIndex, feature, featureIndex),
    };
  }

  function mapRoute(feature, featureIndex) {
    return {
      route_id: getValueForKey("routeId", feature, featureIndex),
      agency_id: getValueForKey("agencyId", feature, featureIndex),
      route_short_name: getValueForKey("routeShortName", feature, featureIndex),
      route_long_name: getValueForKey("routeLongName", feature, featureIndex),
      route_type: getValueForKey("routeType", feature, featureIndex),
      route_color: getValueForKey("routeColor", feature, featureIndex),
    };
  }

  function mapTrip(serviceWindow, feature, featureIndex) {
    return {
      trip_id: getValueForKey("tripId", serviceWindow, feature, featureIndex),
      route_id: getValueForKey("routeId", feature, featureIndex),
      service_id: serviceWindow.serviceId,
    };
  }

  function mapStopTime(trip, stop, stopSequence, arrivalTime, departureTime) {
    return {
      trip_id: trip.trip_id,
      stop_sequence: stopSequence,
      stop_id: stop.stop_id,
      arrival_time: arrivalTime,
      departure_time: departureTime,
    };
  }

  function mapShapePoint(coords, coordsIndex, feature, featureIndex, distance) {
    return {
      shape_id: getValueForKey("shapeId", feature, featureIndex),
      shape_pt_lat: getValueForKey("shapePtLat", coords, coordsIndex, feature, featureIndex),
      shape_pt_lon: getValueForKey("shapePtLon", coords, coordsIndex, feature, featureIndex),
      shape_pt_sequence: getValueForKey("shapePtSequence", coords, coordsIndex, feature, featureIndex),
      shape_dist_traveled: getValueForKey("shapeDistTraveled", coords, coordsIndex, feature, featureIndex, distance),
    };
  }

  function mapFrequency(trip, feature, featureIndex) {
    return {
      trip_id: trip.trip_id,
      start_time: getValueForKey("frequencyStartTime", trip, feature, featureIndex),
      end_time: getValueForKey("frequencyEndTime", trip, feature, featureIndex),
      headway_secs: getValueForKey("frequencyHeadwaySecs", trip, feature, featureIndex),
    };
  }

  function mapService(feature) {
    const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

    const times = feature.properties.opening_hours.split(";");
    const response = times.map((value,index) => {
      const text = value.match("(.*)-(.*) (.*)-(.*)")
      const init = days.indexOf(text[1])
      const end = days.indexOf(text[2])
      return {
        service_id: feature.properties.id+"_"+index,
        monday: init <= 0 && 0 <= end ? 1 : 0,
        tuesday: init <= 1 && 1 <= end ? 1 : 0,
        wednesday: init <= 2 && 2 <= end ? 1 : 0,
        thursday: init <= 3 && 3 <= end ? 1 : 0,
        friday: init <= 4 && 4 <= end ? 1 : 0,
        saturday: init <= 5 && 5 <= end ? 1 : 0,
        sunday: init <= 6 && 6 <= end ? 1 : 0,
        start_date: text[3],
        end_date: text[4],
      };
    })
    return response;
  }

  function mapVehicleSpeed(feature, featureIndex) {
    return getValueForKey("vehicleSpeed", feature, featureIndex);
  }
};
