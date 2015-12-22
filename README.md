# b3
A new way of graphing libraries

### Instructions
1. Download git repo
2. b3.js requires a web server
3. Generate graphs from JSON or CSV

### Download git repo

```
git clone https://github.com/huyle333/b3
```

### b3.js requires a web server

```
cd b3/examples/samples
python -m SimpleHTTPServer
```

Visit localhost:8000 to see some of the examples. Try localhost:8000/custom.html.

It automatically detects Oculus Rift if you're using a VR build of Mozilla Firefox or Google Chrome.

MozVR: http://mozvr.com/
Google Chromium with VR: https://drive.google.com/folderview?id=0BzudLt22BqGRbW9WTHMtOWMzNjQ

### Generate graphs from JSON or CSV

For now, follow the structure examples/bat-with-vr.html contains.

Two main functions direct b3.js. b3.js currently has a lot of dependencies that I'm experimenting around with.
Look at bat-with-vr.html to see what b3.js depends on.

```
initiate();
coordinates(fileName);
```




