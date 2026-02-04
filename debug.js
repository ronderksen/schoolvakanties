import api from "./api/[region].js";

console.log("Debug started");
api({query: {region: "midden"}}, {
    writeHead: (statusText, options) => {console.log(statusText, options)},
    end: (data) => {console.log(data)}
}).then(() => {

    console.log("Debug ended");
});