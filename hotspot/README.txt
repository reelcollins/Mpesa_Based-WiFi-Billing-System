MIKROTIK HOTSPOT INSTRUCTIONS
==========================

These files need to be uploaded to your MikroTik router to customize the hotspot login page.

Files in this package:
- login.html - The main login page
- status.html - Shows user connection status
- aloha.html - Success page after login
- mpesa_logo.png - The M-Pesa logo image file

How to Upload to MikroTik:
--------------------------

METHOD 1: Using WinBox (Recommended)
1. Open WinBox and connect to your router
2. Go to Files menu
3. Navigate to "hotspot" folder (create it if it doesn't exist)
4. Upload all files from this folder to the router's hotspot folder
5. Make sure you also have an "img" folder inside the hotspot folder for the logo
6. Upload mpesa_logo.png to the hotspot/img folder

METHOD 2: Using WebFig
1. Connect to your router's web interface (http://router_ip/webfig)
2. Go to Files section
3. Navigate to "hotspot" folder (create it if it doesn't exist)
4. Upload all files from this folder to the router's hotspot folder

METHOD 3: Using FTP
1. Enable FTP on your router (IP -> Services -> FTP -> Enable)
2. Connect to your router using an FTP client (like FileZilla)
3. Navigate to the "hotspot" folder
4. Upload all files from this folder to the router's hotspot folder

After uploading the files, you need to:
1. Go to IP -> Hotspot -> Server Profiles
2. Edit your hotspot server profile
3. On the "Login" tab, set:
   - HTML Directory: hotspot
   - Login By: cookie, http-chap
   - Make sure the other paths like "Login Page" are set to respective HTML files

Important Notes:
---------------
1. You need to change "http://your-server-ip/" in login.html to your actual server address.
2. If you're using a different logo, replace mpesa_logo.png with your own logo.
3. The MikroTik hotspot must be properly configured before these HTML pages will work.
4. To test your hotspot, connect to your WiFi network and try to browse any website.
You should be redirected to your custom login page.

For troubleshooting, check MikroTik logs under System -> Logs. 