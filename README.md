# cd_time_machine

A bash script to move back and forth along the directories you've visited. Easily navigate each step in your history ...
like you have a time machine.

---

```bash
$ pwd # /one

$ source path/to/cd_time_machine/main.sh --change_dir=two
$ pwd # /one/two

$ source path/to/cd_time_machine/main.sh --change_dir=three
$ pwd # /one/two/three

$ source path/to/cd_time_machine/main.sh --backwards
$ pwd # /one/two

$ source path/to/cd_time_machine/main.sh --forwards
$ pwd # /one/two/three

$ source path/to/cd_time_machine/main.sh --print
["__cd_time_machine_key","[pid]"]: {
  "currIndex": 2,
  "stack": [
    "/one",
    "/one/two",
    "/one/two/three",
  ],
  "lastAccess": 1730512193349
}
```

## Status codes:

- `1`: Generic error
- `2`: Invalid forwards action - the current dir is already the top of the stack, can't move any more forwards
- `3`: Invalid change_dir action - attempted to navigate to a directory that isn't the child of the current dir

## Requirements

- [deno](https://docs.deno.com/runtime/#install-deno)

### Suggested aliases/functions

```bash
# the --debug flag is supported for all the following commands

tm() {
    source path/to/cd_time_machine/main.sh --change_dir="$1"
}
tmb() {
    source path/to/cd_time_machine/main.sh --backwards
}
tmf() {
    source path/to/cd_time_machine/main.sh --forwards
}
tmc() {
    source path/to/cd_time_machine/main.sh --clear
}
tmp() {
    source path/to/cd_time_machine/main.sh --print
}

# or a bit more advanced

tm() {
  if [[ $# -eq 0 ]]
  then
    builtin cd ~
    ls
    return
  fi

  source ~/Desktop/cd_time_machine/main.sh --change_dir="$1"
  local status_code=$?
  [[ $status_code -eq 3 ]] && return 3
  [[ $status_code -eq 1 ]] && return 1

  ls
}
tmb() {
  source ~/Desktop/cd_time_machine/main.sh --backwards
}
tmf() {
  source ~/Desktop/cd_time_machine/main.sh --forwards
  if [[ $? -eq 2 ]]
  then
    echo
    ls
    echo -en "${red}Can't move forwards${no_color}"
    zle accept-line
  fi
}
zle -N tmb
zle -N tmf

# based on moving around the vim jumplist
bindkey '^O' tmb
bindkey '^I' tmf
```

## FAQ

### Q: Why do you need to execute the script with `source`, why not with `./`?

A: When executing a script with `./`, a new sub-shell is spawned to run the script. Changing your directory in the
subshell only applies _within_ the subshell, and it won't affect the shell where you initially executed
`cd_time_machine`. In order to run a script within your current shell - and have directory changes take affect in your
current shell - the `source` keyword is necessary.

### Q: Is `cd_time_machine` fast?

A: About `0.005s` for a directory change or backwards navigation, `0.03s` for a forwards navigation (on my local
machine, not tested very rigorously). To keep things fast, I make Deno calls _after_ any navigation and send the job to
the background to avoid blocking the main script. The exception is a forwards navigation, since that requires reading
from the database before navigating.

### Q: Why not use `pushd`, `popd`, and `dirs -v`?

A: This script is looking to do a bit more than push and pop from a history stack - I also want to navigate _along_ it.
I'm sure this is possible with a pure bash implementation, but I'm more comfortable working in typescript.
