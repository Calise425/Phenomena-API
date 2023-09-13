// Require the Client constructor from the pg package
require("dotenv");
const { Client } = require("pg");
// Create a constant, CONNECTION_STRING, from either process.env.DATABASE_URL or postgres://localhost:5432/phenomena-dev

// Create the client using new Client(CONNECTION_STRING)
// Do not connect to the client in this file!
const client = new Client(process.env.DATABASE_URL);
/**
 * Report Related Methods
 */

/**
 * You should select all reports which are open.
 *
 * Additionally you should fetch all comments for these
 * reports, and add them to the report objects with a new field, comments.
 *
 * Lastly, remove the password field from every report before returning them all.
 */

async function getOpenReports() {
  try {
    // first load all of the reports which are open
    // then load the comments only for those reports, using a
    // WHERE "reportId" IN () clause
    // then, build two new properties on each report:
    // .comments for the comments which go with it
    //    it should be an array, even if there are none
    // .isExpired if the expiration date is before now
    //    you can use Date.parse(report.expirationDate) < new Date()
    // also, remove the password from all reports
    // finally, return the reports

    const { rows } = await client.query(
      `SELECT * FROM reports
      WHERE "isOpen"=$1;`,
      [true]
    );

    const reports = rows.map(async (report) => {
      const { rows: comments } = await client.query(
        `
      SELECT * FROM comments
      WHERE "reportId" IN ($1);
      `,
        [report.id]
      );

      report.comments = comments;
      delete report.password;

      if (Date.parse(report.expirationDate) < new Date()) {
        report.isExpired = true;
      } else {
        report.isExpired = false;
      }
      return report;
    });
    const openReports = await Promise.all(reports);
    return openReports;
  } catch (error) {
    throw error;
  }
}

async function createReport(reportFields) {
  // Get all of the fields from the passed in object
  const { title, location, description, password } = reportFields;

  try {
    // insert the correct fields into the reports table

    const {
      rows: [report],
    } = await client.query(
      `
    INSERT INTO reports(title, location, description, password)
    VALUES ($1, $2, $3, $4)
    RETURNING *;`,
      [title, location, description, password]
    );

    // remove the password from the returned row
    delete report.password;
    return report;
    // return the new report
  } catch (error) {
    throw error;
  }
}

async function _getReport(reportId) {
  try {
    // SELECT the report with id equal to reportId
    const {
      rows: [report],
    } = await client.query(
      `
    SELECT * FROM reports
    WHERE id =$1;
    `,
      [reportId]
    );

    // return the report
    return report;
  } catch (error) {
    throw error;
  }
}

async function closeReport(reportId, password) {
  try {
    const report = await _getReport(reportId);

    if (!report) {
      throw new Error("Report does not exist with that id");
    }

    if (report.password !== password) {
      throw new Error("Password incorrect for this report, please try again");
    }

    if (!report.isOpen) {
      throw new Error("This report has already been closed");
    }

    client.query(
      `
    UPDATE reports
    SET "isOpen" = $1
    WHERE id = $2;`,
      [false, reportId]
    );

    return { message: "Report successfully closed!" };
  } catch (error) {
    throw error;
  }
}

async function createReportComment(reportId, commentFields) {
  // read off the content from the commentFields
  const { content } = commentFields;

  try {
    // grab the report we are going to be commenting on
    const report = await _getReport(reportId);

    if (!report) {
      throw new Error("That report does not exist, no comment has been made");
    }

    if (!report.isOpen) {
      throw new Error("That report has been closed, no comment has been made");
    }

    if (Date.parse(report.expirationDate) < new Date()) {
      throw new Error(
        "The discussion time on this report has expired, no comment has been made"
      );
    }

    // if it wasn't found, throw an error saying so
    // if it is not open, throw an error saying so
    // all go: insert a comment
    const {
      rows: [comment],
    } = await client.query(
      `
    INSERT INTO comments(content)
    VALUES ($1)
    RETURNING content`,
      [content]
    );

    const currentDate = new Date();
    const expirationDate = new Date();
    expirationDate.setHours(currentDate.getHours() + 24);

    client.query(
      `
    UPDATE reports
    SET "expirationDate" = $1
    WHERE id = $2
    `,
      [expirationDate, reportId],
      (err) => {
        if (err) {
          console.error("Error updating epiration date", err);
        } else {
          console.log("Expiration date successfully updated");
        }
      }
    );

    const {
      rows: [reportExp],
    } = await client.query(
      `
      UPDATE reports
      SET "expirationDate" = CURRENT_TIMESTAMP + interval '1 day'
      WHERE id=$1
      RETURNING *;`,
      [reportId]
    );

    console.log("Report expiration has been changed to ", reportExp);
    // then update the expiration date to a day from now
    // finally, return the comment
    return comment;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  getOpenReports,
  _getReport,
  createReport,
  closeReport,
  createReportComment,
};
