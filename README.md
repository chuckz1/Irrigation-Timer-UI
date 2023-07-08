# Irrigation Pivot Timer

Website to use this (always most up to date option):
https://chuckz1.github.io/Irrigation-Timer-UI/

How to get wifi to work:
1. Download the single html file from the folder "Front End/Single File/index.html"
	- make sure the version is the same as displayed on the website link (if not, yell me me for not updating the file)
2. Find the index.html file in your device
3. Run the file with a browser

Or

(Does not work on phones)
1. Open the website url
2. Press CTRL + S to save the website to your computer (default .html file name is "Irrigation Timer.html")
3. Find the index.html file in your device
4. Run the file with a browser

- You can save this anywhere on your computer, but remember where you save it.
- The folder that is downloaded must stay with .html file (default folder name is "Irrigation Timer_files")
- The files can also be found in the Front End folder if you want to download the whole project instead

Why is this needed:
The wifi on the pivot controller only works with HTTP, not HTTPS. The online website uses HTTPS since it is secure, but when you are using wifi to connect the pivot controller, you are not connected to the internet, so HTTPS is not needed. You can't mix HTTPS and HTTP. Adding HTTPS to the pivot controller would slow down the processing and increase failure points in the code. Downloading and running the file locally is the only way to bypass this since it is now not sent via HTTPS.

Compactor used to convert multiple files into single html file if you want to convert it yourself for a phone
https://github.com/chuckz1/Single-HTML-File-Compactor
