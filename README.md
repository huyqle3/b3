b3 [![Build Status](https://travis-ci.org/huyle333/b3.svg?branch=master)](https://travis-ci.org/huyle333/b3)
==
b3 was created on `October 2015` while WebVR was in Beta. It was created with the `Oculus DK2` before the CV1 was released.

b3 is an Oculus Rift DK2 and Leap Motion demo that enables VR motion controlled charts and graphs within web applications. Watch the [video demo](https://www.youtube.com/watch?v=-ZkI8hTWrHA).

![](https://thumbs.gfycat.com/GrouchyDiligentAndeancat-size_restricted.gif)

## Instructions
1. Web Server
2. Generating Graphs from Data
3. Dependency

### Web Server
b3.js requires a webserver. You can run b3 examples provided in the git repo:
```
cd b3/examples/
python -m SimpleHTTPServer
```

After initiating the webserver inside `examples/`, go to [localhost:8000/index.html](http://localhost:8000/index.html) to see the examples.

### Generate Graphs from Data
b3.js suppports JSON and CSV data. For now, follow the structure examples/bat-with-vr.html contains.

To use b3.js, you use two main functions, `initiate()` and `coordinates(fileName, typeOfGraph)`. b3.js currently has a lot of dependencies that I'm experimenting with to create the proof of concept. Look at examples/bat-with-vr.html, which contains the list of file dependencies.

#### Type of Graphs
The type of graphs supported are bar, scatter, and surface plots. Input within `coordinates(fileName, "bar")` or `(fileName, "scatter")` or `(fileName, "surface")`.

```
initiate();
coordinates(fileName, typeOfGraph);
```

### Dependencies
You'll need a VR ready browser. Double check your version with the `WebVR Browsers` link below to see if your web browser is currently VR Ready. Optionally, you'll also need to setup the Leap Motion controller if you want to use motion controls.

+ WebVR Browsers: [https://webvr.info/developers/](https://webvr.info/developers/)
+ Oculus Rift Runtime: [https://developer.oculus.com/downloads/](https://developer.oculus.com/downloads/)
+ LeapMotion Driver: [https://www.leapmotion.com/setup](https://www.leapmotion.com/setup )

### Device Support and Drivers
The latest Oculus Rift runtimes 0.7.0.0-beta and above - `March 2016` do not work with weak laptops unfortunately.

- Windows 10 requires Oculus Rift runtimes at least 0.6.0.1.
- Oculus Rift runtimes, 0.6.0.1 and below runtime versions are too old for Windows 10!

b3 was designed to work on weak laptops. My laptop had no external graphics card and used a `2012 Intel HD 3000 Graphics Card with 384MB of video memory`.

Here are the software versions that I used at the time of core development `October 2015 - March 2016`:

Back in the day, there was just one Oculus Runtime installation for all purposes. There was not a VR specific version for Leap Motion.
```
Oculus Runtime: 0.5.0.1-beta
Leap Motion (Desktop): 2.3.1
OS: Windows 8.1
```

## License
MIT
