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



move icons to fontawesome:

  loop          sync-alt (repeat would be better, but is pro)
                or have it as a setting
                  <i class="fas fa-sync-alt"></i>
                  <i class="fas fa-sort fa-rotate-90"></i>
  next-frame    step-forward
                  <i class="fas fa-step-forward"></i>
  prev-frame    step-backward
                  <i class="fas fa-step-backward"></i>
  pause         pause
                  <i class="fas fa-pause"></i>
  play-*        play, forward, backward
                  <i class="fas fa-play"></i>
                  <i class="fas fa-play fa-flip-horizontal"></i>
                  <i class="fas fa-forward"></i>
                  <i class="fas fa-backward"></i>
  stop          stop
                  <i class="fas fa-stop"></i>


slowrad will want to initialize element exitances too
instance.vertices wants to be cached
delays rAF stuff will want to be rethought
remove px from css

player bar wants to be a separate component
add clicking on the progress bar
buttons (centered):
  rewind to start
  pause and step back
  play/pause
  pause and step forward
  rewind to back

  (on the right):
  play backwards
  repeat
  // brightness (gamma, exposure)

player
  .setup(maxTime, show) --> show(time) is a callback
  // .gamma
  // .exposure
  .setBuffered


layout grid, three columns for nothing, center buttons, right buttons,
grid-template-columns: 1fr auto 1fr;
