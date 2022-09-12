# End-to-End (E2E) Tests

The end-to-end tests in this folder are based off the [Playwright framework](https://playwright.dev/docs/intro) imported into the [npm](https://docs.npmjs.com/cli/v8/commands/npm) package as a [development dependency](https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file) (see `package.json`).

> Playwright Test was created specifically to accommodate the needs of end-to-end testing. Playwright supports all modern rendering engines including Chromium, WebKit, and Firefox. Test on Windows, Linux, and macOS, locally or on CI, headless or headed with native mobile emulation of Google Chrome for Android and Mobile Safari.

## How it works

The end-to-end tests run in a Docker container, so **make sure Docker Engine is installed!**

The main purpose of the container is to emulate a microphone (`virtual_mic`) for the browser to use when
a web application requests access to it. In order for this to occur smoothly, `virtual_mic` is set as the default 
system microphone.

Of course, a virtual microphone interface is useless for the purpose of testing if we can not emulate an audio input with it.
We want to be able to 'play' a file to `virtual_mic` on demand, for example, using a media player with a command-line 
interface such as [`ffplay`](https://www.ffmpeg.org/ffplay.html) or [`vlc`](https://wiki.videolan.org/VLC_command-line_help/), 
or via a media playback API. This is achieved by creating a default audio output, an emulated speaker (`virtual_speaker`) 
whose output is 'piped' to the input of `virtual_mic`.

```
                                                                                                                                                              
                                 "Virtual pair"                                                                                                               
  Media player                  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─          Browser                
 ╭──────────────────────╮                                                                                                    │        ╭──────────────────────╮
 │ ◎ ○ ○ ░░░░░░░░░░░░░░░│       │                                                                                                     │ ◎ ○ ○ ░░░░░░░░░░░░░░░│
 ├──────────────────────┤                 ┌───────────────────────┐                         ┌─────────────────────┐          │        ├──────────────────────┤
 │                      │       │         │                       │                         │                     │                   │                      │
 │                      │            sink │                       │ source             sink │                     │ source   │        │                      │
 │                      │──────▶├────────▶│    virtual_speaker    │────────────────────────▶│     virtual_mic     │─────────▶ ───────▶│                      │
 │                      │                 │                       │                         │                     │          │        │                      │
 │                      │       │         │                       │                         │                     │                   │                      │
 │                      │                 └───────────────────────┘                         └─────────────────────┘          │        │                      │
 └──────────────────────┘       │                                                                                                     └──────────────────────┘
                                                                                                                             │                                
                                └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─                                 
```

The setup described above is all made possible thanks to an open-source sound server implementation called 
[PulseAudio](https://www.freedesktop.org/wiki/Software/PulseAudio/). PulseAudio is an ecosystem that consists 
of a [daemon](https://www.freedesktop.org/wiki/Software/PulseAudio/Documentation/User/Daemon/) (background application), 
on-demand loadable and configurable [modules](https://www.freedesktop.org/wiki/Software/PulseAudio/Documentation/User/Modules/), 
and [command-line utilities](https://www.freedesktop.org/wiki/Software/PulseAudio/Documentation/User/CLI/) to configure 
and probe the sound server (`pactl` and `pa-info`). 

As far as this end-to-end test setup is concerned, all PulseAudio-related work is done on container boot through execution
of the `./e2e/docker/_initContainer.sh` script.




### Nuances

#### Browser

* Currently, only Chromium is being used to test the system.

* Inside the container, the browser must run in headed mode (i.e. with UI) in order to work smoothly — in particular,
to automatically accept permission requests (for microphone access). This is achieved through 
[XVFB](https://www.x.org/archive/X11R7.6/doc/man/man1/Xvfb.1.xhtml), which effectively emulates a display output 
that connects to an already-installed [X Window System client](https://www.cs.mcgill.ca/~rwest/wikispeedia/wpcd/wp/x/X_Window_System_protocols_and_architecture.htm)
on the same container.

* The browser runs with security features disabled (`--disable-web-security`). The primary reason for this 
  is to disable (annoying) CORS enforcement while testing.

#### Virtual pair 

* `virtual_speaker` being the default audio output interface will 'sink' any audio played by any executable code
  that gets a chance to run on the system. If multiple applications are playing back media files, the audio will
  be mixed and reflected in the same way by `virtual_mic` output — which will naturally affect the outcome of 
  trancription tests.

* Since there is only one `virtual_speaker`<->`virtual_mic` pair, it is not possible to run transcription tests
  concurrently.

---

## How to use
By default, Playwright will run *all* end-to-end tests it finds implemented in files ending with `.test.ts` in the `./e2e` folder.
To run only a subset of tests implemented in a particular file, specify `<optional: test file>` where indicated in the commands below. 

`<optional: test file>` can be the name of any test file in the `./e2e` folder but **without** the `.test.ts` suffix.

For example, our navigation tests are implemented in `navigation.test.ts`. If we only wanted to run navigation tests, 
we would specify `navigation` in place of the `<optional: test file>` symbol.

> **Note:** By default, Playwright uses one concurrent thread of execution per test file 
> until an implicit maximum number of worker threads is reached. See: https://playwright.dev/docs/test-parallel

### METHOD 1: Run test(s) in Docker container (recommended)

> This method is highly recommended because transcription tests require an emulated microphone, this is achieved by virtual hardware interfaces that are instantiated automatically when the container starts.

1. In your shell terminal, make sure the project root folder (i.e. the folder with `package.json`) is set as the current working directory.
2. Run the test(s): `npm run e2e <optional: test file>`

### METHOD 2: Run test(s) locally

> **NOTE:** Transcription tests will fail because of device interface dependencies. All other tests should pass.

If you have to run test(s) locally for whatever reason:

1. In your shell terminal, make sure the project root folder (i.e. the folder with `package.json`) is set as the current working directory.
2. Remove any existing output data to prevent confusion: `rm -rf e2e/test-output`.
3. Run the test(s): `npx playwright test <optional: test file>`

---

## Test outputs

Apart from the Playwright config file, all files related to end-to-end testing sit in the `./e2e` folder.  

When you run a set (or subset) of tests using either one of the methods above, an output folder called `test-output` will be created in the `./e2e` folder.

The structure of `test-output` folder is as follows:

* `test-output`<br>
  *A parent folder for all outputs produced during test execution.*
  * `report`<br>
    *This folder contains the test report as an index.html file — open this file with any browser.*
  * `screenshots`<br>
    *This folder contains all screenshots taken during text execution. At the moment, screenshots are 
    taken before and after every transcription test.*
  * `storageState.json`<br>
    *A file that captures the storage state of (the last instance of) the test browser. See `global-setup.ts`.*  

---

####

## Things to do

[ ] Only probe the Runtime Provisioner for Transcribers actually being used by the transcription. At the moment test crudely
    checks availability of all Transcribers (for the tested language) to assert whether transcription is really occurring in the backend.

[ ] Multiple pairs of `virtual_speaker`<->`virtual_mic` interfaces could be used to run transcription tests in parallel (if not, at least concurrently).
    Some kind of resource management/pooling mechanism will be required to set default speaker and mic to next available pair when current set is locked by
    a transcription test.


