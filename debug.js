import api from "./api/[region].js";
console.log(api);
console.log("Debug started");
api({query: {region: "midden"}}, {
    writeHead: (statusText, options) => {console.log(statusText, options)},
    end: (data) => {console.log(data)}
});
console.log("Debug ended");