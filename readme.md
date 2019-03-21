# ass_motion

## I’m 12 and what is this?

*ass_motion* is little tool heavily inspired by (Aegisub-Motion)[https://github.com/TypesettingTools/Aegisub-Motion].

It is capable of applying sets of motion tracking data onto an .ass file via the command line.

## Why should I use this?

Your .ass can get pretty hard to read if you have multiple parts which need tracking. Working with such a bloated file can get very challenging for you *and* for your toaster.

## Usage

```sh
ass_motion [options] /path/to/subtitle.ass
```

### options

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

#### Tracking options

Similar to the options you can select with Motion, you can also select some with ass_motion.

This is done by appending `~XY` to the effect field, whereas `X` and `Y` are the options.

There is currently only one available:

* `R`: “reverse” application.

  This is equal to specifying `-1` as the starting point in Motion.

(There may be some other flags added in the future.)

## Building

To compile it yourself, you need to have `node` installed.

```sh
git clone https://github.com/Bl4Cc4t/ass_motion
cd ass_motion
npm install
npm run build
npm run pkg
```

The compiled binary will show up in the `bin` folder.

You can also leave out the last command which uses (pkg)[https://github.com/zeit/pkg] to create the binary and use `dist/ass_motion.js` instead. If you do, just add `node` in front of every command.

### Why is the binary 42MB big lmao

The binary contains the actual node framework. It won’t work without it. I’ve searched for ways to compress it but I found none :/

## How does this work?

1. Compilation of the ass into a JavaScript Object using (my fork of ass-compiler)[https://github.com/Bl4Cc4t/ass-compiler]
1. Compilation of the keyframe files
1. Combining everything with magic
1. Compiling it back to an actual .ass
1. ???
1. Profit
