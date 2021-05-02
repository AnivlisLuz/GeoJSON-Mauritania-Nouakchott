const { point } = require('@turf/helpers')
const isEqual = require('@turf/boolean-equal').default
const debug = require('./debug')
const routeExtractor = require('./route_extractor')
const stopsExtractor = (route, ways) => {
    const members = route.members.filter(element => element.type == "node")
    const points = []
    const nodes = []
    const stops = {}
    members.forEach(value => {
        const element = ways[value.ref]
        nodes.push(element.id)
        points.push([element.lon, element.lat])
        stops[element.id] = [element.tags.name || ""]
    })
    return { points: points, nodes: nodes, stops: stops }
}
module.exports = function ({ routes, ways, mapProperties, formatStopName }) {
    const stops = {}
    const geojson_features = []
    let log_file = []

    for (let key in routes) {
        const current_route = routes[key]
        const name = current_route.tags.name
        debug(`Processing route ${name}`)

        try {
            const data = stopsExtractor(current_route, ways)

            log_file.push({ id: current_route.id, tags: current_route.tags })

            geojson_features.push({
                "type": "Feature",
                "properties": mapProperties({ ...current_route.tags, id: current_route.id }),
                "geometry": {
                    "type": "LineString",
                    "coordinates": data.points,
                    "nodes": data.nodes,
                }
            })

            // Merge stop names
            Object.keys(data.stops).forEach(stop_id => {
                if (stops[stop_id]) {
                    stops[stop_id] = stops[stop_id].concat(data.stops[stop_id])
                } else {
                    stops[stop_id] = data.stops[stop_id]
                }
            })
        } catch (error) {
            debug(`Error: ${error.extractor_error || error.message}`)
            log_file.push({
                id: current_route.id,
                error: error.extractor_error ? error : "not controlled",
                tags: current_route.tags
            })
        }
    }

    log_file.sort((a, b) => {
        a = a.tags.ref || "0a"
        b = b.tags.ref || "0a"
        let aIsNumber = !isNaN(a)
        let bIsNumber = !isNaN(b)
        if (aIsNumber && bIsNumber) {
            return parseInt(a) - parseInt(b)
        } else if (aIsNumber || bIsNumber) {
            return aIsNumber ? 1 : -1
        } else {
            return a.localeCompare(b)
        }
    })

    const geojson_feature_collection = {
        "type": "FeatureCollection",
        "features": geojson_features
    }
    const formatted_stops = format_stop(stops, formatStopName)

    return {
        geojson: geojson_feature_collection,
        stops: formatted_stops,
        log: log_file,
    }
}

function format_stop(stops, formatStopName) {
    const result = {}

    Object.keys(stops).forEach(stop_id => {
        const stop_names = stops[stop_id]
        const stop_names_filtered = stop_names
            .filter((value, index, self) => self.indexOf(value) === index)
            .filter(value => value !== "")
        const stop_name = formatStopName(stop_names_filtered);

        result[stop_id] = stop_name
    })

    return result
}

function filterPointsAndNodes(points, nodes) {
    const result = { points: [], nodes: [] }
    // let last = null

    for (let i = 0; i < points.length; i++) {
        const cur = points[i]

        // if (last) {
        //     if (isEqual(point(last), point(cur))) {
        //         continue
        //     }
        // }

        // last = cur
        result.points.push(cur)
        result.nodes.push(nodes[i])
    }

    return result
}
