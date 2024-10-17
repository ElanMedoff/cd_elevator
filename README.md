# cd_time_machine

### 🚨 work in progress! 🚨

A bash script track directories you've visited. move back and forth along the list, easily navigating each stop in your
history ... like a time machine.

---

```bash
$ pwd # /one
$ source path/to/cd_elevator/main.sh two
$ pwd # /one/two`
$ source path/to/cd_elevator/main.sh three
$ pwd # /one/two/three`
$ source path/to/cd_elevator/main.sh --backwards
$ pwd # /one/two
$ source path/to/cd_elevator/main.sh --forwards
$ pwd # /one/two/three
```

## FAQ

### Q: Why do you need to execute the script with `source`, why not execute it directly?

A: When executing a script with `./`, it's spawned in a sub-shell. Changing your directory in the subshell only applies
_within_ the subshell, and it won't affect the shell where you typed `./`. In order to run a script within your current
shell, the `source` keyword is necessary.

### Q: Why do you need Deno?

A: This script requires a persistant database to store the directories visited. I chose to use Deno KV, a built-in
key-value database in the Deno runtime - it's really elegant to use, try it out!

### Q: Is `cd_time_machine` fast?

A: Ish. About `0.06s` for a directory change or backwards navigation, `0.1s` for a forwards navigation. When possible, I
position Deno scripts _after_ any navigation, and I try to send scripts to the background. Speed is a WIP.

### Q: Is there a way to avoid typing the entire script path?

```bash
unalias cd
cd() {
    source path/to/cd_elevator/main.sh "$@"
}
cd_backwards() {
    source path/to/cd_elevator/main.sh --backwards
}
cd_forwards() {
    source path/to/cd_elevator/main.sh --forwards
}

zle -N cd_backwards
zle -N cd_forwards
# based on moving around the vim jumplist
bindkey '^O' cd_backwards
bindkey '^I' cd_forwards
```
