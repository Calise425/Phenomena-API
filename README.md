# Project Phenomena

Your job, should you accept it, is to build and deploy an API for a top secret message board.

Project Phenomena is about providing a safe place for people to anonymously discuss the paranormal, to that end we intend to provide the following things:

## Endpoints

### `GET /api/reports`

This endpoint is the most open. It will return all reports currently marked as open, and their associated comments.

The request requires no body, and returns things like this:

```json
{
    "reports": [
        {
            "id": 2,
            "title": "Fairy lights in my backyard",
            "location": "Utica, NY",
            "description": "I saw floating lights in my backyard... on inspection they weren't fireflies...",
            "isOpen": true,
            "expirationDate": "2020-08-12T21:30:17.361Z",
            "comments": [
                {
                    "id": 2,
                    "reportId": 2,
                    "content": "Look, I believe in a lot of things but are fairy lights even real?"
                },
                {
                    "id": 3,
                    "reportId": 2,
                    "content": "Hey, don't question the report. Question the government! They've been lying to us all these years."
                }
            ],
            "isExpired": false
        },
        {
            "id": 3,
            "title": "Corner of metal object sticking up out of the ground in the woods...",
            "location": "Haven, Maine",
            "description": "Late last night and the night before\n Tommyknockers, Tommyknockers\n knocking at the door",
            "isOpen": true,
            "expirationDate": "2020-08-09T21:30:17.378Z",
            "comments": [],
            "isExpired": true
        }
    ]
}
```

### `POST /api/reports`

This is the route for creating a new report. The user will have to supply a JSON Body like so:

```json
{
    "title": "abc",
    "location": "xyz",
    "description": "lorem ipsum",
    "password": "lisabonet"
}
```

If the body is correctly formed, a new report will be made and returned to the user, sans password:

```json
{
    "id": 4,
    "title": "abc",
    "location": "xyz",
    "description": "lorem ipsum",
    "isOpen": true,
    "expirationDate": "2020-08-12T21:33:44.204Z"
}
```

### `DELETE /api/reports/:reportId`

This is the route for changing the `isOpen` attribute to `false`. The user must supply a JSON body including the correct password for the original post:

```json
{
  "password": "lisabonet"
}
```

If the password is correct, and the post is still open we will return a message indicating it:

```json
{
    "message": "Report successfully closed!"
}
```

### `POST /api/reports/:reportId/comments`

Lastly we can create comments on any open, non-expired report. The user has to supply a JSON body including the content of their comment:

```json
{
  "content": "I like what you've said here."
}
```

And we will return the new comment on success:

```json
{
    "id": 4,
    "reportId": 2,
    "content": "I like what you've said here."
}
```

Additionally, adding a new comment updates the expiration date on the parent `report` to 24 hours from now.

## Database Adapter

We will also create a database adapter with the following exported methods:

### `getOpenReports`

This relates to our first route, which allows us to ask the database to collect all open reports and their comments. We strip out any passwords before returning reports from the function call.

### `createReport`

This relates to our second route, which allows us to create a new report. We also strip out the password before returning the new report from the function call.

### `closeReport`

This relates to our third route, which allows us to change the `isOpen` property of our report to false. We simply return a message from the function call on success.

### `createReportComment`

Lastly, this relates to our final route. It allows us to create a comment on a report, as long as the report is **both** open **and** not expired. 

## The Server

We create a pretty basic server. It will have:

* Logging with `morgan`
* A 404 route
* An error handling route

And it will start the database connection once the server connects.

## How do I use this repo?

You should hack away at the commented sections in the following locations:

* `index.js` (top level) - this is your server file
* `api/index.js` - this is your routes file
* `db/index.js` - this is your database adapter file

The comments are your instructions, they will provide you with all that you need to know, and plenty of hints along the way.

### Database Adapter

This is testable by running `npm run db:build`, which runs the table drop, table build, and testing functions. 

You will see all sorts of errors while you build your adapter, which is useful as you correct your code.

### API

After you get your database adapter working (and functions exported), you should build out your API. You can test this using [Postman](https://www.postman.com/). You can watch a [video on postman here](https://www.youtube.com/watch?v=t5n07Ybz7yI).

