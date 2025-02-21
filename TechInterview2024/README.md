# Environment 
Created using NodeJS 14.19.3, but should work with any nodeJS version since it's really basic

### Commands

* `npm install` - to install packages
* `npm start` - to run

### Tips

* You can access the client at <http://localhost:8080>
* If you did changes on the server and you want to test them, you'll have to restart the process. (Ctrl+C and npm start)
* If you did changes on the client and you want to test them, you'll have to refresh the page.

## Context

We want do develop a web app called Top3Reviews. This app will show to our users the list of top 3 reviews that we get from e 3rd party API. Let's consider DataSet (dataset.js) our 3rd party API. Dataset instance generates top 3 reviews for a given date (`dataset.js -> top3`).
We know that this top is changing frequently, so the dataset has a system that will return the same result withing 30 seconds intervals. This means that every 30 seconds we can get a new top from the dataset, a top for the first 30 seconds of a minute and a different top for the last 30 seconds.
Calling `top3` without passing the inputDate argument will return the current top 3 reviews (the top for the current 30s interval).

# Requirements

## Back End

("server.js")

1. Implement the `/task` route:

    * The route will return the result of Dataset->top3
    * In this request we need to accept a date in milliseconds parameter from the client, which has to be passed to the Dataset->top3 method. We can accept the parameter in the route (i.e. <http://localhost:8080/task/1672524000000> )
    * We need to validate that the date parameter is a valid timestamp and return a bad request response otherwise.

2. Let's optimize! We know that the dataset is returning the same results in intervals of 30 seconds.  
    * Use the cache class ("cache.js") in the `/task` route to cache the results and reduce hits on dataset.
    * Implement a new method in the Cache class named `invalidate`. It will be used to invalidate the cache for a specific key.
    * Add support for the `/task` route to accept a HTTP header named `No-Cache`. If the header is present, return directly from the dataset and invalidate the cache for the specified date parameter.

3. Change the router's "not found"/404 response to return a simple HTML with h1 "Not Found" instead of a JSON.

4. Implement a second route called `ratingAverage`.
    * The route will return the average of all the reviews ratings for the past hour.
    * The average returned will have a fixed precision of two decimals, rounded up.

## Front End

("/client/assets/main.js")

1. Implement the `getTop3` function (main.js) which will do a HTTP GET call to the '/task' route from server.

2. Add a button ("Refresh") which will call `getTop3` and display the result in the ui.
    * Bonus: Make the button disabled while the request is in progress.

3. Make the refresh call to happen automatically after the page was initialized, in order to have everything displayed without clicking the button.

4. We know the top 3 changes every 30 seconds. Implement the refresh functionality to retrieve new data every 30 seconds and keep the UI updated with the latest data.

5. Since the data would change every 30 seconds, on the right side of the page, we want to display a history of all the top 3 reviews retrieved from the server.
    * Bonus: the list is scrollable

6. On every review listend in history, make the background color red, yellow or green based on this scheme:
    0-1: red
    2-3: yellow
    4-5: green

7. Make the page responsive. On widths smaller than 1200px, put the history at the top and the current top 3 at the bottom.

    * Bonus: On widths smaller than 600px, hide the history component.

8. Make the history persistent between page refreshes.

### Extra Bonus

1. For the history list, show a rating average.
2. Add the posibility to sort the history list by rating.

# Notes:

* This template serves as a starting point to expedite work
* You can use any resource you want to achieve the given tasks (libraries, frameworks, etc.)
* There are no restrictions on consulting any source of information
* Contact us for any clarifications or uncertainties
* It doesn't matter if you don't finish everything, send in whatever you manage to do
* The order of solving the subjects is not important. You can solve them in any order you want.
* If you are not comfortable with JavaScript, you can implement/write the solution in any language/framework/platform you want
* Time limit : 3h to 5h
