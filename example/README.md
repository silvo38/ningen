# Example for how to use Ningen

This directory is a simple example project for how to use Ningen.

`BUILD.ts` is the Ningen build file for the example.

To generate the `build.ninja` file, run:

```bash
deno run --allow-write --unstable BUILD.ts
```

And then to "compile" the project, run:

```bash
ninja
```

`append.sh` is a simple script to copy an input file and append "xyz" to the
output.

`abc.txt` is the example input file. It gets copied to `abc.txt.out`. `BUILD.ts`
is where we say how to build the project.
