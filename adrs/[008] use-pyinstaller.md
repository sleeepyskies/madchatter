# [007] Use PyInstaller

## Status - ACTIVE

## Context

We want MadChatter to be simple to setup and use for anybody. This also means people who are not super technically
advanced. Setting up and running python and our figuring out our build system maybe too complicated for some people. For
this reason, a simpler way to run MadChatter would be nice.

## Decided Approach

We have decidede to provide builds of MadChatter that can simply be downloaded and run. This reduces the complexity, as
it should be just a double click to run situation.

PyInstaller does this by bundling CPython, which is a mini Python interpreter written in C with all of the dependencies
the project needs. There exist other solutions that compile the python code down to C, both reducing install size and
improving speed, but these are trickier to get working (see Nuitka).
