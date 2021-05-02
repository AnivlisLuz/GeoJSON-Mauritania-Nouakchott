# geojson-to-gtfs

A library for Node.js to generate public transit feeds in the [GTFS format](https://developers.google.com/transit/gtfs/) from [GeoJSON](http://geojson.org/) Feature Collections.

[![NPM version](https://img.shields.io/npm/v/geojson-to-gtfs.svg?style=flat)](https://www.npmjs.com/package/geojson-to-gtfs)
[![GitHub release](https://img.shields.io/github/release/trufi-app/geojson-to-gtfs.svg)](https://github.com/trufi-app/geojson-to-gtfs/releases/)
[![Package dependencies](https://img.shields.io/david/trufi-app/geojson-to-gtfs.svg)](https://david-dm.org/trufi-app/geojson-to-gtfs)
[![GitHub license](https://img.shields.io/github/license/trufi-app/geojson-to-gtfs.svg)](https://github.com/trufi-app/geojson-to-gtfs/blob/master/LICENSE)

## Motivation
This project is part of a set of tools to provide travel data in countries where public transport works on demand and neither bus stops nor timetables exist. Check out https://github.com/trufi-app
to see more of our work.

## Installation

```bash
$ npm install geojson-to-gtfs
```

## Usage

Minimal example (using defaults):

```js
const geojsonToGtfs = require('geojson-to-gtfs');

// Reads GeoJSON file, writes GTFS file
geojsonToGtfs('./routes.geojson', './gtfs.zip');
```

Customize transformation:

```js
geojsonToGtfs('./routes.geojson', './gtfs.zip', {
  agencyUrl: "https://www.example.org", // Static value
  routeShortName: (feature) => feature.properties.line, // Callback
});
```

Usage without files:

```js
const geojson = {
  type: "FeatureCollection",
  features: [{
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [[-66.2806316, -17.394221], [-66.2788024, -17.3940565], /* ... */]
    }
  }
};

const userConfig = {
  // ...
};

// Pass in GeoJSON as object. Output path is omitted and GTFS data is returned.
const gtfs = geojsonToGtfs(geojson, userConfig);

/*
{
  agency: [ ... ],
  calendar: [ ... ],
  frequencies: [ ... ],
  routes: [ ... ],
  stop_times: [ ... ],
  stops: [ ... ],
  trips: [ ... ],
  shapes: [ ... ]
}
*/
```

## Handling missing information

As GeoJSON files describe geographic data structures and not public transit feeds, they lack a lot of crucial information. That is why this library was designed to give you lots of flexibility to fill in the gaps while transforming the data by defining static values or callbacks or overriding parts of the mapping altogether.

### Stop times

By default, stop times are generated based on vehicle speed and the duration between stops. The time spent at a stop can be defined with the `stopDuration` config value. If you need more control you can override the `mapStopTimes` function.

## Configuration

When transforming the GeoJSON to GTFS, field values will be determined by some default behaviour. You can change this behaviour for each field separately by overriding the respective key in the configuration or, when you need more flexibility, by overriding the respective mapping function.

Field values in the configuration can be either

* a primitive value that will be used for all generated rows or
* a callback that returns a primitive value. The callback arguments can be found in the listing below.

### GTFS values

| Name | Callback args | Default |
|------|---------------|---------|
| agencyId | feature, featureIndex | `featureIndex + 1` |
| agencyName | feature, featureIndex | `"UNNAMED"` |
| agencyTimezone | feature, featureIndex | `"America/La_Paz"` |
| agencyLang | feature, featureIndex | `"es"` |
| agencyUrl | feature, featureIndex | `""` |
| routeId | feature, featureIndex | `featureIndex + 1` |
| routeShortName | feature, featureIndex | `"UNNAMED"` |
| routeLongName | feature, featureIndex | `""` |
| routeType | feature, featureIndex | `routeType.BUS` |
| routeColor | feature, featureIndex | `"FF0000"` |
| stopId | coords, coordsIndex, feature, featureIndex | `` `${featureIndex}-${coordsIndex}` `` |
| stopName | coords, coordsIndex, feature, featureIndex | `"UNNAMED"` |
| stopLat | coords, coordsIndex, feature, featureIndex | `coords[1]` |
| stopLon | coords, coordsIndex, feature, featureIndex | `coords[0]` |
| tripId | serviceWindow, feature, featureIndex | `` `${serviceWindow.serviceId}-${featureIndex + 1}` `` |
| shapeId | feature, featureIndex | `featureIndex + 1` |
| shapePtLat | coords | `coords[1]` |
| shapePtLon | coords | `coords[0]` |
| shapePtSequence | coords, coordsIndex | `coordsIndex + 1` |
| shapeDistTraveled | coords, coordsIndex, feature, featureIndex, distance | `distance` (in kilometers) |
| frequencyStartTime | feature, featureIndex | `"00:00:00"` |
| frequencyEndTime | feature, featureIndex | `"24:00:00"` |
| frequencyHeadwaySecs | feature, featureIndex | `600` |

### Special values

| Name | Callback args | Default | Explanation |
|------|---------------|---------|-------------|
| vehicleSpeed | feature, featureIndex | `50` | Used to generate stop times |
| skipStopsWithinDistance | - | `0` | Skip stops that are too close to the previous stop in kilometers. A skipped stop is not considered a previous stop. Only accepts number value.
| stopDuration | - | `0` | Time spent at a stop when generating stop times. Only accepts number value.
| zipCompressionLevel | - | `1` | The deflate compression level for the output ZIP. Accepts values 1 (best speed) to 9 (best compression). Use 0 to disable compression.
| zipComment | - | - | Comment text for the output ZIP.

### Service dates

Service windows are defined ahead of time. Default:

```js
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
}]
```

### Mapping functions

These can be overridden to customize the GTFS output.

| Name | Args |
|------|------|
| mapAgency | feature, featureIndex |
| mapStop | coords, coordsIndex, feature, featureIndex |
| mapRoute | feature, featureIndex |
| mapTrip | serviceWindow, feature, featureIndex |
| mapStopTime | trip, stop, stopSequence, arrivalTime, departureTime |
| mapShapePoint | coords, coordsIndex, feature, featureIndex, distance |
| mapFrequency | trip, feature, featureIndex |
| mapService | serviceWindow |
| mapVehicleSpeed | feature, featureIndex |

### Hooks

These can be used to pre- or post-process data. Hooks do not expect any return value. Passed in objects can be modified directly.

| Name | Args | Explanation |
|------|------|-------------|
| prepareInput | data | Called before transforming the input data into GTFS output. Receives the deserialized GeoJSON as an argument.
| prepareGeojsonFeature | feature, featureIndex | Called for each Feature before it is transformed. |
| prepareOutput | data | Called before writing the transformed data into files. Keys represent the files to write, values their content.

## Constants

Some GTFS fields expect a [magic number](https://en.wikipedia.org/wiki/Magic_number_(programming) that conveys certain information, e.g. to specify the route type. Instead of using the numbers directly, you can use the pre-defined contants for better readability. These are set as properties on the `geojsonToGtfs` function and can be used like this:

```js
geojsonToGtfs.routeType.BUS
```

You can find all available constants in the `src/constants.js` file.

## Todo

* Implement missing GTFS files: calendar_dates.txt, fare_rules.txt, transfers.txt, feed_info.txt
* Add missing GTFS fields for the existing files
* Allow different stop times strategies
* Allow multiple frequencies per trip
* Improve how calendar data is defined
