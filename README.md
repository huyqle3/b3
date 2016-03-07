b3 [![Build Status](https://travis-ci.org/huyle333/b3.svg?branch=master)](https://travis-ci.org/huyle333/b3)
==
b3 is an Oculus Rift and Leap Motion demo that enables VR motion controlled charts and graphs within web applications. 

### Instructions
1. Web Server
2. Generating Graphs from Data
3. Dependency

### Web Server
b3.js requires a webserver. You can run b3 examples provided in the git repo:
```
cd b3/examples/
python -m SimpleHTTPServer
```

After initiating the webserver inside examples/, go to localhost:8000/index.html to see the examples.

### Generate Graphs from Data
b3.js suppports JSON and CSV data. For now, follow the structure examples/bat-with-vr.html contains.

To use b3.js, you use two main functions, initiate() and coordinates(fileName, typeOfGraph). b3.js currently has a lot of dependencies that I'm experimenting with to create the proof of concept. Look at examples/bat-with-vr.html, which contains the list of file dependencies.

#### Type of Graphs
The type of graphs supported are bar, scatter, and surface plots. Input within coordinates(fileName, "bar") or (fileName, "scatter") or (fileName, "surface").

```
initiate();
coordinates(fileName, typeOfGraph);
```

### Dependency
You'll need a VR ready browser like MozVR or Google Chromium VR enabled build. Download either web browser at the following links. Optionally, you'll also need to setup the Leap Motion controller if you want to use the Leap Motion.

+ MozVR: [http://mozvr.com/](http://mozvr.com/)
+ Google Chromium with VR: [https://drive.google.com/folderview?id=0BzudLt22BqGRbW9WTHMtOWMzNjQ](https://drive.google.com/folderview?id=0BzudLt22BqGRbW9WTHMtOWMzNjQ)
+ LeapMotion: https://www.leapmotion.com/setup 

### License
MIT
