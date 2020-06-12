# Slow-light Radiosity

An adaptation of the Radiosity algorithm and implementation from Ashdown's ["Radiosity: A Programmer's Perspective"](https://dl.acm.org/doi/book/10.5555/527751) (Ian Ashdown, 1994) in Javascript and with extensions to visualize slow propagation of light.

## Modules

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

