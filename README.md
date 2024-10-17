# cd_elevator

A bash script with a Deno KV database to track directories you've visited. move back and forth along the list, easily
navigating each stop in your history ... like an elevator.

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
