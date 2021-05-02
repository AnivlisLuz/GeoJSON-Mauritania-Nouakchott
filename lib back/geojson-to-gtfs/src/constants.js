const locationType = {
  STOP: 0,
  STATION: 1,
  STATION_ENTRANCE: 2,
};

const wheelchairBoardingStop = {
  NO_INFORMATION: 0,
  SOME_POSSIBLE: 1,
  NOT_POSSIBLE: 2,
};

const wheelchairBoardingStation = {
  INHERIT_FROM_PARENT: 0,
  PLATFORM_ACCESSIBLE: 1,
  PLATFORM_NOT_ACCESSIBLE: 2,
};

const wheelchairBoardingStationEntrance = {
  INHERIT_FROM_PARENT: 0,
  ENTRANCE_ACCESSIBLE: 1,
  ENTRANCE_NOT_ACCESSIBLE: 2,
};

const wheelchairAccessible = {
  NO_INFORMATION: 0,
  IS_ACCESSIBLE: 1,
  IS_NOT_ACCESSIBLE: 2,
};

const bikesAllowed = {
  NO_INFORMATION: 0,
  IS_ALLOWED: 1,
  IS_NOT_ALLOWED: 2,
};

const routeType = {
  TRAM: 0,
  STREETCAR: 0,
  LIGHT_RAIL: 0,
  SUBWAY: 1,
  METRO: 1,
  RAIL: 2,
  BUS: 3,
  FERRY: 4,
  CABLE_TRAM: 5,
  AERIAL_LIFT: 6,
  FUNICULAR: 7,
};

const pickupTypes = {
  REGULARLY_SCHEDULED: 0,
  NOT_AVAILABLE: 1,
  MUST_PHONE_AGENCY: 2,
  MUST_COORDINATE_WITH_DRIVER: 3,
};

const dropOffType = {
  REGULARLY_SCHEDULED: 0,
  NOT_AVAILABLE: 1,
  MUST_PHONE_AGENCY: 2,
  MUST_COORDINATE_WITH_DRIVER: 3,
};

const timepoint = {
  APPROXIMATE: 0,
  EXACT: 1,
};

const exceptionType = {
  ADDED_FOR_DATE: 1,
  REMOVED_FOR_DATE: 2,
};

const paymentMethod = {
  PAID_ON_BOARD: 0,
  PAID_BEFORE_BOARDING: 1,
};

const transfers = {
  NO_TRANSFERS_PERMITTED: 0,
  TRANSFER_ONCE: 1,
  TRANSFER_TWICE: 2,
  TRANSFER_UNLIMITED: '',
};

const transferType = {
  RECOMMENDED_TRANSFER_POINT: 0,
  TIMED_TRANSFER: 1,
  TRANSFER_WITH_MIN_TIME: 2,
  TRANSFER_NOT_POSSIBLE: 3,
};

module.exports = {
  locationType,
  wheelchairBoardingStop,
  wheelchairBoardingStation,
  wheelchairBoardingStationEntrance,
  wheelchairAccessible,
  bikesAllowed,
  routeType,
  pickupTypes,
  dropOffType,
  timepoint,
  exceptionType,
  paymentMethod,
  transfers,
  transferType,
};
