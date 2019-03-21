# ass_motion

## Content

* [I’m 12 and what is this?](#im-12-and-what-is-this)
* [Why should I use this?](#why-should-i-use-this)
* [Usage](#usage)
  * [Options](#options)
* [Closer look](#closer-look)
  * [The keyframe directory](#the-keyframe-directory)
  * [Effect names](#effect-names)
  * [Tracking options](#tracking-options)
* [How does this work?](#how-does-this-work)
* [Installation](#installation)
* [Building](#building)
  * [Why is the binary 42MB big lmao](#why-is-the-binary-42mb-big-lmao)

## I’m 12 and what is this?

*ass_motion* is little tool heavily inspired by [Aegisub-Motion](https://github.com/TypesettingTools/Aegisub-Motion).

It is capable of applying sets of motion tracking data onto an .ass file via the command line.

## Why should I use this?

Your .ass can get pretty hard to read if you have multiple parts which need tracking. Working with such a bloated file can get very challenging for you *and* for your toaster.

However, ass_motion does not replace Motion. The general idea is to use Motion first to confirm it got tracked well, then `ctrl+z` and continue with the rest.
Once you’re done, you can just run ass_motion which then transforms your 84KB script into a 7.5MB monster ( ͡° ͜ʖ ͡°)

## Usage

```sh
ass_motion [options] /path/to/subtitle.ass
```

### Options

Option            | Alias | Description
------------------|-------|------------
`--outputDir`     | `-o`  | Specify the output directory
`--outputSuffix`  | `-s`  | Specify the suffix with which the output should be saved
`--keyframeDir`   | `-k`  | Specify where to search for the keyframe files
`--keyPrefix`     | `-p`  | Specify the prefix of to-be-transformed lines

## Closer look

### The keyframe directory

First off, you need to place your tracking data as .txt somewhere near your subs.

The default directory ass_motion searches for these files is `../mocha/`, but you can specify another directory with the `-k` option.

![](https://i.imgur.com/W8NWuW9.png)

For example, by using the command `ass_motion -k . /path/to/sub.ass`, ass_motion searches in the directory in which `sub.ass` resides.

* Relative path always use the given sub file as starting point.
* You can put your .txt’s in subfolders, ass_motion will find them.

### Effect names

In your .ass, define the lines you want to have tracked by adding the filename of the .txt in the effect field:

![](https://i.imgur.com/IURmGBb.png)

Each line that is not a comment and has an existing .txt counterpart will get processed.

### Tracking options

Similar to the options you can select with Motion, you can also select some with ass_motion.

This is done by appending `~XY` to the effect field, whereas `X` and `Y` are the options.

There is currently only one available:

* `R`: “reverse” application.

  This is equal to specifying `-1` as the starting point in Motion.

(There may be some other flags added in the future.)

## How does this work?

1. Compilation of the .ass into a JavaScript Object using [my fork of ass-compiler](https://github.com/Bl4Cc4t/ass-compiler)
1. Compilation of the keyframe files
1. Combining everything with magic
1. Compiling it back to an actual .ass
1. ???
1. Profit

## Installation

On macOS, you can use [HomeBrew](https://brew.sh):
```sh
brew tap Bl4Cc4t/other
brew install ass_motion
```

… or you just use a precompiled binary from [here](https://github.com/Bl4Cc4t/ass_motion/releases)

## Building

To compile it yourself, you need to have `node` installed.

```sh
git clone https://github.com/Bl4Cc4t/ass_motion
cd ass_motion
npm install
npm run build
npm run pkg-<platform>
```

… with `<platform>` being either `macos`, `win` or `linux`.
You can also compile the script for other platforms/archs: Take a look at [pkg#targets](https://github.com/zeit/pkg#targets).

The compiled binary will show up in the `bin` folder.

You can also leave out the last command which uses [pkg](https://github.com/zeit/pkg) to create the binary and use `dist/ass_motion.js` instead. If you do, just add `node` in front of every command.

### Why is the binary so big lmao

The binary contains the actual node framework. It won’t work without it. I’ve searched for ways to compress it but I found none :/
