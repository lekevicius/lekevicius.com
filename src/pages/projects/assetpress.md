---
title: AssetPress
description: iOS and Android asset production pipeline
pageDescription: High quality asset resizer and workflow tools for iOS and Android design.
group: open-source
order: 1
---

<p class="lead">At the core, AssetPress is an asset resizer taking high resolution exports from design files and scaling them down to smaller resolutions. It produces sharp results, supports all iOS and Android resolutions and even 9-patch images.</p>

As a workflow tool AssetPress can do much more than just resize images: it can take a design file, automatically export all the resources, filter out screen previews, resize everyting into appropriate resolutions, create Xcode-compatible Xcassets folder and even put updated resources into git and make git commit. All with a single command or a simple drag and drop. I call AssetPress the Ultimate Design Workflow.

<a href="https://github.com/lekevicius/assetpress" class="github">
  <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path fill='currentColor' fill-rule='evenodd' d='M12 1C5.925 1 1 5.925 1 12c0 4.86 3.152 8.983 7.523 10.437.55.101.75-.239.75-.529 0-.262-.01-1.129-.015-2.047-3.059.664-3.705-1.298-3.705-1.298-.501-1.27-1.222-1.608-1.222-1.608-1-.682.076-.669.076-.669 1.105.077 1.686 1.133 1.686 1.133.982 1.682 2.576 1.196 3.201.914.1-.71.385-1.196.699-1.47-2.442-.277-5.011-1.221-5.011-5.436 0-1.202.429-2.182 1.131-2.952-.112-.28-.49-1.399.109-2.913 0 0 .923-.295 3.025 1.128A10.471 10.471 0 0 1 12 6.32c.935.004 1.876.126 2.754.371 2.099-1.424 3.023-1.128 3.023-1.128.601 1.516.223 2.634.11 2.912.705.77 1.13 1.75 1.13 2.952 0 4.225-2.572 5.156-5.023 5.428.396.342.747 1.01.747 2.036 0 1.47-.015 2.656-.015 3.019 0 .292.2.635.757.527C19.851 20.98 23 16.858 23 12c0-6.075-4.925-11-11-11z'/></svg>
  Star AssetPress on GitHub
</a>

---

<p class="lead">This page is a complete guide with downloadable examples and documentation of AssetPress features. If you do any mobile design or work with a mobile designer, read through this guide, and then start using AssetPress - it will save you a lot of time!</p>

## Table of Contents

* [Introduction](#introduction)
* [Installation](#installation)
* [Usage, Options and Flags](#usage-options-and-flags)
  * [Common Options](#common-options)
  * [Workflow Options](#workflow-options)
  * [iOS Options](#ios-options)
  * [Android Options](#android-options)
* [AssetPress Tools](#assetpress-tools)
  * [Resizer](#assetpress-resizer)
  * [Splitter](#assetpress-splitter)
  * [Workflow](#assetpress-workflow)
* [Recommended Design Workflow](#recommended-design-workflow)
* [Development](#development)
* [Changelog](https://github.com/lekevicius/assetpress/releases)

## Introduction

AssetPress sits in the gap between designer drawing the design, and developer getting resources all nicely sliced and resized in every needed resolution.

This gap has to be filled with quite a few tasks: starting with exporting the assets from design software (are you still manually creating Photoshop slice sheets?), resizing them to each needed resolution (no @1x for iPhone, but no @3x for iPad...), and then sending that to a developer to put into development project.

The goal of AssetPress is to automate all of that and make both designers and developers happier. Start with a resizer and forget exporting multiple resolution. If you design in Sketch you can even skip manually exporting resources. Make product managers and developers happier by producing always-up-to-date screen previews. Finally, amaze your developer friends by suggesting to automatically commit updated Android res folder or iOS xcassets folders directly to git.

## Installation

AssetPress runs on Mac from comand line, and needs to be installed from there. It's not very difficult, but if you haven't ever used it, I suggest doing these steps with your developer friend. To open command line interface, open Terminal.app from Applications/Utilities.

AssetPress has only one dependency that needs to be installed seperately: [ImageMagick](http://www.imagemagick.org). You can install it via [Homebrew](http://brew.sh):

```sh
brew install imageimagick
```

AssetPress itself is a node app, so if you don't have node installed, you also need to run

```sh
brew install node
```

Once you have node installed, you can finally run

```sh
npm install -g assetpress
```

If you or your designer is using [Sketch](http://bohemiancoding.com/sketch/), AssetPress will happily automate the "Export Resources" step. For that you need to download [sketchtool](http://bohemiancoding.com/sketch/tool/) command line utility. Note that Sketch is not required to run sketchtool, so your developers don't need Sketch license (although you should totally buy it anyway, see [Recommended Design Workflow](#recommended-design-workflow) section).

## Usage, Options and Flags

Basic usage is

```sh
assetpress input [options]
```

`input` can be either

* Directory with exported assets. Path can be specified relatively or absolutely. iOS resources inside can be any size with proper @[scale]x naming, Android resources _must_ be 4x (xxxhdpi) size without any suffix. For more details about preparing resources for AssetPress read [AssetPress Resizer](#assetpress-resizer) section.
* Sketch file with properly set up exports (same rules as for directory). If you pass a Sketch file, AssetPress will call sketchtool and export all slices.
* or a .assetpress.json workflow file. This is the magical configuration file that can streamline entire workflow. It is covered in detail in [AssetPress Workflow](#assetpress-workflow) section.

Additionally you can set many options via flags:

### Common Options

<div class="full-width">
<table style="min-width:800px"><thead><tr><th width="10%">Short</th><th width="15%">Long flag</th><th width="15%">Option key</th><th>Description</th></tr></thead><tbody><tr><td>-i</td><td>--ios</td><td>os: 'ios'</td><td>iOS mode. It is default, so this flag is not necessary, but still recommended for clarity. No value.</td></tr><tr><td>-a</td><td>--android</td><td>os: 'android'</td><td>Android mode. No value.</td></tr><tr><td></td><td>--input</td><td>inputDirectory</td><td>Normally input is passed as a free argument, but you can also set it via input flag. Value is path, can be relative or absolute. Example: <code>assetpress --input=~/Projects/App/</code> is the same as simply <code>assetpress ~/Projects/App/</code>.</td></tr><tr><td>-o</td><td>--output</td><td>outputDirectory</td><td>Output directory. By default output directory is created next to input directory. Default name depends on OS mode: in iOS it's either <code>Images</code> or <code>Images.xcassets</code>, in Android it's <code>res</code>. Value is path, can be relative or absolute. Example: <code>assetpress --output=OnboardingImages</code>.</td></tr><tr><td>-s</td><td>--screens</td><td>screensDirectory</td><td>Screens directory. If set, AssetPress would run Splitter before running Resizer. This allows moving screen previews to another location before resizing assets. For more details about what Splitter does and how, read <a href="#assetpress-splitter">Splitter</a> section. Value is path, can be relative or absolute. Example: <code>assetpress --screens=~/Dropbox/App/Screen Previews</code>.</td></tr><tr><td></td><td>--no-resize</td><td>noResize</td><td>If this flag is present, AssetPress Resizer will not run. Relevant if you want to only split screens and resources, and do nothing else.</td></tr><tr><td>-c</td><td>--clean</td><td>clean</td><td>If this flag is present, output directory will be deleted (if it exists) before producing new resources. Generally recommended.</td></tr><tr><td>-v</td><td>--verbose</td><td>verbose</td><td>If this flag is present, AssetPress will output a lot of debugging information about everything it is doing.</td></tr></tbody></table>
</div>

### Workflow Options

If you pass .assetpress.json workflow file as input, most flags are ignored, and instead their values are read from the JSON file itself. There are two exceptions: currently all workflows work with `--clean` flag, deleting previously existing directory, and you can add `--verbose` flag if you want to see workflow debugging information.

Workflows also have their two flags of their own:

<div class="full-width">
<table style="min-width:800px"><thead><tr><th width="10%">Short</th><th width="15%">Long flag</th><th width="15%">Option key</th><th>Description</th></tr></thead><tbody><tr><td>-m</td><td>--message</td><td>gitMessage</td><td>Git commit message, when you use git feature of Workflow.</td></tr><tr><td></td><td>--workflow</td><td>workflowObject</td><td>JSON string to be used instead of loading JSON from given input path.</td></tr></tbody></table>
</div>

### iOS Options

<div class="full-width">
<table style="min-width:800px"><thead><tr><th width="10%">Short</th><th width="15%">Long flag</th><th width="15%">Option key</th><th>Description</th></tr></thead><tbody><tr><td>-x</td><td>--xcassets</td><td>iosXcassets</td><td>If this flag is present, instead of generating a plain directory as output, AssetPress will generate Xcode-compatible Xcassets folder. Xcassets is a modern way to store all AppIcons, LaunchImages and resources in every needed resolution. To generate proper AppIcon and LaunchImage JSONs and make sure Xcode will accept generated folder, use the template provided in the Templates and Examples section.</td></tr><tr><td></td><td>--min</td><td>iosMinimum</td><td>Smallest generated size for universal assets (without either ~iphone or ~ipad suffix). Value is a number, default is 1.</td></tr><tr><td></td><td>--max</td><td>iosMaximum</td><td>Largest generated size for universal assets. Value is a number, default is 3.</td></tr><tr><td></td><td>--min-phone</td><td>iosMinimumPhone</td><td>Smallest generated size for iPhone assets (with ~iphone suffix). Value is a number, default is 2.</td></tr><tr><td></td><td>--max-phone</td><td>iosMaximumPhone</td><td>Largest generated size for iPhone assets. Value is a number, default is 3.</td></tr><tr><td></td><td>--min-pad</td><td>iosMinimumPad</td><td>Smallest generated size for iPad assets (with ~ipad suffix). Value is a number, default is 1.</td></tr><tr><td></td><td>--max-pad</td><td>iosMaximumPad</td><td>Largest generated size for iPad assets. Value is a number, default is 2.</td></tr></tbody></table>
</div>

### Android options

Android mode doesn't have many options, both are related to generating uncommon resolutions. By default MDPI (1x), HDPI (1.5x), XHDPI (2x) and XXHDPI (3x) sizes are generated. There are very few LDPI phones still used and no XXXHDPI phones available, so these flags should not be common. 

<div class="full-width">
<table style="min-width:800px"><thead><tr><th width="10%">Short</th><th width="15%">Long flag</th><th width="15%">Option key</th><th>Description</th></tr></thead><tbody><tr><td></td><td>--ldpi</td><td>androidLdpi</td><td>Generate LDPI (0.75x) resources</td></tr><tr><td></td><td>--xxxhdpi</td><td>androidXxxhdpi</td><td>Generate XXXHDPI (4x) resources</td></tr></tbody></table>
</div>

Also please note that all Android resources intially have to be XXXHDPI (4x). For more information on that see [Resizer](#assetpress-resizer) section.

## AssetPress Tools

AssetPress in not only an asset resizer, although that is the core of this tool. There are three tightly connected tools:

* Resizer – resizing assets from higher 4x resolution to lower resolutions
* Splitter – moving screens (assets named in a special format) to another location
* Workflow – configuration reader that can perform entire chain of action, merging sketchtool, Resizer, Splitter and git.

### AssetPress Resizer

Resizer is the core of AssetPress. Its goal is simple: take initial, higher resolution images, and scale them down to all necessary smaller versions. My very strong recommendation is to have 4x (@4x in iOS or XXXHDPI in Android) as a starting resolution.

Exporting in @4x is _optional_ for iOS - AssetPress can take 3x images and scale them down to 2x and 1x. However, scaling from 3x to 2x involves 0.66 scaling factor, and that prohibits high quality results. Because of that I recommend exporting "@4x" starting images, for example `asset@4x.png`. It is also possible to generate all final resources (1x, @2x, @3x) directly – either from Sketch or Photoshop – and just use AssetPress as Xcassets folder generator. AssetPress will not touch any prerendered assets. In iOS you can use subfolders in input folder to organize images.

For Android this is actually not a recommendation, but a **requirement**. Android does not have scale-indicating naming convention, like iOS has with "@4x". Instead, you should export all images in XXXHDPI and name them without any suffix, for example, `asset.png`. AssetPress will complain about any asset that has a size not a multiple of 4. Also Android does not support subfolders in resources – your input directory must be flat, without any folders inside.

One important exception for Android is 9-patch images. They should contain a suffix indicating the thickness of a patch in exported asset. For example, if you design in 1x resolution, and draw patches 1px thick, after exporting in 4x these patches will be 4px thick. You need to indicate that in the name: "button.9@4x.png" If you simply called your asset "button.9.png" AssetPress would assume 1px thick patches in 4x resource and would still work. Finally, if you forgot the suffix entirely, there will be no indication whatsoever that a resource is a 9-patch image.

In Sketch, exporting 4x is very simple. Just create a new slice or turn a layer into exportable layer, and set scaling to "4x". On iOS also set the suffix to "@4x". On Android keep the suffix empty.

In Photohop you can use [Generator](http://blogs.adobe.com/photoshopdotcom/2013/09/introducing-adobe-generator-for-photoshop-cc.html) naming and enable Generator support for that file. For iOS call the layer "400% icon@4x.png". For Android, call it "400% icon.png".

For more details about exporting in 4x read [Recommended Design Workflow](#flow) section.

---

After resizing in Android mode you should get a folder called "res" next to your input folder. Inside res there will be multiple other folders: "drawables-mdpi" and similar. Inside them you will all the resources. Android OS will load appropriate resources automatically.

After resizing in iOS mode (without Xcassets flag), you should get a folder called "Images" next to your source directory. It should look very similarly, just with more resolutions.

The most complicated result comes after resizing in iOS mode with Xcassets flag. The resulting folder – by default called Images.xcassets – will be a proper Xcassets folder, ready to be moved to Xcode. Inside this folder you can find three types of subfolders:

* name.imageset is the most common type of subfolder, and represents the same image in different sizes. Pretty simple.
* AppIcon.appiconset if for your app icon. AssetPress will correctly categorize your icon assets if they follow Apple's naming conventions. You can find an [entire list of icons and their sizes here](https://github.com/lekevicius/assetpress/blob/master/src/modules/ios-xcassets.coffee#L10), or just use the template provided below. Also worth noting is that AssetPress supports multiple app icons via suffix, for example, AppIconTestfligh.appiconset
* LaunchImage.launchimage is for your "loading" images. Again, the easiest way to correctly populate this folder is to use the provided template. You can find the [entire list with correct dimensions here](https://github.com/lekevicius/assetpress/blob/master/src/modules/ios-xcassets.coffee#L104).

### AssetPress Splitter

Splitter is the simplest of all tools, but can helps in building the complete workflow. If you are working in Sketch, you probably have one Sketch file for your project, with multiple Artboards, each for a different screen. My recommendation is to name these screens hierarchically, with numbers. You could start with `0.1 Login`, have `1.0 Calendar`, `1.1 Event details`, `2.0.1.3 New Event - Select Weekly Repeat` and so on.

If you choose to go this route, Splitter is for you. First of all, feel free to mark Artboards as exportable (in a scale that's reasonable, not necessarily 4x - I use 2x), and then run AssetPress with `--screens=~/Destination/of/Screens` flag. All files named in this "number.number name" style will be moved to a chosen location.

### AssetPress Workflow

AssetPress Workflow allows you to save configuration of different actions – exporting, moving screens, resizing, moving final results, doing a git commit – and then just call `assetpress your_configuration.assetpress.json`. It streamlines and simplifies the gap between design and development.

Your workflow file (something.assetpress.json) can be very simple:

```json
{
  "source": "Exports",
  "assetpress": {
    "os": "ios"
  }
}
```

This workflow file takes all images from Exports and runs through AssetPress with default iOS settings. After running this workflow you would see "Images" folder next to "Exports".

```json
{
  "source": "Design.sketch",
  "screens": "~/Dropbox/Project/Screen Previews",
  "assetpress": {
    "os": "ios",
    "iosMinimum": 2,
    "xcassets": true
  },
  "output": {
    "destination": "/Users/j/my-app/my-app/Images.xcassets",
    "git": true,
    "gitRoot": "/Users/j/my-app/",
    "gitBranch": "resources",
    "gitPrefix": "Resource update",
    "gitRemote": "github"
  }
}
```

This is a very complete workflow file using all the available steps. Input is set to a Sketch file, that will be exporting with sketchtool in the beginning of the workflow. Then Splitter will run, moving all screen previews to Dropbox folder. After that remaining resources will be resized and turned into Xcassets folder. Finally, this Xcassets folder will be moved to a git directory and a new git commit will be pushed to github, resource branch. If you run this workflow from command line, you can also set the commit message:

```sh
assetpress design.assetpress.json -m 'Added client icons'
```

Other notable use cases of AssetPress include using just Splitter:

```json
{
  "source": "Exports",
  "screens": "Screen Previews"
}
```

Or just as a Sketch exporter:

```json
[
  {
    "source": "App Android.sketch"
  },
  {
    "source": "App Android.sketch"
  }
]
```

Previous example also shows that a workflow file can contain a single workflow object or an array of them.

If you have trouble understanding what a workflow is doing, you can always run workflow in verbose (debug) mode:

```sh
assetpress design.assetpress.json --verbose
```

Once set up, Workflow will keep saving many minutes every time you would be exporting and sending resources to a developer. Because Sketch is not required, Workflow can even be set up on a developers computer, and added as a build step. Possibilities!

## Recommended Design Workflow

Although AssetPress is very flexible, I recommend a very specific workflow that allows simple and fast design process, happiest developers and highest quality result. Not every step is required. Let's get into some details, why I believe this is exceptionally great workflow for mobile design.

* ##### Work in Sketch

  This might be the boldest suggestion in the list, and most optional. Sketch is wonderful application that can do much more than Photoshop and let's you work efficiently. It is also very simple, and I've personally seen designers move from Photoshop to Sketch in about a week.
  
  From AssetPress perspective, Sketch allows automation and features that are simply not possible with Photoshop. With Sketch your entire exporting flow can be one button, with Photoshop, even with Generator, it has to be at least 2-3 clicks. Not a big deal, but Sketch is nicer.
* ##### Design in 1x resolution

  I am [not the only one](http://bjango.com/articles/appdesignworkflow/) to argue that this is the right way: ignore Retina, design in points. There are many benefits to this. Designers can more easily refer to UI guidelines that usually describe dimensions in  points for iOS and dp's for Android. 
  
  More importantly, developers can open original designs and check the dimesions and sizes without having to convert from 2x or 3x sizes. This is yet another reason to work in Sketch - it is cheap enough for every developer on the team to buy it, and you avoid a lot of confusion and save tons of time by not creating [design specifications](http://www.wuwacorp.com/specking/).

  If you work in Sketch there are no downsides whatsoever, because everything is vector anyway, you can zoom in as much as you like and specify everything in fractional sizes. When working in Photoshop use amazing [Bjango Actions](http://bjango.com/articles/actions/) to move between 1x and adding finer details in bigger resolutions.
* ##### Export resources in 4x

  Exporting in 4x allows for perfect scaling to 2x and 1x and close-to-perfect to 3x. Although it would be possible to export 3x seperately for perfect result, in practice it is impossible to notice scaling imperfections on these super high resolution screens. 1.5x scaling (Android's hdpi) is not perfect, and simply cannot be, unless drawn by hand specificaly for this size.

  AssetPress does not require iOS resources to be in @4x, but Android resources must be.
* ##### Export, name and let Splitter move screen previews

  Artboards (screens) don't need to be in 4x (but you can do it, nothing wrong with it), but it's really helpful to export them together with resources. It's main use is for developers (to quickly find a screen preview without diving into Sketch) and project managers (to refer to them when writing stories / specifications).

  Splitter works by detecting hierarchically-named files. Refer to [Splitter](#assetpress-splitter) section for examples. Having a numeric structure to call screens really simplifies communication in bigger projects, and doesn't hurt in smaller.

  Finally, my recommendation is to tell Splitter to move previews to a shared folder in Dropbox or Google Drive. Because screen previews are a communication tool (and not a development resource), it should be widely available.
* ##### Pass these 4x sources through AssetPress

  Easy enough! Let AssetPress do what it was designed to - grab your nice 4x exports and make smaller version. Make sure to follow tips described in [Resizer](#assetpress-resizer) section for correct results.
* ##### Commit final resources to git

  A very optional step, but depending on a project it can be very nice. Some developers wouldn't want a designer to touch their git, but really, not much can go wrong. I suggest to use either a submodule or a separate branch from resources, and if you want to be really careful, you can always set up AssetPress to work on developer's computer, not designer's. AssetPress Workflow is very flexible in how it makes git commits, you can customize branch, remote, message format.

  This is it! Experiment by adopting a couple of these recommendations, and see if they improve your work, or jump straight in and go for Complete AssetPress Workflow Zen. We've refined this workflow with projects having hundreds of screens and thousands of resources, and it worked perfectly.

## Development

AssetPress is open source and licensed under MIT. You can find [all the code and contribute or submit issues at Github](https://github.com/lekevicius/assetpress/). If you like this project or use it, star it and share this with fellow designers.

AssetPress is developed by Jonas Lekevicius. It began as an internal tool for [Lemon Labs](http://lemonlabs.co).

Everything is written in CoffeeScript and runs on Node. I welcome all contributions to AssetPress. The code is synchronous and has no tests - that needs to improve. Also there are many possible features it could have. You could build them!

Finally, if you would like to build on top of AssetPress, refer to Option key in option tables above. It allows you to run AssetPress by using it as a library. Example below shows all options with their default values:

```js
var assetpress = require('assetpress');
assetpress({
  inputDirectory: 'source',
  outputDirectory: false,
  screensDirectory: false,
  noResize: false,
  verbose: false,
  clean: false,
  os: 'ios',
  androidLdpi: false,
  androidXxxhdpi: false,
  iosMinimum: 1,
  iosMaximum: 3,
  iosMinimumPhone: 2,
  iosMaximumPhone: 3,
  iosMinimumPad: 1,
  iosMaximumPad: 2,
  iosXcassets: false,
  workflowObject: false,
  gitMessage: false,
  complete: function () {}
});
```