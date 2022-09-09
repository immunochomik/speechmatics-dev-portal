/***
 * This file contains functions to play an audio file to the emulated microphone (default input) of the test container.
 *
 * In actuality, a commandline media player (in this case: ffplay) is used to play a file to the emulated speaker (default output),
 * the output is automatically "piped" to the emulated microphone (default input) using a sound server configuration on the
 * test container.
 *
 ***/
import {exec} from "node:child_process";
import {existsSync} from "node:fs";
const fileExists = (path: string): boolean => existsSync(path); // <= just a more readable alias


const errors = {
    "exec": (cmd: string) => new Error(`Failed to execute command: ${cmd}`),
    "playback": (code: number, signal: string) => new Error(`Failed to play file, exited with code: ${code} [signal: ${signal}]`),
    "fileNotFound": (path: string) => new Error(`File does not exist: ${path}`)
}


// Starts to play a file to the microphone in a (background) child process,
// the process will exit automatically when playback is complete (or on error).
function startPlayFile(path: string, verbose: boolean, prefix: string | undefined): void {
    const verboseArg = verbose ?
        ``: // use default verbosity for now
        `-loglevel quiet`;
    const cmd = `ffplay -nodisp -vn -autoexit ${verboseArg} ${path}`;
    if (!fileExists(path)) {
        throw errors.fileNotFound(path);
    }
    const childProc = exec(cmd, (err: any, stdout: string, stderr: string)=>{
        if (err) {
            throw errors.exec(cmd);
        }
        if (stdout && verbose) {
            console.log(stdout);
        }
        if (stderr) {
            console.error(stderr);
        }
    });
    childProc.on("spawn", ()=>{
        if (verbose) {
            console.log(prefix + "Playback started...");
        }
    });
    childProc.on("exit", (code: number, signal: NodeJS.Signals)=>{
        if (!code && verbose) {
            console.log(prefix + "Playback stopped.");
        } else if (code) {
            console.error(prefix + "Playback error.");
        }
    });
}


// Plays a file to the microphone in a (background) child process,
// the promise will resolve when playback is complete (or reject on error).
async function playFile(path: string, verbose: boolean, prefix: string | undefined): Promise<void> {
    const verboseArg = verbose ?
        ``: // use default verbosity for now
        `-loglevel quiet`;
    const cmd = `ffplay -nodisp -vn -autoexit ${verboseArg} ${path}`;
    prefix = prefix ? `${prefix}: ` : "";
    return new Promise((resolve, reject) => {
        if (!fileExists(path)) {
            reject(errors.fileNotFound(path));
        }
        const childProc = exec(cmd,
            (err: any, stdout: string, stderr: string) => {
                if (err) {
                    throw errors.exec(cmd);
                }
                if (stdout && verbose) {
                    console.log(stdout);
                }
                if (stderr) {
                    console.error(stderr);
                }
            }
        );
        childProc.on("spawn", ()=>{
            if (verbose) {
                console.log(prefix + "Playback started...");
            }
        });
        childProc.on("exit", (code: number, signal: NodeJS.Signals)=>{
            if (!code) {
                if (verbose) {
                    console.log(prefix + "Playback stopped.");
                }
                resolve();
            } else {
                reject(errors.playback(code, signal));
            }
        });
    })
}


// Plays a sample file to the microphone in a (background) child process,
// the promise will resolve when playback is complete (or reject on error).
async function playSample(prefix: string, verbose: boolean, sampleFile: string) {
    return await playFile(__dirname + `/../samples/${sampleFile}`, verbose, prefix);
}


export default {
    playSample
}