//GROUP 2-15
//Conway Hogan
//Tiffany Hansen
//Elliot Pi
//Jaden Gatherum

Website for provo city to gather data on mental health and manage and view that data.

<!-- ADMIN USERNAME AND PASSWORD AND URL
wellnessprovo.is404.net
username: admin
password: BhTS2QKUYmXRTMg -->

models are in the models folder

database configuration is in seperate db.js file

all routes and controllers are in the index.js file

views are in the views folder and generally correspond more or less to the tabs on the website- those with differences that could be harder to guess on are listed below

Results is admin.ejs

Manage Users is adminedit.ejs

Explore Data is dashboard.ejs

Edit Profile is edit.ejs

When you search for a single survey on the admin page you go to the singlesurvey.ejs page

Only logged in users can create users on the register page, edit their profile, or see the the individual results of the survey. 

When it comes to finding an individual record, we chose a search by id function (we thought asking for names when it comes to something as sensitive as mental health would discourage respondants) and not a dropdown since a dropdown with upwards of 500 options would be unseamly. 

Feel free to create a new user to use to test normal user functionality or use the following
username: tiffany
password: t

Only the admin user can see the tab Manage Users where users can be deleted, and the admin user cannot delete their own account ensuring that there is always at least one account with access to the website

All members of the community can explore the data in the dashboard and take the survey

