total_start=`date +%s.%N`

deno_working_dir="$HOME/Desktop/cd_stack"
debug_flag="$2"

# eg: get_runtime start end label
# $1: start
# $2: end
get_runtime() {
  echo "$3 runtime: $( echo "$2 - $1" | bc -l )"
}

# eg: init_kv --debug
# $1: --debug
init_kv() {
  init_kv_start=`date +%s.%N`
  if [[ "$1" == "--debug" ]]
  then
    deno task --cwd="$deno_working_dir" init_kv
  else
    # https://stackoverflow.com/a/51061398
    (&>/dev/null deno task --cwd="$deno_working_dir" init_kv &)
  fi
  init_kv_code="$?"
  if [[ "$init_kv_code" != 0 ]]
  then
    echo 'ERROR: error running `deno task init_kv`, exiting early'
    return
  fi
  init_kv_end=`date +%s.%N`
  # get_runtime "$init_kv_start" "$init_kv_end" "init_kv"
}

# eg: init_stack path/to/dir --debug
# $1: pwd before navigating
# $2: --debug
init_stack() {
  if [[ "$2" == "--debug" ]]
  then
    deno task --cwd="$deno_working_dir" init_stack --before_nav_pwd="$1"
  else 
    (&>/dev/null deno task --cwd="$deno_working_dir" init_stack --before_nav_pwd="$1" &)
  fi
  init_stack_code="$?"
  if [[ "$init_stack_code" != 0 ]]
  then
    echo 'ERROR: error running `deno task init_stack`, exiting early'
    return
  fi
}

case "$1" in 
  --forwards)
    init_kv "$debug_flag"
    init_stack "$(pwd)" "$debug_flag"

    # run deno command directly to avoid the output from `deno task` i.e. Task init_kv ...
    forwards_out=$(deno run --allow-env --allow-read --allow-sys --allow-run --unstable-kv "$deno_working_dir/scripts/forwards.ts")
    if [[ "$2" == "--debug" ]]; then echo "forwards_out: $forwards_out"; fi
    if [[ "$forwards_out" == "__err" ]]
    then
      echo "Can't move forwards!"
      return
    else
      cd "$forwards_out"
    fi
    ;;
  --backwards)
    before_nav_pwd=$(pwd)

    if cd ".."
      init_kv "$debug_flag"
      init_stack "$before_nav_pwd" "$debug_flag"
      if [[ "$debug_flag" == "--debug" ]]
      then
        deno task --cwd="$deno_working_dir" backwards --after_nav_pwd="$(pwd)"
      else 
        (&>/dev/null deno task --cwd="$deno_working_dir" backwards --after_nav_pwd="$(pwd)" &)
      fi
    then
    fi
    ;;
  *)
    before_nav_pwd=$(pwd)
    if cd "$1"
    then 
      init_kv "$debug_flag"
      init_stack "$before_nav_pwd" "$debug_flag"

      after_nav_pwd=$(pwd)
      if [[ "$debug_flag" == "--debug" ]]
      then
        deno task --cwd="$deno_working_dir" push_stack --after_nav_pwd="$after_nav_pwd" "$1"
      else 
        (&>/dev/null deno task --cwd="$deno_working_dir" push_stack --after_nav_pwd="$after_nav_pwd" "$1" &)
      fi
    fi
    ;;
esac

total_end=`date +%s.%N`
if [[ "$debug_flag" == "--debug" ]]
then 
  get_runtime "$total_start" "$total_end" "Total"
fi

