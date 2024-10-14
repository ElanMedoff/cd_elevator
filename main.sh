current_pwd=$(pwd)

if ! deno task --cwd=$HOME/Desktop/cd_stack validate_args "$@"; then 
  echo 'error running `deno task validate_args`, exiting early'
  return
fi

if ! deno task --cwd=$HOME/Desktop/cd_stack init_kv; then
  echo 'error running `deno task init_kv`, exiting early'
  return
fi

if ! deno task --cwd=$HOME/Desktop/cd_stack init_stack --pwd="$current_pwd"; then
  echo 'error running `deno task init_stack`, exiting early'
  return
fi

case "$1" in 
  --forwards)
    forwards_out=$(deno task --cwd=$HOME/Desktop/cd_stack forwards)
    echo "forwards_out: $forwards_out"
    if [[ "$forwards_out" == 1 ]]; then
      return
    else
      cd "$forwards_out"
    fi
    ;;
  --backwards)
    backwards_out=$(deno task --cwd=$HOME/Desktop/cd_stack backwards --pwd="$current_pwd")
    echo "backwards_out: $backwards_out"
    if [[ "$backwards_out" == 1 ]]; then
      return
    else
      cd "$backwards_out"
    fi
    ;;
  --changeDir)
    if cd "$2"; then 
      deno task --cwd=$HOME/Desktop/cd_stack push_stack --pwd="$current_pwd" "$2"
    fi
    ;;
esac

deno task --cwd=$HOME/Desktop/cd_stack cleanup
