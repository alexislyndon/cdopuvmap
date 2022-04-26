# CH4
## Testing
### PWA Test under functional testing?

The application is tested on a Chrome browser on an Android device for it's PWA capabilities. To trigger an install prompt from the web browser on mobile, a user must stay on the page for 30 seconds. 

| Summary | Pre-requisite | Test Cases | Expected Results | Remarks |
| --- | --- | --- | --- | --- |
| User can install the web application as a PWA | User has internet connection. User is on mobile using chrome browser. | User navigates to cdopuv.org | Server responds and redirects to the user to https://cdopuv.org and loads the application | PASS |
| | | User stays on the page for about 30 seconds while looking around, making sure to interact with the elements of the web page. | Prompt to install the app appears | PASS |
| | | Tapping on the install button should install the PWA like a native app. | App icon shows up on the app drawer or on the home screen signifying that it was installed. | PASS |
| | | Opening the PWA with a network connection should cache resources that was viewed so far. Closing the app completely by clearing it from the Overview/Recent apps and then turning off WiFi or mobile data | The app should still work with the map and the routes still loadable from cache | PASS |