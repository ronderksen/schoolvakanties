import ical from "ical-generator";
import NodeCache from "node-cache";

const ttl = 60 * 60 * 24 * 7; // 1 week

const cache = new NodeCache({
    stdTTL: ttl
});
const dataSourceUrl =
    "https://opendata.rijksoverheid.nl/v1/sources/rijksoverheid/infotypes/schoolholidays?output=json";

async function parseData(json, requestedRegion, cal) {
    json.forEach(({content}) => {
        const schoolyear = content[0].schoolyear;
        return content[0].vacations.forEach(({type, regions}) => {
            const reg = regions.find(({region}) => region === requestedRegion || region === "heel Nederland");
            if (reg) {
                cal.createEvent({
                    start: reg.startdate,
                    end: reg.enddate,
                    allDay: true,
                    busystatus: "free",
                    summary: `${type.trim()} ${reg.region !== "heel Nederland" ? reg.region.trim() : ""} ${schoolyear.trim()}`
                });
            }
        });
    });
    cache.set(requestedRegion, cal.toJSON());
}

function getData(region) {
    const data = cache.get(region);
    if (data === undefined) {
        const cal = ical({
            domain: "localhost",
            name: `schoolvakanties ${region}`
        });
        return fetch(dataSourceUrl)
            .then(async res => {
                if (res.ok) {
                    const json = await res.json();
                    console.log(region);
                    parseData(json, region, cal);
                }
            })
            .then(() => {
                return cal;
            });
    }
    return ical(data);
}

export default async (req, res) => {
    const {
        query: {
            region
        }
    } = req;

    const regionCal = await getData(region);
    res.statusCode = 200;
    res.setHeader("Content-type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="regio-${region}.ics"`);
    res.setHeader("Cache-Control", `max-age=0,s-maxage=${ttl}, stale-while-revalidate=86400`); // 1 week

    res.end(JSON.stringify(regionCal));
}