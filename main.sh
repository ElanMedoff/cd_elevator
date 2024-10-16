working_dir=$(pwd)
deno_working_dir="$HOME/Desktop/cd_stack"

# TODO: move async work after cd

if [[ "$2" == "--debug" ]]
then
  deno task --cwd="$deno_working_dir" init_kv
else
  deno task --cwd="$deno_working_dir" init_kv > /dev/null 2>&1
fi
init_kv_code="$?"
if [[ "$init_kv_code" != 0 ]]
then
  echo 'ERROR: error running `deno task init_kv`, exiting early'
  return
fi

if [[ "$2" == "--debug" ]]
then
  deno task --cwd="$deno_working_dir" init_stack --pwd="$working_dir"
else 
  deno task --cwd="$deno_working_dir" init_stack --pwd="$working_dir" > /dev/null 2>&1
fi
init_stack_code="$?"
if [[ "$init_stack_code" != 0 ]]
then
  echo 'ERROR: error running `deno task init_stack`, exiting early'
  return
fi

case "$1" in 
  --forwards)
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
    backwards_out=$(deno run --allow-env --allow-read --allow-sys --allow-run --unstable-kv "$deno_working_dir/scripts/backwards.ts" --pwd="$working_dir")
    if [[ "$2" == "--debug" ]]; then echo "backwards_out: $backwards_out"; fi
    cd "$backwards_out"
    ;;
  *)
    if cd "$1"
    then 
      if [[ "$2" == "--debug" ]]
      then
        deno task --cwd="$deno_working_dir" push_stack --pwd="$working_dir" "$1"
      else 
        deno task --cwd="$deno_working_dir" push_stack --pwd="$working_dir" "$1" > /dev/null 2>&1
      fi
    fi
    ;;
esac

# deno task --cwd=$HOME/Desktop/cd_stack cleanup
