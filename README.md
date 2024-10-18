# cd_time_machine

### work in progress

A bash script to move back and forth along the directories you've visited. easily navigate each step in your history ...
like you have a time machine.

---

```bash
$ pwd # /one
$ source path/to/cd_time_machine/main.sh --script_dir=path/to/cd_time_machine --change_dir=two
$ pwd # /one/two`
$ source path/to/cd_time_machine/main.sh --script_dir=path/to/cd_time_machine --change_dir=three
$ pwd # /one/two/three`
$ source path/to/cd_time_machine/main.sh --script_dir=path/to/cd_time_machine --backwards
$ pwd # /one/two
$ source path/to/cd_time_machine/main.sh --script_dir=path/to/cd_time_machine --forwards
$ pwd # /one/two/three
```

## FAQ

### Q: Why do you need to execute the script with `source`, why not with `./`?

A: When executing a script with `./`, it's spawned in a sub-shell. Changing your directory in the subshell only applies
_within_ the subshell, and it won't affect the shell where you initially executed `cd_time_machine`. In order to run a
script within your current shell - and have directory changes take affect in your current shell - the `source` keyword
is necessary.

### Q: Why Deno?

### Q: Is `cd_time_machine` fast?

A: very! About `0.005s` for a directory change or backwards navigation, `0.03s` for a forwards navigation. To make
things fast, I keep calls to Deno _after_ any navigation, and send the job to the background to avoid blocking the main
script. The exception is a forwards navigation, since that requires reading from the database before navigating.

### Q: Suggested aliases/functions?

```bash
tm() {
    source path/to/cd_time_machine/main.sh --script_dir=path/to/cd_time_machine --change_dir="$1"
}
tmb() {
    source path/to/cd_time_machine/main.sh --script_dir=path/to/cd_time_machine --backwards
}
tmf() {
    source path/to/cd_time_machine/main.sh --script_dir=path/to/cd_time_machine --forwards
}

# or

# based on moving around the vim jumplist
bindkey -s '^O' 'source path/to/cd_time_machine/main.sh --script_dir=path/to/cd_time_machine --backwards \n'
bindkey -s '^I' 'source path/to/cd_time_machine/main.sh --script_dir=path/to/cd_time_machine --forwards \n'
```
