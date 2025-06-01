# Ningen: a simple Ninja build generator

Ningen is a work-in-progress build generator for
[Ninja](https://ninja-build.org).

Note: version 0.0.6 is released at https://deno.land/x/ningen@0.0.6/mod.ts and
its source code lives in the `old/` folder. The root directory of this repo is a
work-in-progress rewrite for version 0.1.0.

## Installation

1. Install Deno: https://deno.land
2. Install Ninja: https://ninja-build.org
3. There's no need to download or install Ningen yourself, Deno will do that for
   you.

## Getting started

To create your `BUILD.ts` file, run the following Bash script:

```sh
touch BUILD.ts
chmod +x BUILD.ts
cat <<EOF > BUILD.ts
#!/usr/bin/env -S deno run --allow-write
import { generate, rule } from "jsr:@silvo38/ningen@0.0.7";

// Define rules here.

generate();
EOF
```

Or if you would rather copy and paste just the file contents:

```ts
#!/usr/bin/env -S deno run --allow-write
import { generate, rule } from "jsr:@silvo38/ningen@0.0.7";

// Define rules here.

generate();
```
