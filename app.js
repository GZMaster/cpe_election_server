const express = require("express");
const morgan = require("morgan");
// eslint-disable-next-line import/no-extraneous-dependencies
const cors = require("cors");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const accreditationRouter = require("./routes/accreditationRoutes");
const votingRouter = require("./routes/votingRoutes");
const adminRouter = require("./routes/adminRoute");

const app = express();

// 1) GLOBAL MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/accreditation", cors(), accreditationRouter);
app.use("/api/v1/voting", votingRouter);
app.use("/api/v1/admin", cors(), adminRouter);

app.all("*", (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = "fail";
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
