# cd_time_machine

### work in progress

A bash script to track move back and forth along directories you've visited - easily navigating each step in your
history ... like a time machine.

---

```bash
$ pwd # /one
$ source path/to/cd_time_machine/main.sh two
$ pwd # /one/two`
$ source path/to/cd_time_machine/main.sh three
$ pwd # /one/two/three`
$ source path/to/cd_time_machine/main.sh --backwards
$ pwd # /one/two
$ source path/to/cd_time_machine/main.sh --forwards
$ pwd # /one/two/three
```

## FAQ

### Q: Why do you need to execute the script with `source`, why not with `./`?

A: When executing a script with `./`, it's spawned in a sub-shell. Changing your directory in the subshell only applies
_within_ the subshell, and it won't affect the shell where you initially typed `./`. In order to run a script within
your current shell - and have directory changes take affect in your current shell - the `source` keyword is necessary.

### Q: Why Deno?

### Q: Is `cd_time_machine` fast?

A: very! About `0.005s` for a directory change or backwards navigation, `0.03s` for a forwards navigation. To keep
things speedy, I keep calls to Deno _after_ any navigation, and send the job to the background to avoid blocking the
main script. The exception is a forwards navigation, since that requires reading from the database before navigating.

### Q: Is there a way to avoid typing the entire script path?

```bash
tm() {
    source path/to/cd_time_machine/main.sh "$@"
}
tmb() {
    source path/to/cd_time_machine/main.sh --backwards
}
tmf() {
    source path/to/cd_time_machine/main.sh --forwards
}

# or

# based on moving around the vim jumplist
bindkey -s '^O' 'source path/to/cd_time_machine/main.sh --backwards \n'
bindkey -s '^I' 'source path/to/cd_time_machine/main.sh --forwards \n'
```
