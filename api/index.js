const apiRouter = require("express").Router();

const {
  getOpenReports,
  createReport,
  closeReport,
  createReportComment,
} = require("../db");

apiRouter.get("/reports", async (req, res, next) => {
  try {
    const openReports = await getOpenReports();
    res.send({ reports: openReports });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

apiRouter.post("/reports", async (req, res, next) => {
  try {
    const report = await createReport(req.body);
    res.send(report);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

apiRouter.delete("/reports/:reportId", async (req, res, next) => {
  try {
    const { password } = req.body;
    const { reportId } = req.params;
    const result = await closeReport(reportId, password);
    res.send(result);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

apiRouter.post("/reports/:reportId/comments", async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const result = await createReportComment(reportId, req.body);
    res.send(result);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = apiRouter;
