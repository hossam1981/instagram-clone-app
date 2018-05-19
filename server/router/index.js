const routes = [
    require('./routes/users'),
    require('./routes/pics')
];

// Add access to app and db objects to each route
module.exports = function router(app, db) {
    return routes.forEach((route) => {
        route(app, db);
    })
}