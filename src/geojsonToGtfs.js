const geojsonToGtfs = require("geojson-to-gtfs");
const stops = require("./../out/stops.json");

function exportGtfs(outputPath) {
  // Lookup maps
  const lineLookup = new WeakMap();
  const lineToType = {};
  const lineToAgency = {};
  const lineToSpeed = {};
  const lineToColor = {};
  const agencyNameToId = {};
  let agencyId = 1;


  const gtfsConfig = (stopMapping) => ({
    prepareGeojsonFeature: (feature) => {
      const line = getLineFromProperties(feature.properties);
      lineLookup.set(feature, line);
      const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

      const times = feature.properties.opening_hours.split(";");
      const services = times.map((value,index) => {
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
      feature["services"]=services
    },
    agencyName: (feature) => {
      const name = feature.properties.network
      return name;
    },
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
    }, {
      serviceId: "serviceId",
      monday: true,
      tuesday: true,
      wednesday: false,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
      startDate: "20000101",
      endDate: "21000101",
    }],
    agencyLang: "Arabic",
    agencyTimezone: "UTC (GMT)",
    agencyUrl: (feature) => {
      return ""
    },
    stopId: (coords, coordsIndex, feature, featureIndex) => {

      const nodeId = feature.geometry.nodes[coordsIndex];
      return nodeId
    },
    stopName: (coords, coordsIndex, feature) => {
      const nodeId = feature.geometry.nodes[coordsIndex];
      const stopName = stops[nodeId];
      return stopName
    },
    routeId: (feature) => {
      return feature.properties.id;
    },
    routeShortName: (feature) => {
      const shortName = feature.properties.ref
      return shortName;
      lineLookup.get(feature)
    },
    routeLongName: (feature) => {
      const name = feature.properties.name
      return name;
    },
    routeType: (feature) => {
      const routeType = feature.properties.route || "bus"
      return routeType
    },
    routeColor: (feature) => {
      return "FFFFFF";
    },
    frequencyStartTime: (feature, featureIndex) => {
      const service=featureIndex.services.find(element => element.service_id ==feature.service_id);
      return service.start_date
    },
    frequencyEndTime: (feature, featureIndex) => {
      const service=featureIndex.services.find(element => element.service_id ==feature.service_id);
      return service.end_date
    },
    frequencyHeadwaySecs: (feature, featureIndex) => {
      const interval = featureIndex.properties.interval || '0';
      const currentInterval = Number(interval)
      return currentInterval * 60;
    },
    tripId: (serviceWindow, feature, featureIndex) => {
      return feature.properties.id + "-" + featureIndex
    },
    mapTrip: (serviceWindow, feature, featureIndex) => {
      return {
        trip_id: feature.properties.id + "-" + featureIndex,
        route_id: feature.properties.id,
        service_id: serviceWindow.service_id,
      };
    }
  });
  geojsonToGtfs(
    __dirname + "/../out/routes.geojson",
    __dirname + "/../out/gtfs.zip",
    gtfsConfig(stops)
  );
}

function getLineFromProperties(properties) {
  const lineCandidate = properties.ref || properties.name;

  return (
    lineCandidate
      // Only use text before the colon
      .split(":", 2)[0]
      // Remove car type
      .replace(/(?:Bus|Minibus|Microbus|Trufi)/gi, "")
      // Remove surrounding space
      .trim()
      // Remove everything but the last word
      .replace(/^(?:.+\s)+/, "")
  );
}
exportGtfs();
