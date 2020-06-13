

<p align="center">
  <img width ="512" src="bench-room.gif" style="border-radius: 5%"/>
</p>

<h1 align="center">Slow-light Radiosity</h1>
<p align="center">
  <i>Visualization of slow light propagation algorithm</i>
</p>


<p align="center">
  <a href="https://github.com/portsoc/Slow-light-Radiosity/releases/tag/v0.9.0"><img src="https://img.shields.io/badge/version-v0.0.9-blue.svg?style=flat"/></a>
  <img src="https://img.shields.io/badge/language-JavaScript-yellowgreen.svg?style=flat"/>
</p>

---

# Introduction

This project is an adaptation of the Radiosity algorithm and implementation from Ashdown's ["Radiosity: A Programmer's Perspective"](https://dl.acm.org/doi/book/10.5555/527751) (Ian Ashdown, 1994) in Javascript and with extensions to visualize slow propagation of light.

# Modules

* `radiosity/` contains the environment modeling classes, and the radiosity algorithms;
* `modeling/` contains classes for creating and loading various types of models;
* `frontend/` has a visualization environment and various tests
* `test/` has all unit tests
* `lib/` contains third-party libraries

Work in progress.

See the current status at [http://portsoc.github.io/Slow-light-Radiosity/frontend/](http://portsoc.github.io/Slow-light-Radiosity/frontend/)

# Getting Started

## Prerequisites

* [Node.js](https://nodejs.org/) >= 10
* [npm](https://www.npmjs.com/) >= 6

## Installation

```sh
# Clone the repository (stable branch)
git clone -b master https://github.com/portsoc/Slow-light-Radiosity.git slowrad
# OR download the latest release at: https://github.com/portsoc/Slow-light-Radiosity/releases/lastest

# Go to the project root
cd slowrad

# Install
npm install
```

## Usage

```sh
# Run unit tests
npm test
# OR npm test --coverage to have access to the tests coverage

# Check files linting
npm lint
```

# Authors

<div style="display: flex; flex-direction: column; justify-content: center">
  <a href="https://github.com/jacekkopecky">
    <img width ="60" src="https://avatars.githubusercontent.com/jacekkopecky" style="border-radius: 100%"/>
  </a>
  <div>Jacek Kopecký</div>
</div>

<div>
  <a href="https://github.com/Eccsx">
    <img width ="60" src="https://avatars.githubusercontent.com/Eccsx" style="border-radius: 100%"/>
  </a>
  <div>Thomas Mattone</div>
</div>